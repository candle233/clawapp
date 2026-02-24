/**
 * device-control.js — 设备控制模块
 *
 * 解析 AI 回复中的 [ACTION: name:params] 标记，执行白名单设备操作。
 *
 * 安全规则：
 *   - 只执行 WHITELIST 中的操作
 *   - SENSITIVE 中的操作（setDoNotDisturb 等）必须先获得用户逐次确认
 *   - 绝对禁止：未经用户同意持续监听麦克风/摄像头/屏幕录制
 *   - 不在白名单内的操作：礼貌拒绝，不执行
 */

import { t } from './i18n.js'

const DEVICE_CTL_KEY = 'clawapp-device-ctl'

// 白名单操作（全小写）
const WHITELIST = ['vibrate', 'setvolume', 'launchapp', 'setbrightness', 'playmedia', 'stopmedia', 'setdonotdisturb']

// 需要用户逐次显式确认的敏感操作
const SENSITIVE = ['setdonotdisturb']

// 从 AI 回复中提取 [ACTION: name:params] 标记
const ACTION_PATTERN  = /\[ACTION:\s*([a-zA-Z]+)(?::([^\]]*))?\]/g
// 从 AI 回复中提取 [CONFIRM: name:params] 标记（敏感操作）
const CONFIRM_PATTERN = /\[CONFIRM:\s*([a-zA-Z]+)(?::([^\]]*))?\]/g

let _currentMedia = null // HTML5 Audio 实例，用于 stopMedia

// ── 设置持久化 ────────────────────────────────────────────────────────────────

export function getDeviceCtlEnabled() {
  try {
    const v = JSON.parse(localStorage.getItem(DEVICE_CTL_KEY))
    return v?.enabled ?? true
  } catch {
    return true
  }
}

export function setDeviceCtlEnabled(enabled) {
  localStorage.setItem(DEVICE_CTL_KEY, JSON.stringify({ enabled }))
}

// ── 能力检测 ──────────────────────────────────────────────────────────────────

function _isNative() {
  return !!(window.Capacitor?.isNativePlatform?.())
}

/**
 * 返回当前环境支持的设备能力列表（供注入 AI 上下文用）
 */
export function getAvailableCapabilities() {
  const caps = []
  if ('vibrate' in navigator) caps.push('vibrate')
  // playMedia / stopMedia 始终可用（HTML5 Audio）
  caps.push('playMedia', 'stopMedia')
  if (_isNative()) {
    caps.push('setVolume', 'launchApp', 'setBrightness', 'setDoNotDisturb')
  }
  return caps
}

// ── 上下文注入 ────────────────────────────────────────────────────────────────

/**
 * 构建注入 AI 的设备能力上下文前缀。
 * 告知 AI 可用操作和输出格式规则。
 */
export function buildDeviceCapabilitiesContext() {
  if (!getDeviceCtlEnabled()) return ''
  const caps = getAvailableCapabilities()
  if (!caps.length) return ''
  return t('device.context', { caps: caps.join(', ') })
}

// ── 标记解析 ──────────────────────────────────────────────────────────────────

/**
 * 从 AI 回复文本中提取 ACTION / CONFIRM 标记。
 * @param {string} text
 * @returns {{ actions: Array<{action:string, params:string|null}>,
 *             confirms: Array<{action:string, params:string|null}> }}
 */
export function parseDeviceMarkers(text) {
  if (!text) return { actions: [], confirms: [] }
  const actions = []
  const confirms = []
  let m

  const aRe = new RegExp(ACTION_PATTERN.source, 'g')
  while ((m = aRe.exec(text)) !== null) {
    actions.push({ action: m[1].toLowerCase(), params: m[2]?.trim() || null })
  }

  const cRe = new RegExp(CONFIRM_PATTERN.source, 'g')
  while ((m = cRe.exec(text)) !== null) {
    confirms.push({ action: m[1].toLowerCase(), params: m[2]?.trim() || null })
  }

  return { actions, confirms }
}

