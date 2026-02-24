/**
 * 国际化模块 - 中英文切换
 */

const LANG_KEY = 'clawapp-lang'

const messages = {
  'zh-CN': {
    // 连接页
    'app.title': 'ClawApp',
    'app.subtitle': '连接到你的 OpenClaw 智能体',
    'setup.host': '服务器地址',
    'setup.host.placeholder': '例如: 192.168.1.100:3210',
    'setup.token': 'Token',
    'setup.token.placeholder': '输入访问令牌',
    'setup.connect': '连接',
    'setup.connecting': '连接中...',
    'setup.error.host': '请输入服务器地址',
    'setup.error.token': '请输入 Token',
    'setup.error.timeout': '连接超时，请检查地址和网络',
    'setup.error.auth': 'Token 认证失败，请检查 Token 是否正确',
    'setup.error.server': '服务器错误：',
    // 聊天页
    'chat.input.placeholder': '输入消息...',
    'chat.send': '发送',
    'chat.abort': '停止',
    'chat.no.messages': '暂无消息',
    'chat.load.error': '加载历史失败',
    'chat.send.error': '发送失败',
    'chat.reconnecting': '连接中断，正在重连...',
    'chat.disconnected': '连接已断开',
    'chat.retry': '重新连接',
    'chat.aborted': '已中止',
    'context.copy': '复制文本',
    'context.copyCode': '复制代码',
    // 会话管理
    'session.title': '会话管理',
    'session.new': '新建会话',
    'session.new.name': '会话名称',
    'session.new.name.placeholder': '例如: debug、research',
    'session.new.hint': '会话 Key 格式: agent:main:<名称>',
    'session.new.create': '创建',
    'session.delete': '删除会话',
    'session.delete.confirm': '确定删除「{name}」？',
    'session.delete.warning': '此操作不可撤销。',
    'session.delete.btn': '删除',
    'session.delete.fail': '删除失败',
    'session.created': '已创建新会话: {name}',
    'session.loading': '加载中...',
    'session.empty': '没有找到会话',
    'session.load.error': '加载失败',
    'session.main': '主会话',
    // 快捷指令
    'cmd.title': '快捷指令',
    'cmd.model': '模型管理',
    'cmd.model.switch': '切换模型（需补充参数）',
    'cmd.model.list': '列出可用模型',
    'cmd.model.status': '当前模型状态',
    'cmd.session': '会话管理',
    'cmd.session.new': '新建会话',
    'cmd.session.reset': '重置当前会话',
    'cmd.session.compact': '压缩上下文',
    'cmd.session.stop': '停止当前任务',
    'cmd.think': '思考控制',
    'cmd.think.off': '关闭思考',
    'cmd.think.low': '低强度思考',
    'cmd.think.medium': '中等思考',
    'cmd.think.high': '高强度思考',
    'cmd.info': '信息查询',
    'cmd.info.help': '帮助信息',
    'cmd.info.status': '系统状态',
    'cmd.info.whoami': '当前身份',
    'cmd.info.commands': '所有指令',
    'cmd.info.context': '上下文信息',
    'cmd.skill': '技能',
    'cmd.skill.run': '执行技能（需补充名称）',
    'cmd.advanced': '高级',
    'cmd.advanced.verbose.on': '开启详细输出',
    'cmd.advanced.verbose.off': '关闭详细输出',
    'cmd.advanced.compact': '压缩上下文（可附指令）',
    // 任务规划
    'cmd.task': '任务规划',
    'cmd.task.run': '任务规划模式（输入任务描述）',
    'task.mode.header': '任务规划模式',
    'task.mode.instruction': '请严格按以下格式处理任务：\n1. 先输出完整执行计划（每步一行，编号格式 "N. 步骤描述"）\n2. 然后逐步执行，每步开始时用 "▶ 步骤N：" 标记，完成后用 "✅ 步骤N 完成" 标记\n3. 遇到错误时用 "❌ 步骤N 失败：原因" 标记\n4. 最后输出 "📋 任务完成汇报" 并给出整体结果摘要',
    'task.mode.task_prefix': '任务：',
    'task.tracker.title': '任务执行计划',
    'task.tracker.planning': '规划中...',
    'task.tracker.running': '执行中',
    'task.tracker.done': '全部完成 ✅',
    'task.tracker.error': '存在错误',
    'task.tracker.progress': '步已完成',
    // 工具状态
    'tool.running': '执行中...',
    'tool.done': '已完成',
    'tool.error': '失败',
    // 时间
    'time.just': '刚刚',
    'time.min': '{n}分钟前',
    'time.hour': '{n}小时前',
    'time.day': '{n}天前',
    // 设置
    'settings.title': '设置',
    'settings.theme': '主题',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.auto': '跟随系统',
    'settings.lang': '语言',
    'settings.disconnect': '断开连接',
    // TTS 语音播报
    'tts.play': '播放语音',
    'tts.loading': '加载中...',
    'tts.playing': '播放中',
    'tts.failed': '播放失败',
    'tts.error': '语音播报暂时不可用，请稍后再试',
    'tts.auto': '自动播报',
    'tts.auto.on': '开启',
    'tts.auto.off': '关闭',
    // 播报中心
    'broadcast.title': '播报中心',
    'broadcast.push': '系统播报',
    'broadcast.empty': '暂无播报',
    'broadcast.clear': '清空',
    'broadcast.dnd': '免打扰',
    'broadcast.dnd.range': '时间段',
    // 语音输入
    'voice.start': '按住说话',
    'voice.stop': '松开结束',
    'voice.auto.send': '语音识别后自动发送',
    'voice.auto.send.on': '自动发送',
    'voice.auto.send.off': '手动确认',
    'voice.error.permission': '麦克风权限被拒绝，请在浏览器设置中允许访问',
    'voice.error.network': '语音识别网络错误，请检查网络连接',
    'voice.error.generic': '语音识别出错，请重试',
    // APK 常驻模式
    'native.title': 'APK 常驻模式',
    'native.desc': '仅在 APK 安装版中可用。开启后 App 将保持后台常驻并监听唤醒词。',
    'native.resident': '开启前台常驻服务',
    'native.wakeword': '唤醒词监听（说 "Claw Claw"）',
    'native.autotts': 'AI 回复自动语音播报',
    'native.battery.tip': '💡 建议：在「设置 → 应用 → ClawApp → 电池」中选择「不受限制」，以确保后台服务稳定运行。',
    'native.error.permission': '需要麦克风和通知权限才能开启常驻模式',
    // 长期记忆
    'memory.title': '我的记忆',
    'memory.settings.label': '长期记忆（上下文注入）',
    'memory.settings.on': '启用',
    'memory.settings.off': '关闭',
    'memory.settings.hint': '开启后，每次发送消息时会自动将记忆条目作为上下文前缀传给 AI，AI 不可见用户气泡中的记忆前缀。',
    'memory.add': '添加',
    'memory.add.placeholder': '输入你的偏好或习惯，例如：我喜欢早上7点播报天气和新闻',
    'memory.empty': '暂无记忆条目，添加后 AI 会在对话中参考这些偏好',
    'memory.delete': '删除',
    'memory.clear': '清空全部',
    'memory.hint': '💡 这里的内容会在每次对话时自动发送给 AI，帮助它记住你的习惯和偏好。',
    'memory.context.header': '用户长期记忆（请在回答时参考以下偏好）',
    'memory.context.separator': '---',
    // 个性化推荐
    'persona.context.header': '个性化助手模式',
    'persona.context.footer': '请在回答中体现以上偏好，主动补充可执行建议，让回答更有价值。',
    'persona.context.separator': '---',
    'persona.instr.weather': '用户经常询问天气：回答天气相关问题时，请同时给出今日着装建议、是否携带雨具以及出行注意事项',
    'persona.instr.stocks': '用户经常询问股票/市场行情：回答时请同时给出相关板块联动分析和简短操作建议（风险提示）',
    'persona.instr.schedule': '用户经常询问日程安排：回答时请主动提醒近期重要时间节点，并建议是否需要提前准备',
    'persona.instr.news': '用户经常询问新闻资讯：回答时请同时提供相关背景信息和可能的后续影响',
    'persona.instr.health': '用户经常询问健康/运动：回答时请同时给出具体可执行的健康建议和注意事项',
    'persona.settings.label': '个性化推荐（行为学习）',
    'persona.settings.on': '启用',
    'persona.settings.off': '关闭',
    'persona.settings.hint': '开启后将自动学习你的常用话题（天气/股票/日程等），并在回答中自动补充个性化建议。',
    'persona.stats.title': '已学习话题',
    'persona.stats.reset': '重置统计',
    'persona.stats.reset.confirm': '确定要清除所有话题学习记录吗？',
    'persona.topic.weather': '天气',
    'persona.topic.stocks': '股票/市场',
    'persona.topic.schedule': '日程安排',
    'persona.topic.news': '新闻资讯',
    'persona.topic.health': '健康/运动',
    // 引导
    'guide.welcome': '欢迎使用 ClawApp 👋',
    'guide.tip1': '💬 在底部输入框发送消息与 AI 聊天',
    'guide.tip2': '📋 点击顶部标题可切换/管理会话',
    'guide.tip3': '⚡ 左下角闪电按钮打开快捷指令',
    'guide.tip4': '📷 点击回形针按钮发送图片',
    'guide.tip5': '⚙️ 右上角齿轮进入设置（主题/语言）',
    'guide.start': '开始使用',
    // 连接
    'setup.auto.retry': '正在重新连接...',
    'setup.auto.fail': '自动连接失败，请手动连接',
    // 通用
    'cancel': '取消',
    'confirm': '确认',
    'copy': '复制',
    'copied': '已复制',
    'copy.fail': '失败',
  },
  'en': {
    'app.title': 'ClawApp',
    'app.subtitle': 'Connect to your OpenClaw agent',
    'setup.host': 'Server Address',
    'setup.host.placeholder': 'e.g. 192.168.1.100:3210',
    'setup.token': 'Token',
    'setup.token.placeholder': 'Enter access token',
    'setup.connect': 'Connect',
    'setup.connecting': 'Connecting...',
    'setup.error.host': 'Please enter server address',
    'setup.error.token': 'Please enter token',
    'setup.error.timeout': 'Connection timeout, check address and network',
    'setup.error.auth': 'Token authentication failed, please check your token',
    'setup.error.server': 'Server error: ',
    'chat.input.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.abort': 'Stop',
    'chat.no.messages': 'No messages yet',
    'chat.load.error': 'Failed to load history',
    'chat.send.error': 'Send failed',
    'chat.reconnecting': 'Disconnected, reconnecting...',
    'chat.disconnected': 'Connection lost',
    'chat.retry': 'Reconnect',
    'chat.aborted': 'Aborted',
    'context.copy': 'Copy text',
    'context.copyCode': 'Copy code',
    'session.title': 'Sessions',
    'session.new': 'New Session',
    'session.new.name': 'Session Name',
    'session.new.name.placeholder': 'e.g. debug, research',
    'session.new.hint': 'Session key format: agent:main:<name>',
    'session.new.create': 'Create',
    'session.delete': 'Delete Session',
    'session.delete.confirm': 'Delete "{name}"?',
    'session.delete.warning': 'This cannot be undone.',
    'session.delete.btn': 'Delete',
    'session.delete.fail': 'Delete failed',
    'session.created': 'Created new session: {name}',
    'session.loading': 'Loading...',
    'session.empty': 'No sessions found',
    'session.load.error': 'Load failed',
    'session.main': 'Main Session',
    'cmd.title': 'Commands',
    'cmd.model': 'Model',
    'cmd.model.switch': 'Switch model (append params)',
    'cmd.model.list': 'List available models',
    'cmd.model.status': 'Current model status',
    'cmd.session': 'Session',
    'cmd.session.new': 'New session',
    'cmd.session.reset': 'Reset current session',
    'cmd.session.compact': 'Compact context',
    'cmd.session.stop': 'Stop current task',
    'cmd.think': 'Thinking',
    'cmd.think.off': 'Disable thinking',
    'cmd.think.low': 'Low intensity',
    'cmd.think.medium': 'Medium intensity',
    'cmd.think.high': 'High intensity',
    'cmd.info': 'Info',
    'cmd.info.help': 'Help',
    'cmd.info.status': 'System status',
    'cmd.info.whoami': 'Current identity',
    'cmd.info.commands': 'All commands',
    'cmd.info.context': 'Context info',
    'cmd.skill': 'Skills',
    'cmd.skill.run': 'Run skill (append name)',
    'cmd.advanced': 'Advanced',
    'cmd.advanced.verbose.on': 'Enable verbose output',
    'cmd.advanced.verbose.off': 'Disable verbose output',
    'cmd.advanced.compact': 'Compact context (append instruction)',
    'tool.running': 'Running...',
    'tool.done': 'Done',
    'tool.error': 'Failed',
    'time.just': 'just now',
    'time.min': '{n}m ago',
    'time.hour': '{n}h ago',
    'time.day': '{n}d ago',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.auto': 'System',
    'settings.lang': 'Language',
    'settings.disconnect': 'Disconnect',
    'tts.play': 'Play audio',
    'tts.loading': 'Loading...',
    'tts.playing': 'Playing',
    'tts.failed': 'Failed',
    'tts.error': 'Voice playback is temporarily unavailable, please try again later',
    'tts.auto': 'Auto-play',
    'tts.auto.on': 'On',
    'tts.auto.off': 'Off',
    'broadcast.title': 'Broadcasts',
    'broadcast.push': 'System broadcast',
    'broadcast.empty': 'No broadcasts yet',
    'broadcast.clear': 'Clear',
    'broadcast.dnd': 'Do Not Disturb',
    'broadcast.dnd.range': 'Time range',
    'voice.start': 'Hold to speak',
    'voice.stop': 'Release to stop',
    'voice.auto.send': 'Auto-send after recognition',
    'voice.auto.send.on': 'Auto-send',
    'voice.auto.send.off': 'Confirm first',
    'voice.error.permission': 'Microphone access denied. Please allow it in browser settings.',
    'voice.error.network': 'Speech recognition network error. Check your connection.',
    'voice.error.generic': 'Speech recognition failed. Please try again.',
    'native.title': 'APK Resident Mode',
    'native.desc': 'Only available in the APK build. When enabled, the app stays alive in the background and listens for the wake word.',
    'native.resident': 'Enable foreground persistent service',
    'native.wakeword': 'Wake word (say "Claw Claw")',
    'native.autotts': 'Auto TTS for assistant replies',
    'native.battery.tip': '💡 Tip: Go to Settings → Apps → ClawApp → Battery and select "Unrestricted" for reliable background operation.',
    'native.error.permission': 'Microphone and notification permissions are required for resident mode',
    'memory.title': 'My Memory',
    'memory.settings.label': 'Long-term Memory (context injection)',
    'memory.settings.on': 'Enabled',
    'memory.settings.off': 'Disabled',
    'memory.settings.hint': 'When enabled, memory items are automatically prepended as context to each message sent to the AI. The memory context is sent to the AI but not displayed in your chat bubble.',
    'memory.add': 'Add',
    'memory.add.placeholder': 'e.g. I like weather and news reports at 7am',
    'memory.empty': 'No memory items yet. Add preferences so the AI can reference them.',
    'memory.delete': 'Delete',
    'memory.clear': 'Clear all',
    'memory.hint': '💡 These items are automatically sent to the AI each time, helping it remember your habits and preferences.',
    'memory.context.header': 'User long-term memory (please consider the following preferences in your response)',
    'memory.context.separator': '---',
    // Personalized recommendations
    'persona.context.header': 'Personalized Assistant Mode',
    'persona.context.footer': 'Please reflect the above preferences in your answer and proactively add actionable recommendations to make your response more valuable.',
    'persona.context.separator': '---',
    'persona.instr.weather': 'User frequently asks about weather: when answering weather questions, also give clothing suggestions, whether to bring an umbrella, and travel tips',
    'persona.instr.stocks': 'User frequently asks about stocks/markets: also provide sector linkage analysis and brief action suggestions (with risk disclaimer)',
    'persona.instr.schedule': 'User frequently asks about schedules: proactively remind about upcoming important dates and suggest whether advance preparation is needed',
    'persona.instr.news': 'User frequently asks about news: also provide relevant background and potential follow-on implications',
    'persona.instr.health': 'User frequently asks about health/exercise: also give specific actionable health tips and precautions',
    'persona.settings.label': 'Personalized Recommendations (Behavior Learning)',
    'persona.settings.on': 'Enabled',
    'persona.settings.off': 'Disabled',
    'persona.settings.hint': 'When enabled, your common topics (weather/stocks/schedule etc.) are learned and personalized proactive suggestions are added to responses automatically.',
    'persona.stats.title': 'Learned topics',
    'persona.stats.reset': 'Reset stats',
    'persona.stats.reset.confirm': 'Clear all topic learning history?',
    'persona.topic.weather': 'Weather',
    'persona.topic.stocks': 'Stocks/Markets',
    'persona.topic.schedule': 'Schedule',
    'persona.topic.news': 'News',
    'persona.topic.health': 'Health/Fitness',
    // Task Planner
    'cmd.task': 'Task Planner',
    'cmd.task.run': 'Task planning mode (enter task description)',
    'task.mode.header': 'Task Planning Mode',
    'task.mode.instruction': 'Please handle this task strictly in the following format:\n1. First output the full execution plan (one step per line, numbered format "N. step description")\n2. Then execute step by step, mark each step start with "▶ Step N:" and completion with "✅ Step N done"\n3. Mark errors as "❌ Step N failed: reason"\n4. Finally output "📋 Task Complete Report" with an overall result summary',
    'task.mode.task_prefix': 'Task: ',
    'task.tracker.title': 'Task Execution Plan',
    'task.tracker.planning': 'Planning...',
    'task.tracker.running': 'Running',
    'task.tracker.done': 'All done ✅',
    'task.tracker.error': 'Has errors',
    'task.tracker.progress': 'steps done',
    'guide.welcome': 'Welcome to ClawApp 👋',
    'guide.tip1': '💬 Type in the input box below to chat with AI',
    'guide.tip2': '📋 Tap the title bar to switch/manage sessions',
    'guide.tip3': '⚡ Tap the bolt icon for quick commands',
    'guide.tip4': '📷 Tap the clip icon to send images',
    'guide.tip5': '⚙️ Tap the gear icon for settings (theme/language)',
    'guide.start': 'Get Started',
    'setup.auto.retry': 'Reconnecting...',
    'setup.auto.fail': 'Auto-connect failed, please connect manually',
    'cancel': 'Cancel',
    'confirm': 'OK',
    'copy': 'Copy',
    'copied': 'Copied',
    'copy.fail': 'Failed',
  }
}

