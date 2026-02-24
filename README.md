# ClawApp

<p align="center">
  <strong>📱 用手机 App 和你的 OpenClaw AI 智能体聊天</strong>
</p>

<p align="center">
  <a href="#features">功能特性</a> •
  <a href="#screenshots">截图预览</a> •
  <a href="#quickstart">快速开始</a> •
  <a href="#deploy">部署方式</a> •
  <a href="#remote">外网访问</a> •
  <a href="#config">配置参数</a> •
  <a href="#apk-resident">APK 常驻</a> •
  <a href="#faq">常见问题</a> •
  <a href="#community">社区交流</a> •
  <a href="#english">English</a>
</p>

<p align="center">
  <a href="https://clawapp.qt.cool">🌐 产品主页</a> •
  <a href="https://github.com/1186258278/OpenClawChineseTranslation">🇨🇳 OpenClaw 中文汉化版</a> •
  <a href="https://discord.com/invite/U9AttmsNHh">💬 Discord</a> •
  <a href="https://yb.tencent.com/gp/i/LsvIw7mdR7Lb">🤖 元宝派</a>
</p>

---

<h2 id="about">这是什么？</h2>

[OpenClaw](https://github.com/openclaw/openclaw) 是一个强大的 AI 智能体平台（[中文汉化版](https://github.com/1186258278/OpenClawChineseTranslation)），但它的 Gateway 默认只监听本机（`127.0.0.1:18789`），手机无法直接连接。

ClawApp 解决了这个问题：

```
ClawApp Android APK（任意网络）
    ↓ WebSocket (WS / WSS)
代理服务端（ClawApp Server，端口 3210）
    ↓ WebSocket + Ed25519 设备签名
OpenClaw Gateway（端口 18789）
```

代理服务端自动完成 Ed25519 设备签名握手认证（兼容 OpenClaw 2.13+）。安装 APK 后在设置页填入服务器地址和 Token 即可使用。

> ⚠️ **注意**：Web 浏览器访问模式已移除。请通过 GitHub Actions 自动构建的 APK 在手机上使用 ClawApp。

---

<h2 id="features">功能特性</h2>

- 💬 实时流式聊天（打字机效果）
- 📷 图片收发（拍照/相册上传，AI 图片回复）
- 📝 Markdown 渲染 + 代码高亮（XSS 防护）
- ⚡ 快捷指令面板（/model、/think、/new 等）
- 🔧 工具调用实时状态显示
- 📋 会话管理（切换、新建、删除）
- 🌙 主题切换（亮色 / 暗色 / 跟随系统）
- 🌐 中英文切换
- 🔄 智能重连（断线自动恢复，无闪烁，消息去重）
- 🔒 Token + Ed25519 设备认证（兼容 OpenClaw 2.13+）
- 💾 离线消息缓存（IndexedDB 持久化，断网可查看历史，恢复后自动同步）
- 👋 新用户功能引导
- 📱 PWA 支持（添加到主屏幕，离线可用）
- 📦 Android APK 打包（Capacitor + GitHub Actions 自动构建）
- 🔊 **TTS 语音播报**：每条 AI 回复旁一键播放语音；支持自动播报开关
- 🎙️ **语音输入**：按住/点击麦克风按钮说话，识别结果自动填入输入框并发送（Web Speech API）
- 📣 **播报中心**：接收 OpenClaw Cron 定时播报（天气/新闻/股票），支持免打扰时段、一键 TTS 朗读
- 🤖 **APK 唤醒词常驻**（Android 专属）：说 "Claw Claw" 唤醒 → 语音输入 → AI 回复 → 自动 TTS，全程免手动

---

<h2 id="screenshots">截图预览</h2>

<table align="center">
  <tr>
    <td align="center"><img src="docs/image/login-page.png" width="220" alt="登录页" /><br/><sub>登录连接</sub></td>
    <td align="center"><img src="docs/image/chat-response.png" width="220" alt="AI 聊天回复" /><br/><sub>流式聊天</sub></td>
    <td align="center"><img src="docs/image/chat-commands.jpg" width="220" alt="快捷指令面板" /><br/><sub>快捷指令</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/image/session-manager.jpg" width="220" alt="会话管理" /><br/><sub>会话管理</sub></td>
    <td align="center"><img src="docs/image/commands-panel.png" width="220" alt="指令面板" /><br/><sub>指令面板</sub></td>
    <td align="center"><img src="docs/image/settings-panel.jpg" width="220" alt="设置面板" /><br/><sub>设置与帮助</sub></td>
  </tr>
</table>

---

<h2 id="quickstart">快速开始</h2>

### 第一步：部署代理服务端

#### 一键部署（Mac / Linux）

```bash
curl -fsSL https://raw.githubusercontent.com/qingchencloud/clawapp/main/install.sh | bash
```

#### 一键部署（Windows PowerShell）

```powershell
irm https://raw.githubusercontent.com/qingchencloud/clawapp/main/install.ps1 | iex
```

脚本会自动检测环境、克隆仓库、安装依赖、交互式配置 Token，并支持 PM2 常驻运行。如果本地已安装 OpenClaw，会自动读取 Gateway Token。

#### 前提条件

- 电脑上已运行 [OpenClaw](https://github.com/openclaw/openclaw) Gateway（默认端口 18789）
  - 推荐使用 [中文汉化版](https://github.com/1186258278/OpenClawChineseTranslation)
- 安装了 [Node.js](https://nodejs.org/) 18+ 或 [Docker](https://www.docker.com/)

#### Docker 部署（推荐）

```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp
```

在项目根目录创建 `.env` 文件：

```bash
# APK 客户端连接时的密码（自己设一个）
PROXY_TOKEN=my-secret-token-123

# OpenClaw Gateway 的 Token（在 ~/.openclaw/gateway.yaml 里找）
OPENCLAW_GATEWAY_TOKEN=你的gateway-token
```

启动：

```bash
docker compose up -d --build
```

#### 直接运行

```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp
cd server && npm install
cp server/.env.example server/.env
# 编辑 server/.env，填入你的 token
npm start
```

### 第二步：安装 APK

1. 在 GitHub 仓库的 [Actions 页面](https://github.com/candle233/clawapp/actions) 或 [Releases](https://github.com/candle233/clawapp/releases) 下载最新 APK
2. 在 Android 手机上安装（需要允许"未知来源"）
3. 打开 ClawApp，在连接设置页填入：
   - **服务器地址**：代理服务端的 IP 或域名及端口，如 `192.168.1.100:3210`
   - **Token**：`.env` 里设置的 `PROXY_TOKEN`
4. 点击连接即可使用

> 📖 **详细打包说明**（如何触发构建、本地手动打包、Release 签名、多种安装方法）请参阅 [docs/build-apk-guide.md](docs/build-apk-guide.md)

---

<h2 id="deploy">部署方式</h2>

### 本地部署（同一网络）

适合家庭/办公室使用，APK 和服务器在同一 WiFi 下。

```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp/server && npm install
cp .env.example .env
# 编辑 .env 填入 token
node index.js
```

### Docker 容器部署

```bash
# 创建 .env
cat > .env << 'EOF'
PROXY_TOKEN=my-token-123
OPENCLAW_GATEWAY_TOKEN=你的gateway-token
ALLOWED_ORIGINS=
EOF

# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f
```

Docker 环境下会自动使用 `host.docker.internal` 连接宿主机的 Gateway。

### 使用 PM2 常驻运行

```bash
# 安装 pm2
npm install -g pm2

# 启动
pm2 start server/index.js --name clawapp

# 开机自启
pm2 save && pm2 startup
```

---

<h2 id="remote">外网访问</h2>

不在同一网络时，有以下方案：

### 方案一：cftunnel（推荐，一条命令搞定）

[cftunnel](https://github.com/qingchencloud/cftunnel) 是 Cloudflare Tunnel 一键管理 CLI，免费、自动 HTTPS、无需公网 IP。

**临时分享（零配置）：**

```bash
# 安装 cftunnel
curl -fsSL https://raw.githubusercontent.com/qingchencloud/cftunnel/main/install.sh | bash

# 一条命令穿透
cftunnel quick 3210
# ✔ 隧道已启动: https://xxx-yyy-zzz.trycloudflare.com
```

**固定域名（需要 Cloudflare 账号 + 自有域名）：**

```bash
cftunnel init                                          # 配置 CF API Token
cftunnel create my-tunnel                              # 创建隧道
cftunnel add clawapp 3210 --domain chat.example.com    # 添加路由（自动创建 DNS）
cftunnel up                                            # 启动
cftunnel install                                       # 注册开机自启
```

> 详见 [cftunnel 文档](https://cftunnel.qt.cool) · 也有 [桌面客户端](https://github.com/qingchencloud/cftunnel-app) 可视化管理

### 方案二：SSH 隧道（简单快速）

需要一台有公网 IP 的服务器。

```bash
# 在你的电脑上执行
ssh -f -N \
  -o ServerAliveInterval=15 \
  -o ServerAliveCountMax=4 \
  -R 0.0.0.0:3210:127.0.0.1:3210 \
  user@你的服务器IP
```

> ⚠️ 服务器需要：
> - `/etc/ssh/sshd_config` 中设置 `GatewayPorts yes`
> - 防火墙放行 3210 端口

手机访问 `http://服务器IP:3210`

### 方案三：Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name clawapp.你的域名.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **cftunnel（推荐）** | **一条命令，免费，自动 HTTPS，开机自启** | **依赖 Cloudflare 服务** |
| SSH 隧道 | 简单，无需额外软件 | 需要公网服务器，隧道可能断开 |
| Nginx 反代 | 完全可控，自定义域名 | 需要服务器 + SSL 配置 |
| Tailscale/ZeroTier | P2P 直连，加密 | 手机也要装客户端 |

---

<h2 id="connection">连接说明</h2>

打开 ClawApp APK 后会看到连接设置页：

| 字段 | 填什么 | 示例 |
|------|--------|------|
| 服务器地址 | 代理服务端的地址和端口 | `192.168.1.100:3210`（局域网）或 `服务器IP:3210`（外网） |
| Token | `.env` 里设置的 `PROXY_TOKEN` | `my-secret-token-123` |

> 💡 通过 HTTPS 访问时（如 Cloudflare Tunnel），WebSocket 会自动切换为 WSS 加密连接。

### APK 应用设置

点击聊天页右上角 ⚙️ 图标：

- **主题**：浅色 / 深色 / 跟随系统
- **语言**：中文 / English
- **自动播报**：AI 回复是否自动语音朗读
- **语音识别后自动发送**：说完话是否立即发送
- **免打扰**：设置不接受系统播报的时间段
- **APK 常驻模式**：开启前台服务 + 唤醒词监听（详见 [APK 常驻模式](#apk-resident)）
- **断开连接**：返回连接页

---

<h2 id="apk-resident">APK 常驻模式（Android 专属）</h2>

ClawApp APK 版（通过 Capacitor 打包）支持**前台服务常驻**，可在 App 后台或锁屏时监听唤醒词 **"Claw Claw"**，实现免手动操作的语音对话。

### 功能开关

在 APK 中，设置面板（⚙️）底部会出现「APK 常驻模式」专属区域，包含：

| 开关 | 说明 |
|------|------|
| 开启前台常驻服务 | 总开关，开启后 App 不会被系统回收 |
| 唤醒词监听（说 "Claw Claw"）| 持续监听麦克风，检测到唤醒词后自动开始语音输入 |
| AI 回复自动语音播报 | 收到 AI 回复后自动调用 TTS 朗读 |

### 工作流程

```
说 "Claw Claw"（唤醒词）
    ↓ Android SpeechRecognizer 检测到
前台服务通知 JS 层
    ↓ 触发语音输入按钮
用户说出指令（语音识别）
    ↓ 识别结果填入输入框 + 自动发送
OpenClaw AI 回复
    ↓ 自动 TTS 朗读
继续等待下次唤醒
```

### Android 权限说明

首次开启「前台常驻服务」时，App 会请求以下权限：

| 权限 | 用途 | 级别 |
|------|------|------|
| `RECORD_AUDIO` | 麦克风录音（唤醒词 + 语音输入） | 运行时权限（需用户允许） |
| `POST_NOTIFICATIONS` | 显示前台服务通知（Android 13+） | 运行时权限（需用户允许） |
| `FOREGROUND_SERVICE` | 保持前台服务运行 | 普通权限（自动授予） |
| `FOREGROUND_SERVICE_MICROPHONE` | API 34+ 声明服务使用麦克风 | 普通权限（自动授予） |
| `WAKE_LOCK` | 锁屏时保持 CPU 唤醒 | 普通权限（自动授予） |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | 允许引导用户关闭电池优化 | 普通权限（自动授予） |

### 电池优化设置（重要！）

Android 的电池优化机制可能在 App 进入后台后**限制前台服务的麦克风访问**，导致唤醒词检测中断。建议：

1. 在手机 **设置 → 应用 → ClawApp → 电池** 中，将电池使用模式改为 **「不受限制」**
2. 部分品牌（如小米、OPPO、华为）还需要在**自启动管理**中允许 ClawApp 自启

> ⚠️ 如果唤醒词经常无响应，基本上都是电池优化问题。请先检查上述设置。

### 使用限制

- 唤醒词检测依赖 Android 系统的 `SpeechRecognizer`，需要设备安装 Google 语音服务（或厂商语音引擎）
- 锁屏状态下的持续识别受系统版本和厂商定制影响，效果可能因设备而异
- 不支持离线唤醒词；识别需要网络连接

---

<h2 id="config">配置参数</h2>

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PROXY_PORT` | 否 | `3210` | 代理服务端端口 |
| `PROXY_TOKEN` | **是** | - | H5 客户端连接密码 |
| `OPENCLAW_GATEWAY_URL` | 否 | `ws://127.0.0.1:18789` | Gateway 地址（Docker 下自动设为 `host.docker.internal`） |
| `OPENCLAW_GATEWAY_TOKEN` | **是** | - | Gateway 认证 token |
| `INGEST_TOKEN` | 否 | - | Cron 播报 Webhook 鉴权 token（`POST /ingest/cron`），未配置则不限制 |
| `ALLOWED_ORIGINS` | 否 | - | 额外 CORS 白名单，逗号分隔 |

---

<h2 id="structure">项目结构</h2>

```
clawapp/
├── server/                # WebSocket 代理服务端
│   ├── index.js           # Express + WS 代理 + Gateway 握手 + /ingest/cron Webhook
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── h5/                    # H5 移动端前端
│   ├── src/
│   │   ├── main.js        # 入口 + 连接页
│   │   ├── ws-client.js   # WebSocket 协议层
│   │   ├── chat-ui.js     # 聊天 UI + 会话管理
│   │   ├── message-db.js  # IndexedDB 离线消息存储
│   │   ├── offline-queue.js # 离线队列 + 增量同步
│   │   ├── commands.js    # 快捷指令面板
│   │   ├── markdown.js    # Markdown 渲染 + 代码高亮
│   │   ├── media.js       # 图片处理
│   │   ├── tts.js         # TTS 语音播报（Gateway RPC tts.convert）
│   │   ├── voice-input.js # 语音输入（Web Speech API）
│   │   ├── broadcast-center.js # 播报中心（Cron 推送 + DND）
│   │   ├── native-mode.js # APK 常驻模式（Capacitor 桥接）
│   │   ├── i18n.js        # 国际化（中文 / English）
│   │   ├── theme.js       # 主题管理（亮/暗/自动）
│   │   ├── settings.js    # 设置面板
│   │   ├── style.css      # 主样式 + 主题变量
│   │   └── components.css # 组件样式
│   ├── index.html
│   └── vite.config.js
├── android/               # Capacitor Android 项目
│   └── app/src/main/java/com/qingchencloud/clawapp/
│       ├── MainActivity.java
│       ├── ClawPlugin.java        # Capacitor 插件（服务控制 + JS 事件）
│       └── ClawForegroundService.java # 前台常驻服务 + 唤醒词检测
├── .github/workflows/     # GitHub Actions
│   └── build-apk.yml      # 自动构建 APK
├── docs/                  # 文档 + GitHub Pages
│   ├── index.html         # 产品落地页
│   ├── pwa-and-apk-guide.md  # PWA/APK 打包指南
│   └── image/             # 截图
├── capacitor.config.ts    # Capacitor 配置
├── Dockerfile             # 多阶段构建
├── docker-compose.yml     # 生产部署
└── README.md
```

---

<h2 id="dev">开发</h2>

```bash
# 安装依赖
npm run install:all

# H5 开发服务器（热更新，端口 5173）
npm run dev:h5

# 代理服务端（端口 3210）
npm run dev:server
```

---

<h2 id="faq">常见问题</h2>

**Q: 一直显示「连接中」？**

1. 检查 OpenClaw Gateway 是否在运行：`curl http://localhost:18789`
2. 确认 `OPENCLAW_GATEWAY_TOKEN` 正确
3. Docker 部署时，Gateway 地址应为 `ws://host.docker.internal:18789`

**Q: 手机打不开页面？**

1. 手机和电脑是否在同一 WiFi？
2. 电脑防火墙是否放行了 3210 端口？
3. 地址是否用了电脑 IP（不是 localhost）？

**Q: WebSocket 经常断开？**

服务端内置 30 秒心跳保活，客户端也有 25 秒应用层心跳。如果还是断，检查反向代理的超时配置（建议 > 60s）。SSH 隧道建议加 `-o ServerAliveInterval=15`。

**Q: 能多人同时使用吗？**

可以。每个连接创建独立的 Gateway 会话，但共享同一个 OpenClaw 实例。

**Q: 怎么添加更多语言？**

编辑 `h5/src/i18n.js`，添加新的语言包（如 `'ja'`），然后在 `settings.js` 中添加对应按钮。

**Q: Docker 构建时 npm install 超时失败？**

国内网络拉取 npm 包可能很慢，有几种解决方案：

1. 在 Dockerfile 的 `RUN npm install` 前加镜像源：
   ```dockerfile
   RUN npm config set registry https://registry.npmmirror.com && npm install --omit=dev
   ```
2. 或者跳过 Docker，直接本地运行（推荐网络不好时使用）：
   ```bash
   npm run install:all && npm run build:h5
   cp server/.env.example server/.env  # 编辑填入 token
   npm start
   ```

**Q: 启动时报 EADDRINUSE 端口被占用？**

说明 3210 端口已被其他进程占用。常见原因：

1. 之前用 PM2 启动过：`pm2 stop openclaw-mobile && pm2 delete openclaw-mobile`
2. 之前用 nohup 启动过：`lsof -i:3210 -t | xargs kill -9`
3. Docker 容器还在跑：`docker compose down`

确认端口释放后再启动：`lsof -i:3210 || echo "端口可用"`

**Q: 用 PM2 管理时不断重启？**

PM2 会在进程崩溃时自动重启。如果 Gateway 没运行或 Token 错误，服务会启动后立即因连接失败而退出，导致循环重启。解决：

1. 先确认 Gateway 在运行：`curl http://localhost:18789`
2. 检查 `server/.env` 中的 Token 是否正确
3. 查看 PM2 日志定位问题：`pm2 logs openclaw-mobile --lines 30`

**Q: 不需要修改 OpenClaw 就能用吗？**

是的。ClawApp 完全兼容原生 OpenClaw，不需要安装插件、不需要改配置、不需要开额外端口。只要 Gateway 在运行（默认 `127.0.0.1:18789`），把 Token 填到 `.env` 里就能用。

**Q: 部署到远程服务器后访问不了？**

1. 确认防火墙放行了 3210 端口：
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 3210/tcp
   # CentOS/RHEL
   sudo firewall-cmd --add-port=3210/tcp --permanent && sudo firewall-cmd --reload
   ```
2. 云服务器还需要在控制台安全组中放行 3210 端口
3. 确认服务在监听：`ss -tlnp | grep 3210`
4. 注意：远程服务器上也需要运行 OpenClaw Gateway，否则页面能打开但无法聊天

**Q: 一键脚本安装的 Node.js (nvm) 在 PM2 重启后找不到？**

nvm 安装的 Node.js 需要 source 才能生效。如果 PM2 通过 `pm2 startup` 设置了开机自启，重启后可能找不到 node。解决：

```bash
# 获取 node 的绝对路径
which node  # 例如 /root/.nvm/versions/node/v22.22.0/bin/node

# 用绝对路径启动 PM2
pm2 startup
pm2 save
```

或者将 nvm 的 node 软链到系统路径：
```bash
sudo ln -sf $(which node) /usr/local/bin/node
sudo ln -sf $(which npm) /usr/local/bin/npm
sudo ln -sf $(which pm2) /usr/local/bin/pm2
```

**Q: 能部署到没有 OpenClaw 的服务器上吗？**

可以部署，但需要通过 SSH 隧道或反向代理将远程服务器的请求转发回运行 OpenClaw 的电脑。典型场景：

```
手机 → 远程服务器 ClawApp(:3210) → SSH隧道 → 本地电脑 Gateway(:18789)
```

在远程服务器上：
```bash
# 将远程的 18789 端口转发到本地电脑的 Gateway
ssh -f -N -L 127.0.0.1:18789:127.0.0.1:18789 user@你的电脑IP
```

这样远程 ClawApp 就能通过 `ws://127.0.0.1:18789` 连接到你本地的 Gateway。

**Q: 语音播报（TTS）没有声音？**

1. 确认 OpenClaw Gateway 已配置 TTS 服务（`tts.convert` RPC 可用）
2. 检查手机音量是否关闭或静音
3. iOS Safari 需要用户交互后才能自动播放音频（点击播放按钮或开启"自动播报"后手动触发一次）
4. 如果是网络请求失败，查看浏览器控制台是否有 `tts.convert` 错误

**Q: 麦克风语音输入按钮不见了？**

语音输入按钮仅在浏览器支持 `SpeechRecognition`（Web Speech API）时显示。

- Chrome / Edge / Android WebView 支持较好
- iOS Safari 需要 iOS 14.5+ 且需在 HTTPS 环境下使用（或 localhost）
- 非 HTTPS 环境中麦克风权限会被浏览器拒绝，按钮会自动隐藏

**Q: 如何使用 Cron 定时播报（天气/新闻/股票）？**

1. 在 `server/.env` 中设置 `INGEST_TOKEN=your-ingest-token`（不设置则不限制来源）
2. 在 OpenClaw 中配置 Cron 任务，将 `delivery.mode` 设为 `webhook`，`delivery.to` 设为：
   ```
   http://your-clawapp.example.com:3210/ingest/cron
   ```
3. 请求头加上 `X-Ingest-Token: your-ingest-token`（或用 `?token=xxx`）
4. 收到推送后，H5 会弹出顶部通知卡片，并在「播报中心」（🔔 按钮）中记录
5. 如需静默某段时间，在设置面板中开启「免打扰」并配置时间段

**Q: APK 唤醒词 "Claw Claw" 没有响应？**

1. **首先检查电池优化**（最常见原因）：设置 → 应用 → ClawApp → 电池 → 不受限制
2. 部分品牌（小米/OPPO/华为）还需在「自启动管理」中允许 ClawApp
3. 确认设置面板中「唤醒词监听」开关已开启
4. 确认手机安装了 Google 语音服务（国内定制 ROM 可能需要单独安装）
5. 唤醒词检测需要网络连接，请确认网络正常

---

<h2 id="security">安全建议</h2>

- 务必设置强 `PROXY_TOKEN`（建议 32 位以上随机字符串）
  ```bash
  openssl rand -hex 24
  ```
- Gateway Token 只在服务端 `.env` 中，不会暴露给客户端
- 公网访问建议使用 HTTPS（Cloudflare Tunnel 或 Nginx + SSL）
- 可选：使用 [Cloudflare Access](https://www.cloudflare.com/products/zero-trust/) 添加额外认证
- 部署到公网服务器时，务必设置防火墙规则，只开放必要端口（3210）
- 不要将 `.env` 文件提交到 Git（已在 `.gitignore` 中排除）

---

<h2 id="related">相关项目</h2>

- [OpenClaw](https://github.com/openclaw/openclaw) - AI 智能体平台
- [OpenClaw 中文汉化版](https://github.com/1186258278/OpenClawChineseTranslation) - 社区汉化
- [cftunnel](https://github.com/qingchencloud/cftunnel) - Cloudflare Tunnel 一键管理 CLI（推荐用于外网访问）
- [cftunnel-app](https://github.com/qingchencloud/cftunnel-app) - cftunnel 桌面客户端

---

<h2 id="community">社区交流</h2>

欢迎加入社区，交流使用心得、反馈问题、获取最新动态：

<table align="center">
  <tr>
    <td align="center"><img src="docs/image/qq.jpg" width="200" alt="QQ 群" /><br/><sub>QQ 群</sub></td>
    <td align="center"><img src="docs/image/wx.jpg" width="200" alt="微信群" /><br/><sub>微信群</sub></td>
  </tr>
</table>

- 🎮 [Discord 社区](https://discord.com/invite/U9AttmsNHh) — 国际交流频道
- 🤖 [元宝派社群圈子](https://yb.tencent.com/gp/i/LsvIw7mdR7Lb) — 腾讯元宝派讨论区

---

<details id="english">
<summary><strong>English Documentation</strong></summary>

### What is this?

ClawApp is an Android APK that lets you chat with your [OpenClaw](https://github.com/openclaw/openclaw) AI agent from your phone. Web browser access has been removed; the APK is the only supported client.

### Quick Start

**Step 1 — Deploy the proxy server:**

**Docker:**
```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp
echo 'PROXY_TOKEN=your-token' > .env
echo 'OPENCLAW_GATEWAY_TOKEN=your-gw-token' >> .env
docker compose up -d --build
```

**Direct:**
```bash
git clone https://github.com/qingchencloud/clawapp.git
cd clawapp/server && npm install
cp .env.example .env  # edit tokens
node index.js
```

**Step 2 — Install the APK:**

Download the latest APK from [GitHub Actions](https://github.com/candle233/clawapp/actions) or [Releases](https://github.com/candle233/clawapp/releases), install it on your Android phone, then enter your server address and token in the connection screen.

### Remote Access

- **cftunnel (recommended)**: `cftunnel quick 3210` — [github.com/qingchencloud/cftunnel](https://github.com/qingchencloud/cftunnel)
- **SSH Tunnel**: `ssh -f -N -R 0.0.0.0:3210:localhost:3210 user@server`
- **Nginx**: Configure WebSocket proxy to port 3210

### Cron Broadcast Ingest

```
POST http://your-clawapp:3210/ingest/cron
X-Ingest-Token: <INGEST_TOKEN>
Content-Type: application/json

{"title": "Weather", "text": "Sunny, 22°C"}
```

Set `INGEST_TOKEN` in `server/.env` to authenticate. Configure OpenClaw Cron with `delivery.mode=webhook` pointing to this endpoint.

### Features

Real-time streaming chat, image send & receive, Markdown rendering, offline message cache (IndexedDB), Ed25519 device auth, session management, dark/light/auto theme, English/Chinese i18n, smart reconnect (no flicker), XSS protection, token auth.

**New in this release:**
- 🔊 **TTS playback** — per-message voice button + auto-play setting (Gateway `tts.convert` RPC)
- 🎙️ **Voice input** — hold or tap mic button to dictate; fills textarea and optionally auto-sends (Web Speech API)
- 📣 **Broadcast Center** — receive scheduled Cron broadcasts via `POST /ingest/cron`; bell badge, notification cards, Do Not Disturb time range, per-item TTS
- 🤖 **APK resident mode** (Android only) — foreground service + "Claw Claw" wake word → voice input → AI reply → auto TTS

</details>

---

<p align="center">
  由 <a href="https://qt.cool">晴辰云</a> 开发维护<br/>
  <a href="https://clawapp.qt.cool">clawapp.qt.cool</a>
</p>

## License

MIT
