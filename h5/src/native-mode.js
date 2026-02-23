/**
 * native-mode.js — APK 常驻模式集成
 *
 * 检测 Capacitor 运行环境，封装 ClawPlugin 插件调用。
 * 在 H5/PWA 浏览器环境中所有调用均为无操作（不破坏现有功能）。
 *
 * 提供：
 *   isNative()               — 是否在 Capacitor APK 中运行
 *   getNativeSettings()      — 获取持久化的常驻设置
 *   setNativeSettings(opts)  — 保存设置
 *   applyNativeSettings()    — 根据当前设置启动/停止服务
 *   initNativeMode(onWakeWord) — 初始化；注册唤醒词回调
 */

import { t } from './i18n.js'

const NATIVE_SETTINGS_KEY = 'clawapp-native-settings'

const DEFAULT_SETTINGS = {
  residentEnabled:  false,  // 总开关：前台服务常驻
  wakeWordEnabled:  true,   // 唤醒词监听开关
  autoTts:          true,   // assistant 回复自动 TTS
}

// ── 运行环境检测 ──────────────────────────────────────────────────────────────

export function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform?.())
}

/** 获取 ClawPlugin 插件实例（仅 APK 环境有效） */
function getPlugin() {
  if (!isNative()) return null
  return window.Capacitor?.Plugins?.Claw ?? null
}

// ── 设置持久化 ────────────────────────────────────────────────────────────────

export function getNativeSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(NATIVE_SETTINGS_KEY))
    return { ...DEFAULT_SETTINGS, ...(saved || {}) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function setNativeSettings(opts) {
  const current = getNativeSettings()
  const merged = { ...current, ...opts }
  localStorage.setItem(NATIVE_SETTINGS_KEY, JSON.stringify(merged))
  return merged
}

// ── 服务控制 ──────────────────────────────────────────────────────────────────

export async function applyNativeSettings() {
  const plugin = getPlugin()
  if (!plugin) return

  const settings = getNativeSettings()

  if (settings.residentEnabled) {
    try {
      await plugin.startService({
        wakeWordEnabled: settings.wakeWordEnabled,
        autoTts:         settings.autoTts,
      })
    } catch (err) {
      console.warn('[native] startService failed:', err)
      _showNativeToast(t('native.error.permission'))
    }
  } else {
    try {
      await plugin.stopService()
    } catch {
      // ignore
    }
  }
}

// ── 初始化 ────────────────────────────────────────────────────────────────────

/**
 * 初始化常驻模式
 * @param {Function} onWakeWord - 检测到唤醒词时的回调，参数为 null（触发语音输入流程）
 */
export function initNativeMode(onWakeWord) {
  if (!isNative()) return

  const plugin = getPlugin()
  if (!plugin) return

  // 监听唤醒词事件
  plugin.addListener('wakeWord', () => {
    console.log('[native] wakeWord received')
    onWakeWord?.()
  })

  // 监听服务状态变更
  plugin.addListener('serviceState', (data) => {
    console.log('[native] serviceState:', data.running)
    _updateNativeBadge(data.running)
  })

  // 应用已保存的设置（重新进入 App 时自动恢复服务）
  const settings = getNativeSettings()
  if (settings.residentEnabled) {
    applyNativeSettings()
  }
}

// ── UI 辅助 ───────────────────────────────────────────────────────────────────

function _showNativeToast(text) {
  const existing = document.querySelector('.native-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = 'tts-toast native-toast'  // reuse tts-toast style
  toast.textContent = text
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

function _updateNativeBadge(running) {
  // 在标题旁显示小点表示服务运行状态
  const dot = document.getElementById('status-dot')
  if (!dot) return
  // 服务运行时额外加 native-active class，CSS 可以显示特殊颜色
  dot.classList.toggle('native-active', running)
}
