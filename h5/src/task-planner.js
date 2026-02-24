/**
 * task-planner.js — 任务规划模式
 *
 * 功能：
 * - wrapTaskMessage(text)   把用户消息包装成任务规划提示词
 * - parseSteps(text)        从 AI 文本中提取编号步骤列表
 * - createStepTracker()     创建实时步骤进度追踪卡片
 * - updateStepTracker(el, text) 根据当前流式文本更新步骤状态
 *
 * 步骤状态通过 AI 的文字信号判断：
 *   ▶ 步骤N  →  in-progress
 *   ✅ 步骤N / 步骤N 完成  →  done
 *   ❌ 步骤N / 步骤N 失败  →  error
 *   📋 任务完成            →  all done
 */

import { t } from './i18n.js'

// ── 提示词模板 ────────────────────────────────────────────────────────────────

/** 将普通用户消息包装成任务规划提示词 */
export function wrapTaskMessage(text) {
  return (
    `[${t('task.mode.header')}]\n` +
    `${t('task.mode.instruction')}\n\n` +
    `${t('task.mode.task_prefix')}${text}`
  )
}

/** 判断一条消息是否为任务规划消息（由 wrapTaskMessage 产生） */
export function isTaskMessage(text) {
  return typeof text === 'string' && text.startsWith('[')
    && (text.includes(t('task.mode.header')) || text.includes('[任务规划模式]') || text.includes('[Task Planning Mode]'))
}

// ── 步骤解析 ─────────────────────────────────────────────────────────────────

// 匹配中文/英文编号列表行，如 "1. 检查天气", "2、获取日程", "3) Generate summary"
const STEP_LINE_RE = /^(\d+)[.、)]\s+(.+)/

/**
 * 从 AI 回复文本中提取步骤计划数组。
 * 只提取响应开头连续的编号行（计划区块）。
 * @returns {string[]} 步骤文本数组，空数组表示未检测到计划
 */
export function parseSteps(text) {
  if (!text) return []
  const lines = text.split('\n')
  const steps = []
  let inPlan = false

  for (const line of lines) {
    const m = line.match(STEP_LINE_RE)
    if (m) {
      inPlan = true
      steps.push(m[2].trim())
    } else if (inPlan && line.trim() === '') {
      // 允许计划区块内有空行
      continue
    } else if (inPlan) {
      // 计划区块结束
      break
    }
  }
  return steps
}

// ── 步骤状态推断 ──────────────────────────────────────────────────────────────

// AI 输出的信号词
const SIG_RUNNING  = ['▶', '▷', '→']
const SIG_DONE     = ['✅', '☑', '✓', '完成', 'done', 'completed', 'finished']
const SIG_ERROR    = ['❌', '✗', '失败', 'failed', 'error']
const SIG_ALL_DONE = ['📋', '任务完成', 'task complete', 'all done']

// Step content lines heuristic: each executed step typically produces ~3 lines of content
const LINES_PER_STEP_ESTIMATE = 3
// Plan section header lines (blank line + execution section header)
const PLAN_HEADER_LINES = 2

/**
 * 根据当前累积的 AI 文本推断每个步骤的状态。
 * @param {string[]} steps  步骤列表
 * @param {string}   text   当前 AI 文本
 * @returns {{ status: 'pending'|'running'|'done'|'error' }[]}
 */
