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
import { getPersonaEnabled, setPersonaEnabled, resetPersonaStats, getTopicStats } from './persona.js'
import { getDeviceCtlEnabled, setDeviceCtlEnabled } from './device-control.js'

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
        <div id="persona-stats"></div>
      </div>

      <div class="settings-section">
        <div class="settings-label">${t('device.settings.label')}</div>
        <div class="settings-toggle-group" id="device-ctl-toggle">
          <button class="settings-toggle ${getDeviceCtlEnabled() ? '' : 'active'}" data-value="off">
            ${t('device.settings.off')}
          </button>
          <button class="settings-toggle ${getDeviceCtlEnabled() ? 'active' : ''}" data-value="on">
            ${t('device.settings.on')}
          </button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">${t('device.settings.hint')}</div>
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

  // 个性化推荐：话题统计面板
  renderPersonaStats(panel.querySelector('#persona-stats'))

  // 设备控制开关
  panel.querySelectorAll('#device-ctl-toggle .settings-toggle').forEach(btn => {
    btn.onclick = () => {
      const value = btn.dataset.value === 'on'
      setDeviceCtlEnabled(value)
      panel.querySelectorAll('#device-ctl-toggle .settings-toggle').forEach(b => b.classList.remove('active'))
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

/** 渲染话题统计迷你面板（chips + 重置按钮） */
function renderPersonaStats(container) {
  if (!container) return
  const stats = getTopicStats()
  const learned = stats.filter(s => s.count > 0)

  if (!learned.length) {
    container.innerHTML = ''
    return
  }

  const chips = learned.map(s => `
    <span class="persona-topic-chip persona-topic-chip--active">
      ${t(s.labelKey)} <span class="persona-topic-count">×${s.count}</span>
    </span>
  `).join('')

  container.innerHTML = `
    <div class="persona-stats-wrap">
      <div class="persona-stats-title">${t('persona.stats.title')}</div>
      <div class="persona-topic-chips">${chips}</div>
      <button class="persona-stats-reset-btn" id="persona-stats-reset">${t('persona.stats.reset')}</button>
    </div>
  `

  container.querySelector('#persona-stats-reset').onclick = () => {
    const btn = container.querySelector('#persona-stats-reset')
    if (btn.dataset.confirming === 'true') {
      resetPersonaStats()
      container.innerHTML = ''
      return
    }
    // 切换为确认态（点一次显示确认，再点一次执行）
    btn.dataset.confirming = 'true'
    btn.textContent = `⚠️ ${t('confirm')}?`
    btn.style.color = 'var(--danger, #ef4444)'
    btn.style.borderColor = 'var(--danger, #ef4444)'
    // 3 秒后自动还原
    setTimeout(() => {
      if (btn.dataset.confirming === 'true') {
        btn.dataset.confirming = ''
        btn.textContent = t('persona.stats.reset')
        btn.style.color = ''
        btn.style.borderColor = ''
      }
    }, 3000)
  }
}