let _currentLang = 'zh-CN'
let _onLangChange = []

/** 检测浏览器语言 */
function detectLang() {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved && messages[saved]) return saved
  const nav = navigator.language || navigator.userLanguage || 'zh-CN'
  return nav.startsWith('zh') ? 'zh-CN' : 'en'
}

/** 初始化 */
export function initI18n() {
  _currentLang = detectLang()
}

/** 获取当前语言 */
export function getLang() {
  return _currentLang
}

/** 切换语言 */
export function setLang(lang) {
  if (!messages[lang]) return
  _currentLang = lang
  localStorage.setItem(LANG_KEY, lang)
  _onLangChange.forEach(fn => { try { fn(lang) } catch (e) { console.error(e) } })
}

/** 翻译 */
export function t(key, params) {
  let text = messages[_currentLang]?.[key] || messages['zh-CN']?.[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}

/** 监听语言变化 */
export function onLangChange(fn) {
  _onLangChange.push(fn)
  return () => { _onLangChange = _onLangChange.filter(cb => cb !== fn) }
}

/** 格式化相对时间 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMin = Math.floor((now - d) / 60000)
  if (diffMin < 1) return t('time.just')
  if (diffMin < 60) return t('time.min', { n: diffMin })
  if (diffMin < 1440) return t('time.hour', { n: Math.floor(diffMin / 60) })
  return t('time.day', { n: Math.floor(diffMin / 1440) })
}