export function inferStepStatuses(steps, text) {
  if (!steps.length || !text) return steps.map(() => ({ status: 'pending' }))

  const lowerText = text.toLowerCase()
  const isAllDone = SIG_ALL_DONE.some(s => lowerText.includes(s.toLowerCase()))

  // Work only on the text that appears after the plan section
  const textAfterPlan = text.split('\n').slice(steps.length).join('\n')
  const lowerAfterPlan = textAfterPlan.toLowerCase()

  return steps.map((step, i) => {
    const n = i + 1
    // Case-insensitive step reference pattern: "步骤N" or "step N" or "stepN"
    const stepRefRe = new RegExp(`(步骤|step\\s*)${n}\\b`, 'i')
    const hasStepRef = stepRefRe.test(textAfterPlan)

    // All signals are lowercased; match against lowercased text
    const hasDone  = hasStepRef && SIG_DONE.some(s  => lowerAfterPlan.includes(s.toLowerCase()))
    const hasError = hasStepRef && SIG_ERROR.some(s => lowerAfterPlan.includes(s.toLowerCase()))
    const hasRun   = hasStepRef && SIG_RUNNING.some(s => lowerAfterPlan.includes(s))

    if (isAllDone) return { status: 'done' }
    if (hasError) return { status: 'error' }
    if (hasDone)  return { status: 'done' }
    if (hasRun)   return { status: 'running' }

    // Fallback heuristic: estimate progress by content volume after the plan.
    // LINES_PER_STEP_ESTIMATE lines of execution content ≈ one completed step.
    const contentLines = text.split('\n').filter(l => l.trim()).length
    const planLines    = steps.length + PLAN_HEADER_LINES
    if (contentLines > planLines + i * LINES_PER_STEP_ESTIMATE) return { status: 'done' }

    return { status: 'pending' }
  })
}

// ── DOM ───────────────────────────────────────────────────────────────────────

/**
 * 创建步骤追踪卡片 DOM 元素（初始为空，待 updateStepTracker 填充）
 */
export function createStepTracker() {
  const card = document.createElement('div')
  card.className = 'task-tracker'
  card.innerHTML = `
    <div class="task-tracker-header">
      <span class="task-tracker-icon">⚡</span>
      <span class="task-tracker-title">${t('task.tracker.title')}</span>
      <span class="task-tracker-status" id="tracker-status">${t('task.tracker.planning')}</span>
    </div>
    <ol class="task-steps" id="task-steps-list"></ol>
  `
  return card
}

/**
 * 根据最新 AI 文本刷新步骤追踪卡片。
 * 若尚未解析到步骤则静默返回。
 * @param {HTMLElement} card  createStepTracker() 返回的元素
 * @param {string}      text  当前累积的 AI 文本
 */
export function updateStepTracker(card, text) {
  if (!card || !text) return

  const steps    = parseSteps(text)
  if (!steps.length) return

  const statuses = inferStepStatuses(steps, text)
  const list     = card.querySelector('#task-steps-list')
  const statusEl = card.querySelector('#tracker-status')
  if (!list) return

  // 重新渲染步骤列表（保持 DOM 稳定 — 只更新状态 class）
  if (list.children.length !== steps.length) {
    // 首次或步骤数变化时完整渲染
    list.innerHTML = steps.map((step, i) => `
      <li class="task-step task-step--${statuses[i].status}" data-idx="${i}">
        <span class="task-step-icon">${_statusIcon(statuses[i].status)}</span>
        <span class="task-step-text">${_escHtml(step)}</span>
      </li>
    `).join('')
  } else {
    // 只更新状态 class 和图标
    list.querySelectorAll('.task-step').forEach((li, i) => {
      const s = statuses[i].status
      li.className = `task-step task-step--${s}`
      const icon = li.querySelector('.task-step-icon')
      if (icon) icon.textContent = _statusIcon(s)
    })
  }

  // 更新顶部状态标签
  if (statusEl) {
    const allDone  = statuses.every(s => s.status === 'done')
    const anyError = statuses.some(s => s.status === 'error')
    const anyRun   = statuses.some(s => s.status === 'running')
    const doneCount = statuses.filter(s => s.status === 'done').length

    if (allDone) {
      statusEl.textContent = t('task.tracker.done')
      statusEl.className = 'task-tracker-status done'
    } else if (anyError) {
      statusEl.textContent = t('task.tracker.error')
      statusEl.className = 'task-tracker-status error'
    } else if (anyRun) {
      statusEl.textContent = t('task.tracker.running')
      statusEl.className = 'task-tracker-status running'
    } else {
      statusEl.textContent = `${doneCount}/${steps.length} ${t('task.tracker.progress')}`
      statusEl.className = 'task-tracker-status'
    }
  }
}

function _statusIcon(status) {
  return { pending: '⏳', running: '▶', done: '✅', error: '❌' }[status] || '⏳'
}

function _escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
