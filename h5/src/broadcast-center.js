/**
 * 播报中心模块
 *
 * - 接收 proxy.push 事件，存储最近 N 条系统播报
 * - 支持一键 TTS 播放
 * - 支持免打扰时间段设置（DND）
 * - 未读数 badge
 */

import { t } from './i18n.js'
import { addTtsButton } from './tts.js'

const BROADCASTS_KEY = 'clawapp-broadcasts'
const DND_KEY        = 'clawapp-dnd'
const MAX_ITEMS      = 50
const TOAST_BODY_LEN = 80

let _unread = 0
let _onBadgeChange = null

// ── 存储 ──────────────────────────────────────────────────────────────────────

function loadBroadcasts() {
  try { return JSON.parse(localStorage.getItem(BROADCASTS_KEY)) || [] } catch { return [] }
}

function saveBroadcasts(items) {
  localStorage.setItem(BROADCASTS_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

function addBroadcast(item) {
  const items = loadBroadcasts()
  items.unshift(item)
  saveBroadcasts(items)
}

// ── DND ───────────────────────────────────────────────────────────────────────

export function getDndConfig() {
  try { return JSON.parse(localStorage.getItem(DND_KEY)) || { enabled: false, start: '22:00', end: '08:00' } }
  catch { return { enabled: false, start: '22:00', end: '08:00' } }
}

export function setDndConfig(cfg) {
  localStorage.setItem(DND_KEY, JSON.stringify(cfg))
}

export function isDnd() {
  const cfg = getDndConfig()
  if (!cfg.enabled) return false
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = cfg.start.split(':').map(Number)
  const [eh, em] = cfg.end.split(':').map(Number)
  const start = sh * 60 + sm
  const end   = eh * 60 + em
  // 支持跨午夜范围，如 22:00 → 08:00
  return start <= end ? (cur >= start && cur < end) : (cur >= start || cur < end)
}

// ── 推送处理 ──────────────────────────────────────────────────────────────────

export function handlePushEvent(data) {
  const item = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: data?.title || '',
    body: data?.body || '',
    timestamp: data?.timestamp || Date.now(),
    read: false,
  }
  addBroadcast(item)

  if (!isDnd()) {
    _unread++
    _onBadgeChange?.(_unread)
    _showPushToast(item)
  }
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export function initBroadcastCenter(onBadgeChange) {
  _onBadgeChange = onBadgeChange
  // 统计未读：打开播报中心前一直累计
}

export function resetUnread() {
  _unread = 0
  _onBadgeChange?.(0)
}

// ── 推送 Toast ────────────────────────────────────────────────────────────────

function _showPushToast(item) {
  const existing = document.querySelector('.push-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'push-toast'
  toast.innerHTML = `
    <div class="push-toast-title">${_esc(item.title || t('broadcast.push'))}</div>
    ${item.body ? `<div class="push-toast-body">${_esc(item.body.substring(0, TOAST_BODY_LEN))}${item.body.length > TOAST_BODY_LEN ? '…' : ''}</div>` : ''}
  `
  toast.onclick = () => { toast.remove(); showBroadcastCenter() }
  document.body.appendChild(toast)

  const timer = setTimeout(() => toast.remove(), 6000)
  toast.addEventListener('click', () => clearTimeout(timer), { once: true })
}

// ── 播报中心面板 ──────────────────────────────────────────────────────────────

export function showBroadcastCenter() {
  document.querySelector('.broadcast-overlay')?.remove()
  document.querySelector('.broadcast-panel')?.remove()

  resetUnread()

  const overlay = document.createElement('div')
  overlay.className = 'broadcast-overlay cmd-overlay visible'
  overlay.onclick = () => _close()

  const panel = document.createElement('div')
  panel.className = 'broadcast-panel cmd-panel visible'

  const items = loadBroadcasts()

  panel.innerHTML = `
    <div class="cmd-panel-header">
      <h3>${t('broadcast.title')}</h3>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="broadcast-clear-btn" id="broadcast-clear">${t('broadcast.clear')}</button>
        <button class="close-btn">×</button>
      </div>
    </div>
    <div class="broadcast-list cmd-list" id="broadcast-list">
      ${items.length === 0
        ? `<div class="broadcast-empty">${t('broadcast.empty')}</div>`
        : items.map((it, i) => _renderItem(it, i)).join('')}
    </div>
  `

  panel.querySelector('.close-btn').onclick = () => _close()
  panel.querySelector('#broadcast-clear').onclick = () => {
    saveBroadcasts([])
    panel.querySelector('#broadcast-list').innerHTML = `<div class="broadcast-empty">${t('broadcast.empty')}</div>`
  }

  // 绑定 TTS 按钮（delegated，因为 addTtsButton 需要 wrapper element）
  document.body.appendChild(overlay)
  document.body.appendChild(panel)

  // 为每条附加 TTS 按钮
  items.forEach((item, i) => {
    const el = panel.querySelector(`[data-bid="${i}"]`)
    if (!el || !item.body) return
    const sep = document.documentElement.lang?.startsWith('zh') ? '。' : '. '
    const text = [item.title, item.body].filter(Boolean).join(sep)
    addTtsButton(el, text)
  })
}

function _renderItem(item, idx) {
  const d = new Date(item.timestamp)
  const timeStr = `${d.getFullYear()}-${_pad(d.getMonth()+1)}-${_pad(d.getDate())} ${_pad(d.getHours())}:${_pad(d.getMinutes())}`
  return `
    <div class="broadcast-item" data-bid="${idx ?? 0}">
      ${item.title ? `<div class="broadcast-item-title">${_esc(item.title)}</div>` : ''}
      ${item.body  ? `<div class="broadcast-item-body">${_esc(item.body)}</div>` : ''}
      <div class="broadcast-item-time msg-time">${timeStr}</div>
    </div>
  `
}

function _close() {
  document.querySelector('.broadcast-overlay')?.remove()
  document.querySelector('.broadcast-panel')?.remove()
}

// ── DND 设置辅助（供 settings.js 调用） ───────────────────────────────────────

/**
 * 渲染 DND 设置行，插入到指定容器元素中
 * @param {HTMLElement} container
 */
export function renderDndSection(container) {
  const cfg = getDndConfig()
  container.innerHTML = `
    <div class="settings-label">${t('broadcast.dnd')}</div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label class="dnd-switch">
        <input type="checkbox" id="dnd-enabled" ${cfg.enabled ? 'checked' : ''} />
        <span class="dnd-track"></span>
      </label>
      <span style="font-size:13px;color:var(--text-secondary)">${t('broadcast.dnd.range')}</span>
      <input type="time" id="dnd-start" value="${cfg.start}"
        style="width:90px;height:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:0 8px;color:var(--text-primary);font-size:13px;outline:none" />
      <span style="color:var(--text-muted)">–</span>
      <input type="time" id="dnd-end" value="${cfg.end}"
        style="width:90px;height:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:0 8px;color:var(--text-primary);font-size:13px;outline:none" />
    </div>
  `

  const sync = () => {
    setDndConfig({
      enabled: container.querySelector('#dnd-enabled').checked,
      start: container.querySelector('#dnd-start').value || '22:00',
      end:   container.querySelector('#dnd-end').value   || '08:00',
    })
  }
  container.querySelector('#dnd-enabled').onchange = sync
  container.querySelector('#dnd-start').onchange   = sync
  container.querySelector('#dnd-end').onchange     = sync
}

// ── 工具 ──────────────────────────────────────────────────────────────────────

function _esc(str) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function _pad(n) { return String(n).padStart(2, '0') }
