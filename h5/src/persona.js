/**
 * persona.js — 个性化推荐引擎
 *
 * 功能：
 * - 分析用户消息中的主题关键词，持久化话题访问频次
 * - 当某类话题出现频次超过阈值后，自动生成"主动推荐指令"注入 AI 上下文
 * - AI 据此在回答时附带个性化建议（天气→着装建议、股票→板块联动等）
 * - 支持开关（默认开启）、重置统计
 */

import { t } from './i18n.js'

const PERSONA_STATS_KEY   = 'clawapp-persona-stats'
const PERSONA_ENABLED_KEY = 'clawapp-persona-enabled'

/** 话题出现多少次后开始注入个性化指令（首次提问即生效） */
const TOPIC_THRESHOLD = 1

// ── 话题定义 ─────────────────────────────────────────────────────────────────

/**
 * 每个话题包含：
 * - id        唯一标识
 * - patterns  匹配正则（对消息文本做大小写不敏感匹配）
 *             每个 pattern 同时覆盖中文关键词和对应的英文词，
 *             因为用户可能用中英文混合方式提问。
 * - instrKey  i18n 键：对应注入到 AI 的主动推荐指令
 */
const TOPICS = [
  {
    id: 'weather',
    patterns: [/天气|气温|下雨|晴|雨|雪|气象|forecast|weather|温度|degrees|humid/i],
    instrKey: 'persona.instr.weather',
  },
  {
    id: 'stocks',
    patterns: [/股票|股市|大盘|A股|基金|证券|涨停|跌停|板块|指数|行情|stock|market|fund|index/i],
    instrKey: 'persona.instr.stocks',
  },
  {
    id: 'schedule',
    patterns: [/日程|提醒|会议|安排|计划|日历|schedule|agenda|reminder|appointment|todo|任务/i],
    instrKey: 'persona.instr.schedule',
  },
  {
    id: 'news',
    patterns: [/新闻|资讯|最新|头条|时事|快讯|news|headline|briefing|latest/i],
    instrKey: 'persona.instr.news',
  },
  {
    id: 'health',
    patterns: [/健康|运动|饮食|睡眠|体重|卡路里|步数|心率|health|exercise|diet|sleep|fitness/i],
    instrKey: 'persona.instr.health',
  },
]

// ── 统计数据 CRUD ─────────────────────────────────────────────────────────────

function getStats() {
  try {
    return JSON.parse(localStorage.getItem(PERSONA_STATS_KEY)) || {}
  } catch {
    return {}
  }
}

function saveStats(stats) {
  localStorage.setItem(PERSONA_STATS_KEY, JSON.stringify(stats))
}

export function resetPersonaStats() {
  localStorage.removeItem(PERSONA_STATS_KEY)
}

// ── 开关 ──────────────────────────────────────────────────────────────────────

export function getPersonaEnabled() {
  return localStorage.getItem(PERSONA_ENABLED_KEY) !== 'false'  // 默认开启
}

export function setPersonaEnabled(val) {
  localStorage.setItem(PERSONA_ENABLED_KEY, val ? 'true' : 'false')
}

// ── 消息分析 ──────────────────────────────────────────────────────────────────

/**
 * 分析用户消息文本，检测包含哪些话题并累加计数。
 * 应在每次用户发送消息时调用。
 * @param {string} text
 */
export function trackMessage(text) {
  if (!text || !getPersonaEnabled()) return
  const stats = getStats()
  let changed = false
  for (const topic of TOPICS) {
    if (topic.patterns.some(re => re.test(text))) {
      stats[topic.id] = (stats[topic.id] || 0) + 1
      changed = true
    }
  }
  if (changed) saveStats(stats)
}

// ── 上下文构建 ────────────────────────────────────────────────────────────────

/**
 * 根据高频话题构建个性化主动推荐指令前缀。
 * 仅当有达到阈值的话题时才返回内容；否则返回 null。
 * @returns {string|null}
 */
export function buildPersonaContext() {
  if (!getPersonaEnabled()) return null
  const stats = getStats()

  const activeTopics = TOPICS.filter(tp => (stats[tp.id] || 0) >= TOPIC_THRESHOLD)
  if (!activeTopics.length) return null

  const instrLines = activeTopics.map(tp => `- ${t(tp.instrKey)}`).join('\n')
  return (
    `[${t('persona.context.header')}]\n` +
    instrLines + '\n' +
    t('persona.context.footer') + '\n' +
    t('persona.context.separator') + '\n'
  )
}

// ── 话题统计摘要（供 UI 展示调试信息） ───────────────────────────────────────

/**
 * 返回当前各话题的频次统计（含话题 id 和 labelKey）
 * @returns {{ id: string, labelKey: string, count: number }[]}
 */
export function getTopicStats() {
  const stats = getStats()
  return TOPICS.map(tp => ({ id: tp.id, labelKey: `persona.topic.${tp.id}`, count: stats[tp.id] || 0 }))
}
