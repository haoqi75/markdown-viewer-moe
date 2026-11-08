# 📥 下载编辑好的

[![GitHub Release](https://img.shields.io/github/v/release/haoqi75/markdown-viewer-moe?display_name=release&logo=github&style=for-the-badge)](https://github.com/haoqi75/markdown-viewer-moe/releases/latest)
[![Codeberg Release](https://img.shields.io/gitea/v/release/haoqi75/markdown-viewer-moe?gitea_url=https%3A%2F%2Fcodeberg.org%2F&display_name=release&style=for-the-badge&logo=Codeberg)](https://codeberg.org/haoqi75/markdown-viewer-moe/releases/latest)

如果你不想安装 Node.js 和 pnpm，可以直接下载构建好的文件。

## Release 里有什么

| 文件 | 说明 |
| --- | --- |
| `index.release.html` | 可编辑的完整预览器，推荐下载这个 |
| `tools-vX.X.X.html` | JSON 配置编辑器 |
| `files-md5.txt` | 文件校验清单 |

## 使用步骤

1. 从 [GitHub Releases](https://github.com/haoqi75/markdown-viewer-moe/releases) 或 [Codeberg Releases](https://codeberg.org/haoqi75/markdown-viewer-moe/releases) 下载 `index.release.html`。
2. 用记事本、VS Code 等文本编辑器打开文件。
3. 修改文件顶部的 JSON 配置块。
4. 保存。建议把文件重命名为 `index.html`。
5. 上传到任意静态托管，或直接双击打开。
6. 访问 `/?p=about` 可以检查关于页是否正常。

## 编辑配置块

文件顶部有一段被注释包围的 JSON：

```html
<!--
  ╔══════════════════════════════════════════════╗
  ║  RELEASE CONFIG — 编辑 defaultUrl/aliases/theme/type ║
  ╚══════════════════════════════════════════════╝
-->
<script id="release-config" type="application/json">
{
  "type": "release",
  "defaultUrl": "https://your-default-api.com/raw/index.md",
  "aliases": {
    "test": "https://another-api.com/raw/rypa",
    "docs": "https://docs.example.com/readme.md"
  },
  "theme": "pink"
}
</script>
<!-- RELEASE CONFIG END -->
```

可修改的字段：

- `defaultUrl`：默认 Markdown 地址。
- `aliases`：别名映射，例如 `?p=test`。
- `theme`：`pink` / `blue` / `green` / `purple` / `white` / `yellow`。
- `type`：保持 `release`。

其他外观字段（标题、Logo、图标、页脚等）已经在构建时写入文件，不能在 Release 配置块里修改。详细说明见[发布版配置](/config/release)。

::: warning
保存前请确认 JSON 仍然合法；配置块需要保持在 `<!DOCTYPE html>` 之前。构建校验会检查这两点。
:::

## 校验文件

`files-md5.txt` 每行是 `MD5 文件名`，可以在文件所在目录运行：

```bash
md5sum -c files-md5.txt
```

Windows 可以使用：

```powershell
Get-FileHash .\index.release.html -Algorithm MD5
```

## 用工具编辑

不会手写 JSON 时，可以打开 [简单编辑 config.json 工具](/config/editor)：

- 选择「基础·发布配置」模板，手填 `defaultUrl` 和别名。
- 或直接上传 `index.release.html`，读取顶部配置后重新打包下载。

## 自己构建

```bash
pnpm build:release
```

会生成 `dist/index.release.html`、`dist/tools-vX.X.X.html` 和 `dist/files-md5.txt`。构建完成后 `dist/index.html` 会被清理，避免误部署旧版本。
