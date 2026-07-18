# 🌸 萌·Markdown 配置文件生成器 (Moe JSON Editor) 🌸

[![Version](https://img.shields.io/badge/version-1.5.0-pink.svg)](https://github.com/haoqi75/markdown-viewer-moe)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/haoqi75/markdown-viewer-moe)
[![Platform](https://img.shields.io/badge/platform-Web-emerald.svg)](https://github.com/haoqi75/markdown-viewer-moe)

> **✨ 小白配置文件简易生成编辑器 · 萌化极简版 ✨**
>
> 专为「萌·Markdown 预览器」打造的图形化、低门槛 `config.json` 配置文件生成器与独立 `index.release.html` 打包工具。所有操作在本地浏览器安全、隐私地运行。

---

## 🎨 页面预览与设计理念

本工具摒弃了冷冰冰、充满学术感的传统 JSON 编辑器界面，而是围绕 **“萌化与小白友好”** 展开：
- **糖果粉色系视觉 (Moe Canvas)**: 采用暖色调高对比粉粉背景，结合呼吸动画与精致的柔和卡片，营造放松舒适的编辑氛围。
- **可爱专属字体设计**: 页面主字体集成了治愈系手写英文 `Fredoka` 与可爱中文 `ZCOOL KuaiLe`（快乐体），让每一次点击、每一个字符都散发着可爱能量。
- **智能看板娘「小萌」 (Interactive Mascot)**: 你的专属配置小助手！她会根据你的操作实时响应，展现「发呆、开心、眨眼、委屈、兴奋」五种可爱表情，并用温暖、人文化的语句提示、引导你。

---

## 🚀 核心功能模块

### 1. 📂 基础模板设定与双模式编辑
本工具提供两种极简而规范的初始预设模板，直接在主界面进行切换：
* **完整版 (萌·Markdown 预览器)**: 对应直接编辑、保存与一键下载本地的独立 `config.json`。
* **基础·发布配置模板**: 专门为了编辑带有内嵌 JSON 数据的网页文件。你可以直接通过其内嵌的发布端工具，读取、重新打包并下载 `index.release.html`。
* **可视化表单 + 源码对比**: 既可以通过可交互、带类型约束和验证的输入表单修改各个字段，也可以随时通过源码标签页实时直观地查看生成的 JSON 变动，对小白和极客都非常友好。

### 2. 📦 `index.release.html` 预发布端配置工具
专为独立、可部署的 Markdown 预览单网页提供配置热更新：
* **读取与提取**: 点击上传你本地已有的 `index.release.html`，系统会自动搜寻并安全读取 HTML 内嵌 `<script id="release-config" type="application/json">` 标记中的配置。
* **配置打包机制 (v1.3.1+ 限制)**: 允许在右侧修改、调整配置 JSON。修改后只需点击一键打包，更新后的配置会**精准写回**模板，并让你下载全新的、即刻可部署上线的 `index.release.html`！
* *注：为确保数据安全，你必须先上传一次已有 HTML 模板作为模板框架，才可以执行下载。仅上传 `config.json` 时将显示温馨提示并禁用下载。*

### 3. 🔐 Base64 ＆ Markdown 专属链接生成助手 (v1.4.3 新增)
专为 Markdown 订阅或配置场景设计的链式转换与加解密中心，包含两个大模式：
* **🔗 Markdown 专属链接生成器**: 输入自定义的 Markdown 原始 Raw 链接（支持带复杂 Query 参数的 URL），自动对链接进行安全的 Base64 转换。通过将 URL 参数隐藏，能够有效防范浏览器或服务器对 `&` 和 `?` 带来的截断和解析乱码。
* **🌐 多线路/自适应网关绑定**: 预设支持多线路绑定，也支持任意手动输入：
  - 主线路：`https://moe520.haoqi75.os.kg/`
  - 备用线路：`https://moe520.haoqi75.cn.mt/`
  - 自定义前缀：用户可任意定义和自定义域名、前缀或调试端口。
* **⚡ 极速打开与复制**: 生成后可直接点击「立即打开测试」在浏览器新窗口中预览该 Markdown 原文，或者一键复制最终合成的完整加载 URL。
* **🔐 通用 Base64 加解密**: 专门针对中文乱码问题进行了算法调优，使用 `btoa(encodeURIComponent(...))` 安全编解码机制，保证任何特殊符号或中文字符集能完美加解密而不丢失。

### 4. 📳 移动端适配与主题整合 (v1.4.1+)
* **多媒介主题颜色定制**: 加入 `<meta name="theme-color">`，使在移动端浏览器（Safari、Chrome 等）或渐进式 Web 应用（PWA）环境下，顶部状态栏和系统边框会根据设备本身的黑夜/白日主题自适应变色，极致流畅。
* **移动端自适应**: 卡片与表单完美支持手机触控与流式布局。

---

## 🛠️ 构建与部署

本作品配备有专业的本地 **Gulp 单网页打包压缩器 (Single-file Compiler)**。可以将所有的 React 代码、Tailwind CSS 样式表、Lucide 图标库、以及 Base64 化的图标资源**彻底合成为仅 1 个 `tools.html` 单网页文件**。

### 快速开发
```bash
# 1. 安装项目依赖
npm install

# 2. 启动本地开发服务 (默认运行在 3000 端口)
npm run dev
```

### 生成单网页发布版
如果你想打包出一个完全单网页、可以双击在任何无网电脑、或托管在任意静态空间的单网页工具包：
```bash
# 构建并打包 tools.html
npm run build:html
```
构建完成后，在 `/dist` 目录下将会产出 `tools.html`。

---

## 🌸 贡献与反馈

如果你对本项目有任何可爱的想法、BUG 反馈、或者是样式上的建议：
- **GitHub 仓库链接**: [https://github.com/haoqi75/markdown-viewer-moe](https://github.com/haoqi75/markdown-viewer-moe)
- 欢迎到 GitHub 发起 Issue、PR，或者为「小萌」点亮一颗 Star ⭐️！

---
*✨ 小萌祝您配置愉快，每一天都充满粉色好心情！✨*
