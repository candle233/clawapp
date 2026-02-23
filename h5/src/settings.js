/**
 * 设置面板 - 主题/语言/连接管理
 */

import { getTheme, setTheme } from './theme.js'
import { getLang, setLang, t, onLangChange } from './i18n.js'
import { getTtsAuto, setTtsAuto } from './tts.js'
import { renderDndSection } from './broadcast-center.js'

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

      <div class="settings-section" style="margin-top:16px">
        <button class="settings-disconnect-btn" id="settings-disconnect">
          ${t('settings.disconnect')}
        </button>
      </div>
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

  // 断开连接
  panel.querySelector('#settings-disconnect').onclick = () => {
    closeSettings()
    _onDisconnect?.()
  }

  document.body.appendChild(overlay)
  document.body.appendChild(panel)
}

function closeSettings() {
  document.querySelector('.settings-overlay')?.remove()
  document.querySelector('.settings-panel')?.remove()
}
