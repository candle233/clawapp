/**
 * 设置面板 - 主题/语言/连接管理
 */

import { getTheme, setTheme } from './theme.js'
import { getLang, setLang, t, onLangChange } from './i18n.js'
import { getTtsAuto, setTtsAuto } from './tts.js'
import { renderDndSection } from './broadcast-center.js'
import { isSpeechSupported, getVoiceAutoSend, setVoiceAutoSend } from './voice-input.js'
import { isNative, getNativeSettings, setNativeSettings, applyNativeSettings } from './native-mode.js'
import { getMemoryEnabled, setMemoryEnabled } from './memory.js'
import { getPersonaEnabled, setPersonaEnabled } from './persona.js'

let _onDisconnect = null

export function initSettings(onDisconnect) {
  _onDisconnect = onDisconnect
}

export function showSettings() {
  document.querySelector('.settings-overlay')?.remove()
  document.querySelector('.settings-panel')?.remove()

  const overlay = document.createElement('div')
  overlay.className = 'settings-overlay cmd-overlay visible'
  overlay.onclick = () => closeSettings()

  const panel = document.createElement('div')
  panel.className = 'settings-panel cmd-panel visible'

  const currentTheme = getTheme()
  const currentLang = getLang()

  panel.innerHTML = `
    <div class="cmd-panel-header">
      <h3>${t('settings.title')}</h3>
      <button class="close-btn">×</button>
    </div>
    <div class="settings-content cmd-list">
      <div class="settings-section">
        <div class="settings-label">${t('settings.theme')}</div>
        <div class="settings-toggle-group" id="theme-toggle">
          <button class="settings-toggle ${currentTheme === 'light' ? 'active' : ''}" data-value="light">
            ☀️ ${t('settings.theme.light')}
          </button>
          <button class="settings-toggle ${currentTheme === 'dark' ? 'active' : ''}" data-value="dark">
            🌙 ${t('settings.theme.dark')}
          </button>
          <button class="settings-toggle ${currentTheme === 'auto' ? 'active' : ''}" data-value="auto">
            🔄 ${t('settings.theme.auto')}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">${t('settings.lang')}</div>
        <div class="settings-toggle-group" id="lang-toggle">
          <button class="settings-toggle ${currentLang === 'zh-CN' ? 'active' : ''}" data-value="zh-CN">
            中文
          </button>
          <button class="settings-toggle ${currentLang === 'en' ? 'active' : ''}" data-value="en">
            English
          </button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-label">${t('tts.auto')}</div>
        <div class="settings-toggle-group" id="tts-auto-toggle">
          <button class="settings-toggle ${getTtsAuto() ? '' : 'active'}" data-value="off">
            🔇 ${t('tts.auto.off')}
          </button>
          <button class="settings-toggle ${getTtsAuto() ? 'active' : ''}" data-value="on">
            🔊 ${t('tts.auto.on')}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <div id="dnd-section"></div>
      </div>

      <div class="settings-section">
        <div class="settings-label">🧠 ${t('memory.settings.label')}</div>
        <div class="settings-toggle-group" id="memory-toggle">
          <button class="settings-toggle ${getMemoryEnabled() ? '' : 'active'}" data-value="off">
            ${t('memory.settings.off')}
          </button>
          <button class="settings-toggle ${getMemoryEnabled() ? 'active' : ''}" data-value="on">
            ${t('memory.settings.on')}
          </button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">${t('memory.settings.hint')}</div>
      </div>

      <div class="settings-section">
        <div class="settings-label">✨ ${t('persona.settings.label')}</div>
        <div class="settings-toggle-group" id="persona-toggle">
          <button class="settings-toggle ${getPersonaEnabled() ? '' : 'active'}" data-value="off">
            ${t('persona.settings.off')}
          </button>
          <button class="settings-toggle ${getPersonaEnabled() ? 'active' : ''}" data-value="on">
            ${t('persona.settings.on')}
          </button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">${t('persona.settings.hint')}</div>
      </div>

      ${isSpeechSupported() ? `
      <div class="settings-section">
        <div class="settings-label">${t('voice.auto.send')}</div>
        <div class="settings-toggle-group" id="voice-auto-toggle">
          <button class="settings-toggle ${getVoiceAutoSend() ? '' : 'active'}" data-value="off">
            ✉️ ${t('voice.auto.send.off')}
          </button>
          <button class="settings-toggle ${getVoiceAutoSend() ? 'active' : ''}" data-value="on">
            🚀 ${t('voice.auto.send.on')}
          </button>
        </div>
      </div>
      ` : ''}

      <div class="settings-section" style="margin-top:16px">
        <button class="settings-disconnect-btn" id="settings-disconnect">
          ${t('settings.disconnect')}
        </button>
      </div>

      ${isNative() ? `
      <div class="settings-section" style="margin-top:8px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="settings-label">🤖 ${t('native.title')}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${t('native.desc')}</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;color:var(--text-secondary)">${t('native.resident')}</span>
            <label class="dnd-switch">
              <input type="checkbox" id="native-resident-toggle" ${getNativeSettings().residentEnabled ? 'checked' : ''} />
              <span class="dnd-track"></span>
            </label>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;color:var(--text-secondary)">${t('native.wakeword')}</span>
            <label class="dnd-switch">
              <input type="checkbox" id="native-wakeword-toggle" ${getNativeSettings().wakeWordEnabled ? 'checked' : ''} />
              <span class="dnd-track"></span>
            </label>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;color:var(--text-secondary)">${t('native.autotts')}</span>
            <label class="dnd-switch">
              <input type="checkbox" id="native-autotts-toggle" ${getNativeSettings().autoTts ? 'checked' : ''} />
              <span class="dnd-track"></span>
            </label>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:12px;line-height:1.6">${t('native.battery.tip')}</div>
      </div>
      ` : ''}
    </div>
  `

  panel.querySelector('.close-btn').onclick = () => closeSettings()

  // 主题切换
  panel.querySelectorAll('#theme-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value
      setTheme(value)
      panel.querySelectorAll('#theme-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    }
  })

  // 语言切换
  panel.querySelectorAll('#lang-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value
      setLang(value)
      panel.querySelectorAll('#lang-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      // 语言切换后重建面板
      closeSettings()
      showSettings()
    }
  })

  // TTS 自动播报切换
  panel.querySelectorAll('#tts-auto-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value === 'on'
      setTtsAuto(value)
      panel.querySelectorAll('#tts-auto-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    }
  })

  // DND 免打扰设置
  renderDndSection(panel.querySelector('#dnd-section'))

  // 长期记忆开关
  panel.querySelectorAll('#memory-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value === 'on'
      setMemoryEnabled(value)
      panel.querySelectorAll('#memory-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    }
  })

  // 个性化推荐开关
  panel.querySelectorAll('#persona-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value === 'on'
      setPersonaEnabled(value)
      panel.querySelectorAll('#persona-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    }
  })

  // 语音自动发送
  if (isSpeechSupported()) {
    panel.querySelectorAll('#voice-auto-toggle .settings-toggle').forEach(btn => {
      btn.onclick = () => {
        const value = btn.dataset.value === 'on'
        setVoiceAutoSend(value)
        panel.querySelectorAll('#voice-auto-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      }
    })
  }

  // 断开连接
  panel.querySelector('#settings-disconnect').onclick = () => {
    closeSettings()
    _onDisconnect?.()
  }

  // 常驻模式设置（APK 专属）
  if (isNative()) {
    const syncNative = () => {
      const s = getNativeSettings()
      setNativeSettings({
        residentEnabled: panel.querySelector('#native-resident-toggle')?.checked ?? s.residentEnabled,
        wakeWordEnabled: panel.querySelector('#native-wakeword-toggle')?.checked ?? s.wakeWordEnabled,
        autoTts: panel.querySelector('#native-autotts-toggle')?.checked ?? s.autoTts,
      })
      applyNativeSettings()
    }
    panel.querySelector('#native-resident-toggle')?.addEventListener('change', syncNative)
    panel.querySelector('#native-wakeword-toggle')?.addEventListener('change', syncNative)
    panel.querySelector('#native-autotts-toggle')?.addEventListener('change', syncNative)
  }

  document.body.appendChild(overlay)
  document.body.appendChild(panel)
}

function closeSettings() {
  document.querySelector('.settings-overlay')?.remove()
  document.querySelector('.settings-panel')?.remove()
}
