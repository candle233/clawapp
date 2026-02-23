# ClawApp APK 打包 & 安装指南

本文档介绍两种将 ClawApp 打包为 Android APK 的方式，以及如何把 APK 安装到手机上。

---

## 目录

- [方式一：GitHub Actions 自动构建（推荐）](#方式一github-actions-自动构建推荐)
  - [1.1 手动触发构建](#11-手动触发构建)
  - [1.2 打 Tag 自动触发](#12-打-tag-自动触发)
  - [1.3 下载 APK](#13-下载-apk)
- [方式二：本地手动构建](#方式二本地手动构建)
  - [2.1 环境要求](#21-环境要求)
  - [2.2 构建步骤](#22-构建步骤)
- [Release 签名（可选）](#release-签名可选)
  - [3.1 生成签名密钥](#31-生成签名密钥)
  - [3.2 配置 GitHub Secrets](#32-配置-github-secrets)
- [安装 APK 到手机](#安装-apk-到手机)
  - [4.1 开启允许未知来源安装](#41-开启允许未知来源安装)
  - [4.2 安装方式](#42-安装方式)
- [APK 版本说明](#apk-版本说明)
- [常见问题](#常见问题)

---

## 方式一：GitHub Actions 自动构建（推荐）

不需要在本地安装 Android SDK，由 GitHub 服务器自动完成编译，几分钟后下载 APK 即可。

### 1.1 手动触发构建

1. 打开你 Fork 的仓库页面（或本仓库）
2. 点击顶部 **Actions** 标签页
3. 在左侧列表找到 **Build Android APK**
4. 点击右侧 **Run workflow** 按钮
5. 填写版本号（如 `1.0.0`），选择是否创建 Release，点击 **Run workflow**

![手动触发示意](https://docs.github.com/assets/cb-25660/mw-1440/images/help/actions/workflow-dispatch-form.webp)

6. 等待约 **5–10 分钟**，构建完成后在该次运行的详情页下载 APK

### 1.2 打 Tag 自动触发

每次推送 `v` 开头的 Git Tag，工作流会自动运行并创建 GitHub Release：

```bash
# 在本地仓库执行
git tag v1.0.0
git push origin v1.0.0
```

构建完成后在仓库 **Releases** 页面即可看到 APK 下载链接。

### 1.3 下载 APK

**从 Actions 下载（每次构建都有）：**
1. 进入 Actions → 选择一次构建记录
2. 页面底部 **Artifacts** 区域，点击 `clawapp-x.x.x-debug` 下载压缩包
3. 解压得到 `clawapp-x.x.x-debug.apk`

**从 Releases 下载（打 Tag 后）：**
1. 仓库主页右侧 → **Releases**
2. 找到最新版本，点击 APK 文件名直接下载

---

## 方式二：本地手动构建

在本机安装 Android 开发环境后自行编译。

### 2.1 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | [下载](https://nodejs.org/) |
| JDK | 17 或 21 | 推荐 [Eclipse Temurin](https://adoptium.net/) |
| Android SDK | API 36 (compileSdk) | 通过 Android Studio 安装 |
| Android Studio | 任意最新版 | [下载](https://developer.android.com/studio)（可选，但推荐） |

> 💡 **最简单的方式**：安装 Android Studio，它会自动安装 JDK 和 Android SDK。

#### 配置 Android SDK 环境变量

```bash
# macOS / Linux（添加到 ~/.zshrc 或 ~/.bashrc）
export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
# export ANDROID_HOME=$HOME/Android/Sdk               # Linux
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Windows（PowerShell，永久生效需在系统环境变量中设置）
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"
```

### 2.2 构建步骤

```bash
# 1. 克隆仓库
git clone https://github.com/candle233/clawapp.git
cd clawapp

# 2. 安装根目录和 H5 依赖
npm ci
cd h5 && npm ci && cd ..

# 3. 构建 H5 前端资源
npm run build:h5

# 4. 将 H5 产物同步到 Android 项目
npx cap sync android

# 5. 编译 Debug APK
cd android
chmod +x gradlew          # macOS / Linux
./gradlew assembleDebug   # macOS / Linux
# gradlew assembleDebug   # Windows

# APK 输出路径：
# android/app/build/outputs/apk/debug/app-debug.apk
```

构建成功后，APK 文件位于：

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Release 签名（可选）

Debug APK 可以直接安装，但**无法上架应用商店**且每次更新都需要先卸载。Release 签名 APK 支持覆盖安装升级。

### 3.1 生成签名密钥

> ⚠️ **密钥文件务必妥善保管**，丢失后无法用同一签名发布更新。

```bash
# 生成 keystore（执行一次即可，长期使用）
keytool -genkey -v \
  -keystore clawapp-release.keystore \
  -alias clawapp \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass 你的密钥库密码 \
  -keypass 你的密钥密码 \
  -dname "CN=ClawApp, O=Your Name, C=CN"
```

> `keytool` 包含在 JDK 中，JDK 安装后可直接使用。

### 3.2 配置 GitHub Secrets

将密钥以 Secrets 方式存入 GitHub，工作流自动使用：

```bash
# 将 keystore 转为 base64 字符串
# macOS
base64 -i clawapp-release.keystore | pbcopy   # 结果已复制到剪贴板

# Linux
base64 -w 0 clawapp-release.keystore

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("clawapp-release.keystore"))
```

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加以下 4 个 Secret：

| Secret 名称 | 值 |
|-------------|-----|
| `KEYSTORE_BASE64` | 上面输出的 base64 字符串 |
| `KEYSTORE_PASSWORD` | keystore 密钥库密码 |
| `KEY_ALIAS` | `clawapp`（或你设置的别名） |
| `KEY_PASSWORD` | 密钥密码 |

配置完成后，下次触发构建会同时产出 Debug 和 **Release（已签名）** 两个 APK。

#### 本地签名构建

```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=/绝对路径/clawapp-release.keystore \
  -Pandroid.injected.signing.store.password=你的密钥库密码 \
  -Pandroid.injected.signing.key.alias=clawapp \
  -Pandroid.injected.signing.key.password=你的密钥密码

# APK 输出路径：
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 安装 APK 到手机

### 4.1 开启允许未知来源安装

Android 默认禁止安装非应用商店的 APK，需要先开启：

**Android 8.0+（分应用授权）：**
1. 设置 → 应用 → 特殊应用权限 → 安装未知应用
2. 找到你用来安装 APK 的应用（文件管理器 / 浏览器），开启"允许来自此来源的应用"

**Android 7 及以下：**
1. 设置 → 安全 → 开启"未知来源"

### 4.2 安装方式

#### 方法 A：直接用手机浏览器下载安装（最简单）

1. 用手机浏览器打开 GitHub Releases 页面或 Actions 产物链接
2. 点击 APK 文件下载
3. 下载完成后点击通知栏提示 → 直接安装

#### 方法 B：通过文件传输安装

1. 将 APK 传到手机（数据线 / 微信文件 / AirDrop / 蓝牙）
2. 在手机上用文件管理器找到 APK 文件
3. 点击安装

#### 方法 C：ADB 命令安装（开发者推荐）

适合频繁更新调试的场景：

```bash
# 开启手机开发者选项并启用 USB 调试后执行
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# -r 参数表示允许覆盖安装（不卸载直接更新）
```

---

## APK 版本说明

| 类型 | 文件名示例 | 说明 |
|------|-----------|------|
| **Debug** | `clawapp-1.0.0-debug.apk` | 无需签名，可直接安装；含调试信息；**适合日常使用** |
| **Release** | `clawapp-1.0.0-release.apk` | 需要签名配置；体积更小，性能更好；支持覆盖安装升级 |

> 💡 **日常使用建议用 Debug 版**：功能完全相同，只是包含了额外的调试符号，体积略大（约 5–10 MB）。Release 版主要用于分发给他人或有洁癖时使用。

---

## 常见问题

**Q: 安装时提示"解析软件包时出现问题"？**

- 可能是 APK 下载不完整。重新下载，检查文件大小（正常 Debug APK 约 8–15 MB）
- 确认手机 Android 版本 ≥ 7.0（minSdkVersion 24）

**Q: 本地构建报错 `SDK location not found`？**

未配置 `ANDROID_HOME` 环境变量，或者需要在 `android/local.properties` 中手动指定：

```properties
# android/local.properties（自动生成，也可手动创建）
sdk.dir=/Users/你的用户名/Library/Android/sdk        # macOS
# sdk.dir=C\:\\Users\\你的用户名\\AppData\\Local\\Android\\Sdk  # Windows
```

**Q: Gradle 构建很慢，一直在下载？**

首次构建需要下载 Gradle 发行版（约 150 MB）和 Android 依赖。国内用户可配置镜像：

```gradle
// android/build.gradle 中修改 repositories
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/central' }
}
```

**Q: Actions 构建失败，提示 `License for package Android SDK Build-Tools xx not accepted`？**

这是正常的自动构建行为，工作流中的 `android-actions/setup-android@v3` 会自动接受许可证。如果仍然失败，检查工作流日志中的具体错误信息。

**Q: 如何更新 APK？**

- **Debug 版**：直接安装新版本会提示签名不同，需要先卸载再安装
- **Release 版（同签名）**：可以直接覆盖安装，保留所有设置和数据

**Q: 安装后打开 App 显示空白？**

服务端可能未运行。确保代理服务端已启动（`npm start` 或 Docker），然后在 App 连接页中填入正确的服务器地址和 Token。

---

> 📖 更多使用说明请参阅 [README.md](../README.md)
