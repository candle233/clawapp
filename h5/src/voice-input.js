/**
 * 语音输入模块 — Web Speech API 封装
 *
 * 支持：
 * - 按住/点击麦克风按钮开始识别，松开/再次点击结束
 * - 识别结果填入输入框；可配置"识别完成后自动发送"
 * - 状态：idle → listening → (result) → idle / error
 * - 不支持时隐藏按钮并提示用户
 */

import { t } from './i18n.js'

const VOICE_AUTO_SEND_KEY = 'clawapp-voice-auto-send'

const SVG_MIC = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
const SVG_MIC_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`

export function getVoiceAutoSend() {
  return localStorage.getItem(VOICE_AUTO_SEND_KEY) !== 'false'  // default true
}

export function setVoiceAutoSend(val) {
  localStorage.setItem(VOICE_AUTO_SEND_KEY, val ? 'true' : 'false')
}

/**
 * 检测浏览器是否支持 Web Speech API
 */
export function isSpeechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * 初始化语音输入按钮
 *
 * @param {HTMLButtonElement} btn        - 麦克风按钮
 * @param {HTMLTextAreaElement} textarea - 目标输入框
 * @param {Function} onResult            - (text: string) => void 识别完成回调
 * @param {Function} onSend              - () => void 自动发送回调
 */
export function initVoiceInput(btn, textarea, onResult, onSend) {
  if (!isSpeechSupported()) {
    btn.style.display = 'none'
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition = null
  let _listening = false
  let _holdMode = false      // true = 按住说话 (pointerdown/pointerup)
  let _tapMode = false       // true = 点击切换
  let _transcript = ''

  // ── 状态更新 ──────────────────────────────────────────────────────────────

  function setState(state) {
    btn.dataset.voiceState = state
    btn.className = btn.className.replace(/\bvoice-btn--\S+/g, '').trim()
    if (state === 'listening') {
      btn.classList.add('voice-btn--listening')
      btn.title = t('voice.stop')
      btn.innerHTML = SVG_MIC_OFF
    } else if (state === 'error') {
      btn.classList.add('voice-btn--error')
      btn.title = t('voice.start')
      btn.innerHTML = SVG_MIC
    } else {
      btn.title = t('voice.start')
      btn.innerHTML = SVG_MIC
    }
  }

  // ── 识别实例 ──────────────────────────────────────────────────────────────

  function createRecognition() {
    const r = new SpeechRecognition()
    r.continuous = true
    r.interimResults = true
    // 跟随应用语言
    const lang = document.documentElement.lang || navigator.language || 'zh-CN'
    r.lang = lang

    r.onstart = () => {
      _listening = true
      _transcript = ''
      setState('listening')
    }

    r.onresult = (e) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) final += res[0].transcript
        else interim += res[0].transcript
      }
      if (final) {
        textarea.value = textarea.value + final
      } else if (interim) {
        // 展示当前轮次中间结果（不覆盖之前的 final 结果）
        textarea.value = _transcript + interim
      }
      if (final) _transcript = textarea.value
      textarea.dispatchEvent(new Event('input'))
    }

    r.onerror = (e) => {
      _listening = false
      recognition = null
      // 忽略 aborted（用户主动停止）
      if (e.error === 'aborted' || e.error === 'no-speech') {
        setState('idle')
        return
      }
      setState('error')
      _showVoiceError(e.error)
    }

    r.onend = () => {
      _listening = false
      recognition = null
      if (btn.dataset.voiceState === 'listening') setState('idle')
      // 自动发送
      if (getVoiceAutoSend() && textarea.value.trim()) {
        onResult?.(textarea.value.trim())
        onSend?.()
      } else if (textarea.value.trim()) {
        onResult?.(textarea.value.trim())
      }
    }

    return r
  }

  function startListening() {
    if (_listening) return
    recognition = createRecognition()
    try { recognition.start() } catch (e) {
      console.error('[voice] start error:', e)
      setState('error')
      _showVoiceError('generic')
    }
  }

  function stopListening() {
    if (!_listening || !recognition) return
    try { recognition.stop() } catch (e) {
      console.error('[voice] stop error:', e)
    }
  }

  // ── 交互：同时支持"按住说话"（touch）和"点击切换"（click）─────────────────

  // 长按检测（> 300ms 视为按住模式）
  let _pressTimer = null
  let _didLongPress = false

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    _didLongPress = false
    _pressTimer = setTimeout(() => {
      _didLongPress = true
      _holdMode = true
      startListening()
    }, 300)
  })

  btn.addEventListener('pointerup', (e) => {
    e.preventDefault()
    clearTimeout(_pressTimer)
    if (_holdMode) {
      _holdMode = false
      stopListening()
      return
    }
    // 短按 = 点击切换
    if (!_didLongPress) {
      if (_listening) {
        stopListening()
      } else {
        startListening()
      }
    }
  })

  btn.addEventListener('pointerleave', () => {
    clearTimeout(_pressTimer)
    if (_holdMode) {
      _holdMode = false
      stopListening()
    }
  })

  btn.addEventListener('pointercancel', () => {
    clearTimeout(_pressTimer)
    if (_holdMode) {
      _holdMode = false
      stopListening()
    }
  })

  setState('idle')
}

// ── 错误提示 ──────────────────────────────────────────────────────────────────

function _showVoiceError(errorCode) {
  const existing = document.querySelector('.voice-toast')
  if (existing) existing.remove()

  const msgs = {
    'not-allowed':       t('voice.error.permission'),
    'network':           t('voice.error.network'),
    'service-not-allowed': t('voice.error.permission'),
  }
  const text = msgs[errorCode] || t('voice.error.generic')

  const toast = document.createElement('div')
  toast.className = 'tts-toast voice-toast'  // 复用 tts-toast 样式
  toast.textContent = text
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}