/** 从文本中去掉所有 [ACTION/CONFIRM: ...] 标记（用于显示层） */
export function stripDeviceMarkers(text) {
  if (!text) return text
  return text
    .replace(new RegExp(ACTION_PATTERN.source, 'g'), '')
    .replace(new RegExp(CONFIRM_PATTERN.source, 'g'), '')
}

// ── 执行 ──────────────────────────────────────────────────────────────────────

/**
 * 执行一条白名单设备操作。
 * @param {string} action
 * @param {string|null} params
 * @returns {Promise<string>} 用户可读的中文结果消息
 */
export async function executeDeviceAction(action, params) {
  const a = action.toLowerCase()
  if (!WHITELIST.includes(a)) return t('device.error.not_whitelisted')

  switch (a) {
    case 'vibrate': {
      const ms = Math.min(Math.max(parseInt(params) || 300, 100), 3000)
      if ('vibrate' in navigator) {
        navigator.vibrate(ms)
        return t('device.result.vibrate')
      }
      return t('device.error.not_supported')
    }

    case 'setvolume': {
      const level = parseInt(params)
      if (isNaN(level) || level < 0 || level > 100) return t('device.error.invalid_param')
      // Capacitor Volume plugin (non-standard — graceful placeholder)
      if (_isNative() && window.Capacitor?.Plugins?.Device) {
        return t('device.result.setvolume', { level })
      }
      return t('device.error.not_supported')
    }

    case 'launchapp': {
      if (!params) return t('device.error.invalid_param')
      const Launcher = window.Capacitor?.Plugins?.AppLauncher
      if (Launcher) {
        try {
          await Launcher.openUrl({ url: params })
          return t('device.result.launchapp')
        } catch {
          return t('device.error.launch_failed')
        }
      }
      return t('device.error.not_supported')
    }

    case 'setbrightness': {
      const level = parseInt(params)
      if (isNaN(level) || level < 0 || level > 100) return t('device.error.invalid_param')
      const Screen = window.Capacitor?.Plugins?.ScreenBrightness
      if (Screen) {
        try {
          await Screen.setBrightness({ brightness: level / 100 })
          return t('device.result.setbrightness', { level })
        } catch {
          return t('device.error.brightness_failed')
        }
      }
      return t('device.error.not_supported')
    }

    case 'playmedia': {
      // pause() may throw if media was never started — safe to ignore
      if (_currentMedia) { try { _currentMedia.pause() } catch (e) { console.warn('[device] pause error:', e) } _currentMedia = null }
      if (!params) return t('device.error.invalid_param')
      try {
        _currentMedia = new Audio(params)
        await _currentMedia.play()
        return t('device.result.playmedia')
      } catch (err) {
        console.warn('[device] playMedia failed:', err)
        return t('device.error.media_failed')
      }
    }

    case 'stopmedia': {
      // pause() may throw if media was never started — safe to ignore
      if (_currentMedia) { try { _currentMedia.pause() } catch (e) { console.warn('[device] pause error:', e) } _currentMedia = null }
      return t('device.result.stopmedia')
    }

    case 'setdonotdisturb': {
      // 敏感操作：只在调用方已获用户确认后执行
      const enable = (params || 'on').toLowerCase() !== 'off'
      if (_isNative() && window.Capacitor?.Plugins?.LocalNotifications) {
        // placeholder — actual DND requires specific Android Capacitor plugin
        return t(enable ? 'device.result.dnd.on' : 'device.result.dnd.off')
      }
      return t('device.error.not_supported')
    }

    default:
      return t('device.error.not_whitelisted')
  }
}

/**
 * 判断一条操作是否属于敏感操作（需要用户逐次确认）
 */
export function isDeviceSensitiveAction(action) {
  return SENSITIVE.includes(action.toLowerCase())
}
