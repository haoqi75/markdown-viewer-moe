# ⚙️ 概览

## 配置说明

所有配置位于 `src/config.json`：

```json
{
    "type": "normal",
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
    "toolsUrl": "./tools.html",
    "headInject": "",
    "bodyInject": "",
    "logoSubUseDocTitle": true,
    "theme": "pink"
}
```

**配置设置**：

> [!WARNING]
> 版本**v1.7.0**后，配置文件更改了方式：
>
> 配置文件要包含 `"type"` 。未包含 `"type"` 得需要选择你的配置文件模板方式。

- **type**：配置类别标识（`normal` 完整版 / `release` 发布版），供 tools 编辑器识别。

**基本内容**：

- **defaultUrl**：当没有匹配别名或 `?md=` 参数时的默认文档地址。
- **aliases**：键为访问路径（如 `?p=vmdownload`），值为实际的 Markdown 文件 URL。

**自定义**：

- **title**：页面标题。
- **logo**：头部文字。
  * **logo.text**：头部文字标题。
  * **logo.sub**：头部文字副标题（或文件命名）。
- **logoImage**：头部图标。
- **icon**：网页图标。
- **footer**：页脚内容（支持Markdown格式）。
- **mascot**：可爱吉祥物。
- **tocWelcome**：大纲欢迎词。
- **theme**：颜色主题（默认 `pink`）。可选：`pink`（粉色）、`blue`（浅蓝）、`green`（绿色）、`purple`（紫色）、`white`（淡花白）、`yellow`（黄色）。

**高级内容**：

- **headInject**：在 `</head>` 之前注入的自定义 HTML（分析代码、meta 标签等）。
- **bodyInject**：在 `</body>` 之前注入的自定义 HTML（脚本、样式等）。
- **toolsUrl**：Tools地址，点击上面的 `[>]` （Json编辑器）打开这个地址。
- **logoSubUseDocTitle**：开启后（默认 true），Logo 副标题自动显示当前文档的 URL 文件名（如 `readme.md`）。关闭则使用 `logo.sub` 固定文本。

> 访问 `?md=Base64编码的URL` 将覆盖所有配置，优先级最高。

若嫌麻烦可以使用UI化的编辑工具：[tools.html](https://moe520.haoqi75.os.kg/tools.html)

具体在[简单编辑 config.json 工具](#简单编辑-config-json-工具)查看。