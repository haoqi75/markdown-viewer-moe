# 🌸 Moe Markdown Viewer

<p align="center">
  <img src="images/icon.png" alt="Moe Markdown Viewer 图标" width="128">
</p>

> 由 AI 生成的 Moe Markdown 查看器 · 萌系主题 · 开箱即用

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg?style=for-the-badge)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-blue?logo=pnpm&style=for-the-badge)](https://pnpm.io)
[![Gulp](https://img.shields.io/badge/Gulp-5.x-red?logo=gulp&style=for-the-badge)](https://gulpjs.com)
[![Build and deploy to Github Pages](https://img.shields.io/github/actions/workflow/status/haoqi75/markdown-viewer-moe/static.yml?style=for-the-badge&label=Build%20and%20deploy%20to%20Github%20Pages)](https://github.com/haoqi75/markdown-viewer-moe/actions/workflows/static.yml)
[![Build to GitHub Releases](https://img.shields.io/github/actions/workflow/status/haoqi75/markdown-viewer-moe/release.yml?style=for-the-badge&label=Build%20to%20GitHub%20Releases&labelColor=violet)](https://github.com/haoqi75/markdown-viewer-moe/actions/workflows/release.yml)
[![GitHub Tag](https://img.shields.io/github/v/tag/haoqi75/markdown-viewer-moe?style=for-the-badge&label=%E7%89%88%E6%9C%AC&color=pink)](https://github.com/haoqi75/markdown-viewer-moe/tags)
[![GitHub Repo stars](https://img.shields.io/github/stars/haoqi75/markdown-viewer-moe?style=for-the-badge&label=%E2%AD%90%20Stars&color=yellow)](https://github.com/haoqi75/markdown-viewer-moe/stargazers)
[![GitHub Downloads](https://img.shields.io/github/downloads/haoqi75/markdown-viewer-moe/total?style=for-the-badge&label=%E4%B8%8B%E8%BD%BD%E9%87%8F&color=cyan)](https://github.com/haoqi75/markdown-viewer-moe/releases)

![:markdown-viewer-moe](https://count.getloli.com/@:markdown-viewer-moe?theme=moebooru&padding=1)

此作品基于[AI Markdown](https://github.com/haoqi75/haoqi75)（我的老版首页，已停止更新）生成和修复内容，专门给Moe爱好提供的Markdown预览器。功能增强，修复了老版本错误。

> [!NOTE]
> 此作品为 **AI** 生成，部分代码可能会缺失，我毕竟也不知道如何修复有些问题，所以可能全靠 **AI** 修复，谢谢理解。

仓库源码：https://github.com/haoqi75/markdown-viewer-moe

备份仓库源码：https://codeberg.org/haoqi75/markdown-viewer-moe

---

## 🌐 在线演示

打开*以下地址*即可使用。

主地址：https://moe520.haoqi75.os.kg/

备用地址：https://moe520.haoqi75.cn.mt/

---

## 📝 简单编辑 config.json 工具

请打开 [tools.html](https://moe520.haoqi75.os.kg/tools.html) 或者[备用地址](https://moe520.haoqi75.cn.mt/tools.html)来简单编辑。

**v1.9.3**后，点击上面的 `[>]` （Json编辑器）即可打开编辑器。

---

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

<p align="left">
  <img src="images/ready-to-deploy.png" alt="准备好要部署我了吗" width="220">
</p>

### 下载编辑好的

[![GitHub Release](https://img.shields.io/github/v/release/haoqi75/markdown-viewer-moe?display_name=release&style=for-the-badge)](https://github.com/haoqi75/markdown-viewer-moe/releases)

从**v1.4.0**后，支持直接编辑index.html，从 [Releases](https://github.com/haoqi75/markdown-viewer-moe/releases) （或者[备份仓库Release](https://codeberg.org/haoqi75/markdown-viewer-moe/releases)）下载一个叫`index.release.html`的文件，直接使用记事本编辑上面的内容：
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

从 **tools-v1.2.0** 后，若不会编辑也可以使用[简单编辑 config.json 工具](#简单编辑-config.json-工具)来编辑。

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

#### 开发模式（自动预览 + 热重载）
```bash
pnpm dev
# 请手动打开 http://localhost:8520
```

#### 生产构建
```bash
# 构建软件
pnpm build
# 代码会生成到 dist/index.html 喔~

# 构建Tools
pnpm build:tools
# 代码会生成到 dist/tools.html 喔~
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
6. 转到`Actions`，开启它，在左菜单里找到`Build and deploy to Github Pages`。
    * 手动触发：点击 **Run Workflow**。
    * 自动触发：每当更改任何文件会自动触发。

祝你一切顺利~

---

### 自动部署到Codeberg Pages

Actions文件在：`.forgejo/workflows/static.yml`

1. **Fork** 和 **⭐Star** 此仓库。
2. 在`设置`->`仓库功能`->`概览`里面找到**使用Forgejo Actions启用集成CI/CD管道**并开启它。
3. 编辑`src/config.json`，把内容替换成你自己想要的。
4. 编辑`.forgejo/workflows/static.yml`里面的内容
    ```yaml
    // 在37行找到并替换一下代码
    - name: Deploy to Codeberg Pages
        uses: https://codeberg.org/git-pages/action@v2
        with:
          source: ./dist
          site: https://${{ forge.repository_owner }}.codeberg.page/markdown-viewer-moe/
          token: ${{ forge.token }}
    ```
5. 转到`Actions`，开启它，在左菜单里找到`Build and deploy to Codeberg Pages`。
    * 手动触发：点击 **Run Workflow**。
    * 自动触发：每当更改任何文件会自动触发。

---

## 🌐如何使用

> [!WARNING]
> 请确保你的Markdown可以被浏览器访问，Markdown纯文本（Raw），并服务器拥有CORS配置正确，否则无法加载。

### 上传或打开html文件

这是一个单独的**html**文件，可以直接打开或者上传到
- GitHub Pages
- Codeberg Pages
- Cloudfare Pages
- Edgeone Pages
- Netlify
- Vercel
- 任何html服务器

---

### 使用方式

- 方法1：通过编辑 `config.json` 里的 `"defaultUrl"` 和 `"aliases"` （[见下方](#配置说明)）然后重新构建（[见本地部署](#本地部署)）。
- 方法2：下载[Release](#下载编辑好的)文件。按照步骤编辑。
- 方法3：在地址栏提供参数，在地址栏写`?md=<base64 url>`即可访问到Markdown文件。

---

### 地址参数

- `?p=`：别名，在[配置文件](#配置说明)或 [Release](#下载编辑好的) 头部编辑别名，别名编辑好后，可以按照这个方式访问：
  ```url
  http://127.0.0.1:8520/?p=page
  ```
  或者：
  ```url
  https://moe520.haoqi75.os.kg/?p=page
  ```
- `?md=`：加载其他Markdown地址，使用Base64加密地址，按照以下方式访问：
  ```url
  http://127.0.0.1:8520/?md=aHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0Lm1kCg==
  ```
  或者：
  ```url
  https://moe520.haoqi75.os.kg/?md=aHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0Lm1kCg==
  ```

>[!TIP]
>加密base64可以使用 `btoa('https://...')` 在浏览器控制台编码。或者在终端输入 `echo "https://..." | base64` 也可以获取base64加密。
>从tools v1.4.0 后可以使用它加密。具体使用访问[tools.html](https://moe520.haoqi75.os.kg/tools.html) 或者[备用地址](https://moe520.haoqi75.cn.mt/tools.html)。

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
    },
    "tocWelcome": "欢迎来到萌·Markdown",
    "toolsUrl": "https://moe520.haoqi75.os.kg/tools.html"
}
```

- **defaultUrl**：当没有匹配别名或 `?md=` 参数时的默认文档地址。
- **aliases**：键为访问路径（如 `?p=vmdownload`），值为实际的 Markdown 文件 URL。

> 访问 `?md=Base64编码的URL` 将覆盖所有配置，优先级最高。

若嫌麻烦可以使用UI化的编辑工具：[tools.html](https://moe520.haoqi75.os.kg/tools.html)

具体在[简单编辑 config.json 工具](#简单编辑-config.json-工具)查看。

---

## 📂 项目结构
```tree
markdown-viewer-moe/
├── .forgejo/
│   └── workflows/
│        ├── release.yml    # 自动发布Release（备份仓库）
│        └── static.yml     # 自动构建并推送到Codeberg Pages
├── .github/
│   └── workflows/
│        ├── release.yml    # 自动发布Release
│        └── static.yml     # 自动构建并推送到GitHub Pages
├── images/                  # 图片
├── script/
│   ├── copy-tools.js       # Tools复制准备脚本
│   └── release.js          # Release版本构建代码
├── src/
│   ├── img/                # 图标文件夹
│   ├── index.html          # 主页面
│   ├── style.css           # 萌系样式
│   ├── script.js           # 主要逻辑（TOC、渲染、路由）
│   └── config.json         # 配置文件
├── dist/                   # 构建输出（包含 index.html、index.release.html、tools.html和tools-vX.X.X.html）
├── tools/                  # 小白也能编辑内容
├── AGENTS.md               # AI Agent提示文件
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

<p align="left">
  <img src="images/stars.png" alt="准备好要部署我了吗" width="220">
</p>

欢迎提出 Issue 或 Pull Request！
如果您喜欢这个项目，别忘了点个 **⭐Star** 哦～

---

## 📄 License
MIT © [ApHeQua758](https://github.com/haoqi75)

---

## 💖 致谢
本项目由 [AI](https://github.com/) 辅助生成，融合了人类审美与机器效率，愿为您的 Markdown 阅读带来一丝惬意。
