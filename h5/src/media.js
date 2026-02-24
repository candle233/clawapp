import { t } from './i18n.js'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024    // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024   // 50 MB
const VIDEO_FRAME_COUNT = 4               // key frames to extract per video
const VIDEO_FRAME_MAX_W = 640             // max width of each extracted frame
const VIDEO_DEFAULT_DURATION = 30         // assumed duration (s) when metadata is unavailable
const VIDEO_MAX_SAMPLE_DURATION = 300     // cap (s) used for frame-spacing calculation

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/3gpp', 'video/ogg', 'video/x-msvideo']

let _attachments = []
let _previewBar = null
let _onChangeCallback = null

export function initMedia(previewBarEl, onChange) {
  _previewBar = previewBarEl
  _onChangeCallback = onChange
}

export function pickImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,video/*'
  input.multiple = true
  input.onchange = () => handleFiles(input.files)
  input.click()
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert(t('media.image.too.large').replace('{name}', file.name))
        return
      }
      readFileAsBase64(file).then(data => {
        _attachments.push({ name: file.name, type: file.type, data })
        renderPreviews()
        _onChangeCallback?.()
      })
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert(t('media.video.too.large').replace('{name}', file.name))
        return
      }
      const placeholder = { name: file.name, type: file.type, isVideo: true, loading: true, frames: [], thumbnail: '', duration: 0 }
      _attachments.push(placeholder)
      renderPreviews()
      handleVideoFile(file, placeholder)
    }
  })
}

async function handleVideoFile(file, placeholder) {
  try {
    const { thumbnail, frames, duration } = await extractVideoFrames(file)
    placeholder.loading = false
    placeholder.thumbnail = thumbnail
    placeholder.frames = frames
    placeholder.duration = duration
    renderPreviews()
    _onChangeCallback?.()
  } catch {
    const idx = _attachments.indexOf(placeholder)
    if (idx !== -1) _attachments.splice(idx, 1)
    renderPreviews()
    alert(t('media.video.error').replace('{name}', file.name))
  }
}

function extractVideoFrames(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    video.src = url
    const cleanup = () => URL.revokeObjectURL(url)
    const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')) }, 20000)

    video.onloadedmetadata = async () => {
      clearTimeout(timer)
      const rawDuration = isFinite(video.duration) ? video.duration : VIDEO_DEFAULT_DURATION
      const duration = Math.min(rawDuration, VIDEO_MAX_SAMPLE_DURATION)
      const count = Math.max(1, Math.min(VIDEO_FRAME_COUNT, Math.ceil(duration) || 1))
      const frames = []
      for (let i = 0; i < count; i++) {
        const seekTime = count > 1 ? (i / (count - 1)) * duration : 0
        try { frames.push(await captureVideoFrame(video, seekTime)) } catch { /* skip */ }
      }
      cleanup()
      resolve({ thumbnail: frames[0] || '', frames, duration: rawDuration })
    }

    video.onerror = () => { clearTimeout(timer); cleanup(); reject(new Error('load error')) }
  })
}

function captureVideoFrame(video, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      try {
        const scale = Math.min(1, VIDEO_FRAME_MAX_W / (video.videoWidth || VIDEO_FRAME_MAX_W))
        const w = Math.round((video.videoWidth || VIDEO_FRAME_MAX_W) * scale)
        const h = Math.round((video.videoHeight || 360) * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(video, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      } catch (e) { reject(e) }
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.currentTime = time
  })
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function renderPreviews() {
  if (!_previewBar) return
  _previewBar.innerHTML = ''

  if (_attachments.length === 0) {
    _previewBar.classList.remove('visible')
    return
  }

  _previewBar.classList.add('visible')

  _attachments.forEach((att, idx) => {
    const item = document.createElement('div')
    item.className = 'preview-item'

    if (att.isVideo) {
      const thumb = document.createElement('div')
      thumb.className = 'preview-video-thumb'
      if (att.thumbnail) thumb.style.backgroundImage = `url(${att.thumbnail})`
      if (att.loading) {
        const spinner = document.createElement('div')
        spinner.className = 'preview-video-spinner'
        thumb.appendChild(spinner)
      } else {
        const icon = document.createElement('div')
        icon.className = 'preview-video-icon'
        icon.textContent = '▶'
        thumb.appendChild(icon)
      }
      const name = document.createElement('div')
      name.className = 'preview-video-name'
      name.textContent = att.name
      item.appendChild(thumb)
      item.appendChild(name)
    } else {
      const img = document.createElement('img')
      img.className = 'preview-thumb'
      img.src = att.data
      item.appendChild(img)
    }

    const removeBtn = document.createElement('button')
    removeBtn.className = 'remove-btn'
    removeBtn.textContent = '×'
    removeBtn.onclick = (e) => {
      e.stopPropagation()
      _attachments.splice(idx, 1)
      renderPreviews()
      _onChangeCallback?.()
    }

    item.appendChild(removeBtn)
    _previewBar.appendChild(item)
  })
}

/** Returns AI-ready attachments: images as-is, videos as extracted frame images */
export function getAttachments() {
  const result = []
  for (const att of _attachments) {
    if (att.loading) continue
    if (att.isVideo) {
      for (const frame of att.frames) {
        const match = /^data:([^;]+);base64,(.+)$/.exec(frame)
        if (match) result.push({ type: 'image', mimeType: match[1], content: match[2] })
      }
    } else {
      const match = /^data:([^;]+);base64,(.+)$/.exec(att.data)
      if (match) result.push({ type: 'image', mimeType: match[1], content: match[2] })
    }
  }
  return result
}

/** Returns display-friendly attachments for the user chat bubble */
export function getDisplayAttachments() {
  const result = []
  for (const att of _attachments) {
    if (att.loading) continue
    if (att.isVideo) {
      result.push({ type: 'video', name: att.name, thumbnail: att.thumbnail, duration: att.duration, frameCount: att.frames.length })
    } else {
      const match = /^data:([^;]+);base64,(.+)$/.exec(att.data)
      if (match) result.push({ type: 'image', mimeType: match[1], content: match[2] })
    }
  }
  return result
}

/** Returns a context note for the AI when video frames are attached (call before clearAttachments) */
export function getVideoContext() {
  const videos = _attachments.filter(a => a.isVideo && !a.loading && a.frames.length)
  if (!videos.length) return null
  return videos.map(v => {
    const dur = v.duration > 0 ? `${Math.round(v.duration)}${t('media.video.seconds')}` : ''
    return t('media.video.context')
      .replace('{name}', v.name)
      .replace('{dur}', dur ? t('media.video.context.dur').replace('{dur}', dur) : '')
      .replace('{frames}', v.frames.length)
  }).join('\n')
}

export function clearAttachments() {
  _attachments = []
  renderPreviews()
}

export function hasAttachments() {
  return _attachments.length > 0
}

export function showLightbox(src) {
  let lb = document.querySelector('.lightbox')
  if (!lb) {
    lb = document.createElement('div')
    lb.className = 'lightbox'
    lb.innerHTML = `
      <button class="close-lightbox">×</button>
      <img src="" alt="preview" />
    `
    lb.querySelector('.close-lightbox').onclick = () => lb.classList.remove('visible')
    lb.onclick = (e) => { if (e.target === lb) lb.classList.remove('visible') }
    document.body.appendChild(lb)
  }
  lb.querySelector('img').src = src
  lb.classList.add('visible')
}
