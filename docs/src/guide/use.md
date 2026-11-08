# 🌐 使用

::: warning
请确保 Markdown 可以被浏览器直接访问（Raw 纯文本），并且服务器正确配置了 CORS，否则预览器无法加载内容。
:::

## 打开预览器

`dist/index.html` 是单文件页面，可以直接双击打开，也可以上传到：

- GitHub Pages
- Codeberg Pages
- Cloudflare Pages
- EdgeOne Pages
- Google Firebase Hosting
- Netlify
- Vercel
- 任意静态 HTML 服务器

## 三种配置方式

| 方式 | 适合场景 | 操作 |
| --- | --- | --- |
| 编辑 `config.json` | 自己构建、长期维护 | 修改 `src/config.json` 后运行 `pnpm build` |
| 编辑 Release 文件 | 不想安装 Node.js | 下载 `index.release.html`，编辑顶部 JSON 后部署 |
| URL 参数 | 临时预览、分享链接 | 使用 `?p=` 或 `?md=` |

具体字段见[配置概览](/config/)。

## 地址参数

优先级从高到低：

1. `?md=<Base64 URL>`：直接加载指定 Markdown。
2. `?p=about`：内置关于页。
3. `?p=<别名>`：从 `aliases` 中查找。
4. `defaultUrl`：默认文档。

### 别名 `?p=`

在 `config.json` 或 Release 配置块里写好别名后，就可以直接访问：

```text
http://127.0.0.1:8520/?p=page
https://moe520.haoqi75.os.kg/?p=page
```

别名匹配**不区分大小写**。`about` 是内置关于页的保留名，会优先于 `aliases` 中的同名项。

### 直接加载 `?md=`

`?md=` 的值是 Markdown URL 的 Base64 编码：

```text
http://127.0.0.1:8520/?md=aHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0Lm1k
```

编码方式：

```bash
# Linux / macOS
echo -n "https://example.com/test.md" | base64
```

```js
// 浏览器控制台
btoa('https://example.com/test.md')
```

也可以使用 tools 内置的链接生成器。脚本会自动补齐 Base64 的 padding，但请使用标准 Base64，不要使用 URL-safe 变体。

### 锚点

Markdown 里的 `[文字](#标题)` 会转换成页面内平滑滚动，不会重新加载文档。文档标题的锚点由预览器自动生成。

## 页头按钮

| 按钮 | 作用 |
| --- | --- |
| GitHub 图标 | 打开项目仓库 |
| ℹ️ 关于 | 打开内置关于页（`?p=about`） |
| 📖 文档 | 打开文档站 |
| `[>]` JSON 编辑器 | 打开 `toolsUrl` 指向的配置编辑器 |

## 目录与阅读

- 侧边栏会自动提取 `h1~h6`，点击可平滑滚动。
- 滚动时当前章节会高亮，地址栏 hash 会同步更新。
- 图片可以点击放大，按 `Esc` 或点击遮罩关闭。
- 加载失败时会显示萌系错误页和状态码提示。

## 常见问题

### 页面一直显示加载失败

优先检查：

1. Markdown 地址是否是 Raw 纯文本，而不是 GitHub 的 HTML 页面。
2. 服务器是否允许跨域（CORS）。
3. 地址是否可以直接在浏览器中打开。

### 别名显示“别名未找到”

确认 `aliases` 里存在对应键，并注意 `about` 是内置页面而不是普通别名。

### 图片不显示

相对路径图片会根据 Markdown 文档的 URL 解析；如果文档地址本身不可访问，图片也会失败。加载失败的图片会替换成吉祥物占位提示。
