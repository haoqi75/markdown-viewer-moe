# 🌸 Moe Markdown Viewer

<p align="center">
  <img src="images/icon.png" alt="Moe Markdown Viewer 图标" width="128">
</p>

> 由 AI 生成的 Moe Markdown 查看器 · 萌系主题 · 开箱即用

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg?style=for-the-badge)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-blue?logo=pnpm&style=for-the-badge)](https://pnpm.io)
[![Gulp](https://img.shields.io/badge/Gulp-5.x-red?logo=gulp&style=for-the-badge)](https://gulpjs.com)
[![Deploy static content to Pages](https://img.shields.io/github/actions/workflow/status/haoqi75/markdown-viewer-moe/static.yml?style=for-the-badge&label=Deploy%20static%20content%20to%20Pages)](https://github.com/haoqi75/markdown-viewer-moe/actions/workflows/static.yml)
[![Release to GitHub Releases](https://img.shields.io/github/actions/workflow/status/haoqi75/markdown-viewer-moe/release.yml?style=for-the-badge&label=Release%20to%20GitHub%20Releases&labelColor=violet)](https://github.com/haoqi75/markdown-viewer-moe/actions/workflows/release.yml)
[![GitHub Tag](https://img.shields.io/github/v/tag/haoqi75/markdown-viewer-moe?style=for-the-badge&label=%E7%89%88%E6%9C%AC&color=pink)](https://github.com/haoqi75/markdown-viewer-moe/tags)
![GitHub Repo stars](https://img.shields.io/github/stars/haoqi75/markdown-viewer-moe?style=for-the-badge&label=%E2%AD%90%20Stars&color=yellow)
[![GitHub Downloads](https://img.shields.io/github/downloads/haoqi75/markdown-viewer-moe/total?style=for-the-badge&label=%E4%B8%8B%E8%BD%BD%E9%87%8F&color=cyan)](https://github.com/haoqi75/markdown-viewer-moe/releases)

![:markdown-viewer-moe](https://count.getloli.com/@:markdown-viewer-moe?theme=moebooru&padding=1)

---

## 🌐 在线演示

打开[https://moe520.haoqi75.os.kg/](https://moe520.haoqi75.os.kg/)即可使用。

---

## ✨ 特色

- 🎀 **萌系主题** – 粉紫渐变、毛玻璃效果、浮动装饰、标题小图标
- 📑 **智能目录** – 自动提取 `h1~h6`，点击平滑滚动，滚动时 URL 自动更新
- 🦘 **锚点导航** – 支持 Markdown `[text](#heading)` 锚点，点击平滑滚动不重载
- 🛣️ **别名路由** – 支持 `?p=test` 形式的参数别名，无需修改服务器配置
- 💕 **萌系错误页** – 加载失败时显示吉祥物 + 大号状态码 + 中文提示
- 🖼️ **图片容错** – 加载失败的图片自动替换为吉祥物占位提示
- 🔍 **图片预览** – 点击图片放大预览，毛玻璃遮罩，Esc/点击空白关闭
- 🐱 **GitHub 图标** – 右上角猫咪图标直达仓库，吉祥物 hover 对话泡泡
- ⚙️ **灵活配置** – `config.json` 轻松设置默认文档和别名映射
- 🔧 **开发友好** – 使用 Gulp 构建，支持 `pnpm dev` 实时预览 + 热重载
- 📦 **单文件交付** – 构建后生成 `dist/index.html`，所有资源内联，部署简单
- 💻 **代码高亮** – 集成 Prism.js，代码块美观易读
- 🦊 **萌系吉祥物** – 可配置透明背景的右下角角色，为页面增添活力
- 📝 **自定义页脚** – 支持 Markdown 的页脚内容，轻松添加版权或链接

---

## 📷 预览

| 桌面端 | 移动端 |
|:------:|:------:|
| ![桌面预览](images/desktop.png) | ![移动预览](images/mobile.jpg) |

---

## 🚀 快速开始

### 下载编辑好的

[![GitHub Release](https://img.shields.io/github/v/release/haoqi75/markdown-viewer-moe?display_name=release&style=for-the-badge)](https://github.com/haoqi75/markdown-viewer-moe/releases)

从**v1.4.0**后，支持直接编辑index.html，从[Releases](https://github.com/haoqi75/markdown-viewer-moe/releases)下载一个叫`index.release.html`的文件，直接使用记事本编辑上面的内容：
```html
<!--
  ╔══════════════════════════════════════════════╗
  ║  RELEASE CONFIG — 编辑 defaultUrl 和 aliases  ║
  ║  修改下方 JSON 后保存，直接部署即可            ║
  ╚══════════════════════════════════════════════╝
-->
<script id="release-config" type="application/json">
{
  "defaultUrl": "https://your-default-api.com/raw/index.md",
  "aliases": {
        "test": "https://another-api.com/raw/rypa",
        "docs": "https://docs.example.com/readme.md"
  }
}
</script>
<!-- RELEASE CONFIG END -->
<!DOCTYPE html>...
```
编辑后保存，可以重命名为`index.html`，打开或上传到服务器。[更多信息](#使用方式)

---

### 本地部署

#### 前置要求
- Node.js 24+（避免错误，因为这是我开发的Node.js版本）
- pnpm 11.x或者更高（跟Node.js一样）

#### 克隆项目
```bash
git clone https://github.com/haoqi75/markdown-viewer-moe.git
cd markdown-viewer-moe
```

#### 安装依赖
```bash
pnpm install
```

#### 开发模式（自动预览 + ~~热重载~~ 临时还没有做到这一点）
```bash
pnpm dev
# 请手动打开 http://localhost:8520
```

#### 生产构建
```bash
pnpm build
# 代码会生成到 dist/index.html 喔~
```

#### 构建Release版本
```bash
pnpm build:release
# 代码会生成到 dist/index.release.html 喔~
```

---

### 自动部署到GitHub Pages

Actions文件在：`.github/workflows/static.yml`

1. **Fork** 和 **⭐Star** 此仓库。
2. 在`Settings`->`Pages`里面找到**Build and deployment**。
3. 在`Source`选项选择`GitHub Actions`。
4. （可选）在`Custom domain`里可以添加你自己的域名。
5. 编辑`src/config.json`，把内容替换成你自己想要的。
6. 转到`Actions`，开启它，在左菜单里找到`Deploy static content to Pages`。
    * 手动触发：点击 **Run Workflow**。
    * 自动触发：每当更改任何文件会自动触发。

祝你一切顺利~

---

## 🌐使用方式

这是一个单独的**html**文件，可以直接打开或者上传到
- GitHub Pages
- Cloudfare Pages
- Netlify
- Vercel
- 任何html服务器

---

## ⚙️ 配置说明

所有配置位于 `src/config.json`：

```json
{
    "title": "🌸 萌·Markdown 预览器：我的专属 Markdown 空间",
    "logo": {
        "text": "📝 萌·Markdown",
        "sub": "我的专属 Markdown 空间"
    },
    "logoImage": "img/favicon.svg",
    "icon": {
        "svg": "img/favicon.svg",
        "ico": "img/favicon.ico",
        "apple": "img/apple-touch-icon.png"
    },
    "footer": "[萌·Markdown](https://github.com/haoqi75/markdown-viewer-moe) | 由 ApHeQua758 与 AI 创建",
    "mascot": "img/mascot.png",
    "defaultUrl": "https://your-default-api.com/raw/index.md",
    "aliases": {
        "test": "https://another-api.com/raw/rypa",
        "docs": "https://docs.example.com/readme.md"
    }
}
```

- **defaultUrl**：当没有匹配别名或 `?md=` 参数时的默认文档地址。
- **aliases**：键为访问路径（如 `?p=vmdownload`），值为实际的 Markdown 文件 URL。

> 访问 `?md=直接URL` 将覆盖所有配置，优先级最高。

---

## 📂 项目结构
```tree
markdown-viewer-moe/
├── .github/
│   └── workflows/
│        ├── release.yml    # 自动发布Release
│        └── static.yml     # 自动构建并推送到GitHub Pages
├── images/                  # 图片
├── script/
│   └── release.js          # Release版本构建代码
├── src/
│   ├── img/                # 图标文件夹
│   ├── index.html          # 主页面
│   ├── style.css           # 萌系样式
│   ├── script.js           # 主要逻辑（TOC、渲染、路由）
│   └── config.json         # 配置文件
├── dist/                   # 构建输出（仅含 index.html）
├── gulpfile.js             # Gulp 构建脚本
├── package.json            # 项目依赖和脚本
├── LICENSE                 # LICENSE
└── README.md               # 就是这个文件啦~
```

---

## 🛠️ 技术栈
- [marked](https://marked.js.org/) – Markdown 解析
- [Prism.js](https://prismjs.com/) – 代码高亮
- [Gulp](https://gulpjs.com/) – 构建工具（内联、压缩）
- [http-server](https://github.com/http-party/http-server) – 开发服务器
- [pnpm](https://pnpm.io/) – 包管理

---

## ⭐Star 历史

<a href="https://www.star-history.com/?repos=haoqi75%2Fmarkdown-viewer-moe&type=timeline&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=haoqi75/markdown-viewer-moe&type=timeline&legend=bottom-right" />
 </picture>
</a>

---

## 🤝 贡献
欢迎提出 Issue 或 Pull Request！
如果您喜欢这个项目，别忘了点个 **⭐Star** 哦～

---

## 📄 License
MIT © [ApHeQua758](https://github.com/haoqi75)

---

## 💖 致谢
本项目由 [AI](https://github.com/) 辅助生成，融合了人类审美与机器效率，愿为您的 Markdown 阅读带来一丝惬意。
