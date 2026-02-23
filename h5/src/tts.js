/**
 * TTS（语音播报）模块
 *
 * - 通过 wsClient.request('tts.convert', { text }) 调用 Gateway RPC
 * - 拿到音频数据后使用 HTMLAudioElement 播放
 * - 支持 loading / playing / failed 三种状态
 * - 提供自动播报设置（存于 localStorage）
 */

import { wsClient } from './ws-client.js'
import { t } from './i18n.js'

const TTS_AUTO_KEY = 'clawapp-tts-auto'

const SVG_SPEAKER = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>`
const SVG_PAUSE   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
const SVG_SPIN    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tts-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>`

export function getTtsAuto() {
  return localStorage.getItem(TTS_AUTO_KEY) === 'true'
}

export function setTtsAuto(val) {
  localStorage.setItem(TTS_AUTO_KEY, val ? 'true' : 'false')
}

/**
 * 将 TTS 播放按钮附加到 AI 消息的 wrapper 元素中。
 * @param {HTMLElement} wrapper  - `.msg.ai` 包装元素
 * @param {string|Function} getText - 消息文本或返回文本的函数
 * @returns {HTMLButtonElement}
 */
export function addTtsButton(wrapper, getText) {
  const btn = document.createElement('button')
  btn.className = 'tts-btn'
  btn.title = t('tts.play')
  btn.innerHTML = SVG_SPEAKER

  let currentAudio = null

  btn.onclick = async () => {
    if (btn.dataset.state === 'playing') {
      // 点击暂停
      currentAudio?.pause()
      currentAudio = null
      _setState(btn, 'idle')
      return
    }
    if (btn.dataset.state === 'loading') return

    const text = typeof getText === 'function' ? getText() : getText
    if (!text) return

    _setState(btn, 'loading')
    try {
      const audio = await _fetchAndCreateAudio(text)
      currentAudio = audio

      _setState(btn, 'playing')

      audio.onended = () => {
        currentAudio = null
        _setState(btn, 'idle')
      }
      audio.onerror = () => {
        currentAudio = null
        _setState(btn, 'failed')
        _showError()
      }

      await audio.play()
    } catch (err) {
      console.error('[tts] error:', err)
      currentAudio = null
      _setState(btn, 'failed')
      _showError()
    }
  }

  // 将按钮插入时间戳元素内，形成 [🔊] 10:30 同行布局
  const time = wrapper.querySelector('.msg-time')
  if (time) {
    time.style.display = 'flex'
    time.style.alignItems = 'center'
    time.style.gap = '4px'
    time.prepend(btn)
  } else {
    wrapper.appendChild(btn)
  }

  return btn
}

/**
 * 调用 tts.convert RPC 并返回可播放的 HTMLAudioElement。
 * 支持完整音频响应（base64 编码）。
 */
async function _fetchAndCreateAudio(text) {
  const result = await wsClient.request('tts.convert', { text })

  // 兼容多种响应格式：{ audio, format } / { data, mimeType } / 纯 base64 字符串
  let base64, mimeType
  if (result?.audio) {
    base64 = result.audio
    mimeType = result.format ? `audio/${result.format}` : 'audio/mpeg'
  } else if (result?.data) {
    base64 = result.data
    mimeType = result.mimeType || result.contentType || 'audio/mpeg'
  } else if (typeof result === 'string') {
    base64 = result
    mimeType = 'audio/mpeg'
  } else {
    throw new Error('invalid tts response')
  }

  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true })
  return audio
}

function _setState(btn, state) {
  btn.dataset.state = state
  btn.className = `tts-btn tts-btn--${state}`
  if (state === 'loading') btn.innerHTML = SVG_SPIN
  else if (state === 'playing') btn.innerHTML = SVG_PAUSE
  else btn.innerHTML = SVG_SPEAKER
  btn.title = t(`tts.${state === 'idle' ? 'play' : state}`)
}

function _showError() {
  // 对用户展示友好提示，不暴露底层细节
  const existing = document.querySelector('.tts-toast')
  if (existing) return
  const toast = document.createElement('div')
  toast.className = 'tts-toast'
  toast.textContent = t('tts.error')
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}
