# ⚙️ 配置概览

预览器的默认行为都由 `src/config.json` 控制。构建时 gulp 会读取并深度合并它；如果文件缺失或 JSON 损坏，会回退到 gulpfile 里的 `DEFAULTS`，构建不会中断，但页面会使用默认配置。

## 完整示例

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
    "defaultUrl": "https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/README.md",
    "aliases": {
        "page": "https://cp.qtdt.qzz.io/api/raw/index",
        "agents": "https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/AGENTS.md",
        "tools": "https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/tools/README.md"
    },
    "tocWelcome": "欢迎来到萌·Markdown",
    "toolsUrl": "./tools.html",
    "headInject": "",
    "bodyInject": "",
    "logoSubUseDocTitle": true,
    "theme": "pink"
}
```

## 字段说明

### 基础信息

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | string | `normal` | 配置类型。`normal` 为完整版，`release` 为发布版；tools 编辑器靠它选择模板。 |
| `title` | string | `🌸 萌·Markdown 预览器` | 浏览器标签页标题。 |
| `theme` | string | `pink` | 颜色主题，可选 `pink` / `blue` / `green` / `purple` / `white` / `yellow`。 |
| `tocWelcome` | string | `欢迎来到萌·Markdown` | 侧边栏目录顶部的欢迎气泡文字。 |
| `footer` | string | 见示例 | 页脚内容，支持 Markdown 链接。 |

### Logo、图标与吉祥物

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `logo.text` | string | `📝 萌·Markdown` | 页头主标题，支持 emoji。 |
| `logo.sub` | string | `README.md` | 页头副标题；`logoSubUseDocTitle` 开启时会被当前文档文件名覆盖。 |
| `logoImage` | string | `img/favicon.svg` | 页头 Logo 图片路径。 |
| `icon.svg` | string | `img/favicon.svg` | SVG favicon 路径。 |
| `icon.ico` | string | `img/favicon.ico` | 传统 favicon 路径。 |
| `icon.apple` | string | `img/apple-touch-icon.png` | iOS 主屏幕图标路径。 |
| `mascot` | string | `img/mascot.png` | 右下角吉祥物图片路径。 |

::: tip
图片路径相对于 `src/`。构建时这些图片会被转换成 Data URI 内联进 `dist/index.html`，所以部署时不需要再带 `img/` 目录。自定义图片不存在时会回退到默认图片；默认图片也缺失时构建会失败。
:::

### 内容与路由

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `defaultUrl` | string | 仓库 README 地址 | 没有 `?md=`、也没有匹配到别名时加载的 Markdown 地址。 |
| `aliases` | object | `{}` | 别名映射：键为 `?p=` 的值，值为 Markdown 文件 URL。别名匹配不区分大小写。 |
| `logoSubUseDocTitle` | boolean | `true` | 为 `true` 时，页头副标题自动显示当前文档 URL 的文件名；为 `false` 时使用 `logo.sub`。 |

::: warning
`about` 是内置关于页的保留别名，会优先于 `aliases` 中的同名键。访问 `/?p=about` 始终显示关于页。
:::

### 高级选项

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `toolsUrl` | string | `https://moe520.haoqi75.os.kg/tools.html` | 页头「JSON 编辑器」按钮的地址。生产版示例配置为 `./tools.html`。 |
| `headInject` | string | `""` | 注入到 `</head>` 之前的原始 HTML，可用于 meta、统计脚本或额外样式。 |
| `bodyInject` | string | `""` | 注入到 `</body>` 之前的原始 HTML，可用于脚本等。 |

## 配置优先级

运行时按以下顺序决定加载哪个 Markdown 文件：

1. `?md=<Base64 编码的 URL>`：优先级最高，直接加载指定 Markdown。
2. `?p=about`：内置关于页。
3. `?p=<别名>`：在 `aliases` 中查找，不区分大小写。
4. `defaultUrl`：以上都没有时使用默认地址。

Release 版本还会读取文件顶部的 `<script id="release-config">` JSON 块，覆盖 `defaultUrl`、`aliases` 和 `theme`。

## 配置类型

版本 **v1.7.0** 之后，tools 编辑器通过 `type` 识别配置模板：

- `normal`：完整配置，用于 `src/config.json` 和自行构建。
- `release`：精简配置，用于编辑 `index.release.html` 顶部 JSON。

配置文件必须包含 `type`；缺少时需要在编辑器中手动选择模板。

- 完整版字段与构建流程：[生产版配置](/config/normal)
- 发布版字段与编辑方式：[发布版配置](/config/release)
- 图形化编辑：[简单编辑 config.json 工具](/config/editor)
