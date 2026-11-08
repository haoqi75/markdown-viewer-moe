---
outline: doc
---

# 关于 Moe Markdown Viewer

<p align="center">
  <img src="/icon.png" alt="Moe Markdown Viewer 图标" width="128">
</p>

## 这是什么作品

![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green?logo=node.js&style=for-the-badge)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-blue?logo=pnpm&style=for-the-badge)](https://pnpm.io)
[![Gulp](https://img.shields.io/badge/Gulp-5.x-red?logo=gulp&style=for-the-badge)](https://gulpjs.com)
[![Platform](https://img.shields.io/badge/platform-Web-emerald.svg?style=for-the-badge&logo=codeforces)](https://moe520.cc.cd/)

这是由 AI 生成的 Moe Markdown 查看器 · 萌系主题 · 开箱即用

Moe美化、强大功能的Markdown预览器

## 作品故事

此作品基于[AI Markdown](https://github.com/haoqi75/ai-markdown-old)（我的老版首页，项目已停止更新）生成和修复内容，专门给Moe爱好提供的Markdown预览器。功能增强，修复了老版本错误。

我做了这个作品是为了可以让你们拥有 Markdown 网页预览器。把你的普通 Markdown 页面变成 Moe 好看的页面，纯静态前端、单文件、以及JSON配置文件编辑工具。

::: note
此作品为 **AI** 生成，部分代码可能会缺失，我毕竟也不知道如何修复有些问题，所以可能全靠 **AI** 修复，谢谢理解。
:::

## ✨ 特色

- 🎀 **萌系主题** – 粉紫渐变、毛玻璃效果、浮动装饰、标题小图标
- 📑 **智能目录** – 自动提取 `h1~h6`，点击平滑滚动并自动关闭，滚动时 URL 自动更新
- 🔗 **标题锚点** – h1~h6 左侧显示 🌸🌿🍀💮🌺🌻 可点击跳转图标，桌面 hover 显示
- 🦘 **锚点导航** – 支持 Markdown `[text](#heading)` 锚点，点击平滑滚动不重载
- 🛣️ **别名路由** – 支持 `?p=test` 形式的参数别名，无需修改服务器配置
- 💕 **萌系错误页** – 加载失败时显示吉祥物 + 大号状态码 + 中文提示
- 🐾 **加载动画** – 加载中显示 loading.png 弹跳吉祥物 + spinner
- 🖼️ **图片容错** – 加载失败的图片自动替换为吉祥物占位提示
- 🔍 **图片预览** – 点击图片毛玻璃遮罩放大预览，Esc 关闭
- 🎨 **TOC 装饰** – 侧栏顶部 sit-down 吉祥物 + 可配置对话气泡
- 🐱 **GitHub 图标** – 右上角猫咪图标直达仓库，吉祥物 hover 对话泡泡
- ⚙️ **灵活配置** – `config.json` 轻松设置默认文档和别名映射
- 🔧 **开发友好** – 使用 Gulp 构建，支持 `pnpm dev` 实时预览 + 热重载
- 📦 **单文件交付** – 构建后生成 `dist/index.html`，所有资源内联，部署简单
- 🏷️ **版本号页脚** – 页脚自动显示版本号和 Git 提交 hash，方便追踪部署版本
- 📱 **移动端主题色** – 自动适配浏览器顶部主题色为萌粉色
- 🎨 **颜色主题切换** – 6 种颜色主题（粉/蓝/绿/紫/白/黄），支持配置和 Release 编辑
- 🔗 **专属链接生成** – Tools 内置 Base64 链接生成器，支持多线路网关一键合成
- 🧩 **自定义注入** – 通过 `config.json` 的 `headInject`/`bodyInject` 自由注入 HTML
- 💻 **代码高亮** – 集成 Prism.js，代码块美观易读
- 🦊 **萌系吉祥物** – 可配置透明背景的右下角角色，为页面增添活力
- 📝 **自定义页脚** – 支持 Markdown 的页脚内容，轻松添加版权或链接

## 🛠️ 技术栈
- **[marked](https://marked.js.org/)** – Markdown 解析
- **[Prism.js](https://prismjs.com/)** – 代码高亮
- **[Gulp](https://gulpjs.com/)** – 构建工具（内联、压缩）
- **[browser-sync](https://browsersync.io/)** – 开发服务器（热重载）
- **[pnpm](https://pnpm.io/)** – 包管理
- **[npm-run-all2](https://github.com/mysticatea/npm-run-all)** – 编排构建任务

## ⭐ Star 历史

<div align="center">
<a href="https://www.star-history.com/?repos=haoqi75%2Fmarkdown-viewer-moe&type=timeline&logscale=&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&theme=dark&logscale&legend=bottom-right&sealed_token=3X3PCxJH5Y_CftorWNMDLyeY7hmF3x_EOZ1MNxiydzdoAcWZiRFDykUDeFRn3EQuvZJkJargBZSEtYm72dWJJ3WESDivZ5SnD4FOqV6rKel42lPDC9ztQA" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&logscale&legend=bottom-right&sealed_token=3X3PCxJH5Y_CftorWNMDLyeY7hmF3x_EOZ1MNxiydzdoAcWZiRFDykUDeFRn3EQuvZJkJargBZSEtYm72dWJJ3WESDivZ5SnD4FOqV6rKel42lPDC9ztQA" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&logscale&legend=bottom-right&sealed_token=3X3PCxJH5Y_CftorWNMDLyeY7hmF3x_EOZ1MNxiydzdoAcWZiRFDykUDeFRn3EQuvZJkJargBZSEtYm72dWJJ3WESDivZ5SnD4FOqV6rKel42lPDC9ztQA" />
 </picture>
</a>
</div>

## 🤝 贡献

<p align="left">
  <img src="/stars.png" alt="准备好要部署我了吗" width="220">
</p>

欢迎提出 Issue 或 Pull Request！
如果您喜欢这个项目，别忘了点个 **⭐Star** 哦～

## 📄 License

MIT © [ApHeQua758](https://github.com/haoqi75)

## 💖 致谢

本项目由 [AI](https://github.com/) 辅助生成，融合了人类审美与机器效率，愿为您的 Markdown 阅读带来一丝惬意。