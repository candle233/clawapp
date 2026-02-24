/**
 * memory.js — 长期记忆模块
 *
 * 功能：
 * - 将用户偏好/习惯以文本条目形式持久化存储在 localStorage
 * - 发送消息时将记忆条目作为上下文前缀注入 AI（用户气泡中不显示）
 * - 提供记忆管理面板（查看 / 新增 / 删除）
 * - 支持开关：记忆注入可全局开启/关闭
 */

import { t } from './i18n.js'

const MEMORY_STORE_KEY    = 'clawapp-memories'
const MEMORY_ENABLED_KEY  = 'clawapp-memory-enabled'
const MAX_MEMORIES        = 50   // 最多保留条目数

// ── 数据 CRUD ─────────────────────────────────────────────────────────────────

/** 获取全部记忆条目 */
export function getMemories() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_STORE_KEY)) || []
  } catch {
    return []
  }
}

/** 添加一条记忆 */
export function addMemory(text) {
  text = text.trim()
  if (!text) return null
  const memories = getMemories()
  const id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 9))
  const item = { id, text, createdAt: Date.now() }
  memories.unshift(item)
  if (memories.length > MAX_MEMORIES) memories.length = MAX_MEMORIES
  localStorage.setItem(MEMORY_STORE_KEY, JSON.stringify(memories))
  return item
}

/** 删除一条记忆 */
export function deleteMemory(id) {
  const memories = getMemories().filter(m => m.id !== id)
  localStorage.setItem(MEMORY_STORE_KEY, JSON.stringify(memories))
}

/** 清空全部记忆 */
export function clearMemories() {
  localStorage.removeItem(MEMORY_STORE_KEY)
}

// ── 开关 ──────────────────────────────────────────────────────────────────────

export function getMemoryEnabled() {
  return localStorage.getItem(MEMORY_ENABLED_KEY) !== 'false'  // 默认开启
}

export function setMemoryEnabled(val) {
  localStorage.setItem(MEMORY_ENABLED_KEY, val ? 'true' : 'false')
}

// ── 上下文构建 ────────────────────────────────────────────────────────────────

/**
 * 构建注入到 AI 的记忆上下文前缀。
 * 返回 null 表示无需注入（记忆为空或已关闭）。
 */
export function buildMemoryContext() {
  if (!getMemoryEnabled()) return null
  const memories = getMemories()
  if (!memories.length) return null

  const lines = memories.map(m => `- ${m.text}`).join('\n')
  return `[${t('memory.context.header')}]\n${lines}\n${t('memory.context.separator')}\n`
}

// ── 记忆管理面板 ──────────────────────────────────────────────────────────────

let _panel = null
let _overlay = null

export function showMemoryPanel() {
  _closeMemoryPanel()

  _overlay = document.createElement('div')
  _overlay.className = 'settings-overlay cmd-overlay visible'
  _overlay.onclick = _closeMemoryPanel

  _panel = document.createElement('div')
  _panel.className = 'settings-panel cmd-panel visible memory-panel'

  _renderPanel()

  document.body.appendChild(_overlay)
  document.body.appendChild(_panel)
}

function _renderPanel() {
  const memories = getMemories()

  _panel.innerHTML = `
    <div class="cmd-panel-header">
      <h3>🧠 ${t('memory.title')}</h3>
      <button class="close-btn">×</button>
    </div>
    <div class="settings-content cmd-list">
      <div class="memory-add-row">
        <textarea
          id="memory-new-input"
          class="memory-new-input"
          placeholder="${t('memory.add.placeholder')}"
          rows="2"
        ></textarea>
        <button class="memory-add-btn" id="memory-add-btn">${t('memory.add')}</button>
      </div>

      <div class="memory-list" id="memory-list">
        ${memories.length === 0
          ? `<div class="memory-empty">${t('memory.empty')}</div>`
          : memories.map(m => `
              <div class="memory-item" data-id="${m.id}">
                <span class="memory-text">${_escapeHtml(m.text)}</span>
                <button class="memory-delete-btn" data-id="${m.id}" title="${t('memory.delete')}">×</button>
              </div>
            `).join('')
        }
      </div>

      ${memories.length > 0 ? `
        <div style="text-align:right;margin-top:8px">
          <button class="memory-clear-btn" id="memory-clear-btn">${t('memory.clear')}</button>
        </div>
      ` : ''}

      <div class="memory-hint">${t('memory.hint')}</div>
    </div>
  `

  _panel.querySelector('.close-btn').onclick = _closeMemoryPanel

  // 添加
  const addBtn  = _panel.querySelector('#memory-add-btn')
  const addInput = _panel.querySelector('#memory-new-input')
  const doAdd = () => {
    const text = addInput.value.trim()
    if (!text) return
    addMemory(text)
    addInput.value = ''
    _renderPanel()
  }
  addBtn.onclick = doAdd
  addInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doAdd() }
  })

  // 删除单条
  _panel.querySelectorAll('.memory-delete-btn').forEach(btn => {
    btn.onclick = () => {
      deleteMemory(btn.dataset.id)
      _renderPanel()
    }
  })

  // 清空全部
  _panel.querySelector('#memory-clear-btn')?.addEventListener('click', () => {
    clearMemories()
    _renderPanel()
  })
}

function _closeMemoryPanel() {
  _overlay?.remove(); _overlay = null
  _panel?.remove();   _panel   = null
}

function _escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
