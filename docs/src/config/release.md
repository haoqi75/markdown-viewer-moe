# 发布版配置（release）

`release` 是精简配置，写在 `index.release.html` 文件顶部的 `<script id="release-config">` JSON 块里。它不需要重新构建，改完保存即可部署。

## 配置块示例

```html
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
```

## 可用字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `type` | string | 固定为 `release`，供 tools 编辑器识别。 |
| `defaultUrl` | string | 没有匹配到别名时加载的 Markdown 地址。 |
| `aliases` | object | 别名映射；键为 `?p=` 的值，值为 Markdown URL。匹配不区分大小写，`about` 为内置保留页。 |
| `theme` | string | 颜色主题：`pink` / `blue` / `green` / `purple` / `white` / `yellow`。 |

## 编辑步骤

1. 从 [Releases](https://github.com/haoqi75/markdown-viewer-moe/releases)（或[备份仓库](https://codeberg.org/haoqi75/markdown-viewer-moe/releases)）下载 `index.release.html`。
2. 用记事本或 VS Code 打开，编辑文件顶部的 JSON。
3. 保存后建议重命名为 `index.html`，再上传到静态托管。
4. 访问 `/?p=about` 可以检查关于页是否正常。

## 注意事项

- 配置块必须是合法 JSON，且保持在 `<!DOCTYPE html>` 之前；构建校验会检查这一点。
- 发布版只能改 `defaultUrl`、`aliases`、`theme` 等运行期字段；标题、Logo、图标、页脚等在构建时已经写死。
- 发布版的「JSON 编辑器」按钮固定指向 `https://moe520.cc.cd/tools.html`。如果需要改成本地 tools，请自行构建生产版。
- `?md=` 仍然优先级最高，`?p=about` 也会优先于同名别名。
- 关于页、TOC、代码高亮等资源都已内嵌在 `index.release.html` 里，不需要额外文件。

## 用编辑器修改

不想手改 JSON 时，可以打开 [简单编辑 config.json 工具](/config/editor)，选择「基础·发布配置」模板，或直接上传 `index.release.html` 读取并重新打包。

## 自己构建

```bash
pnpm build:release
```

会生成：

- `dist/index.release.html`
- `dist/tools-vX.X.X.html`
- `dist/files-md5.txt`
