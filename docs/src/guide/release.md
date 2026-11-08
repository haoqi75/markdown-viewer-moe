# 📥 下载编辑好的

[![GitHub Release](https://img.shields.io/github/v/release/haoqi75/markdown-viewer-moe?display_name=release&logo=github&style=for-the-badge)](https://github.com/haoqi75/markdown-viewer-moe/releases/latest)
[![Codeberg Release](https://img.shields.io/gitea/v/release/haoqi75/markdown-viewer-moe?gitea_url=https%3A%2F%2Fcodeberg.org%2F&display_name=release&style=for-the-badge&logo=Codeberg)](https://codeberg.org/haoqi75/markdown-viewer-moe/releases/latest)

::: warning
下载页面还在TODO中，请耐心等待。
:::

从**v1.4.0**后，支持直接编辑index.html，从 [Releases](https://github.com/haoqi75/markdown-viewer-moe/releases) （或者[备份仓库Release](https://codeberg.org/haoqi75/markdown-viewer-moe/releases)）下载一个叫`index.release.html`的文件，直接使用记事本编辑上面的内容：
```html
<!--
  ╔══════════════════════════════════════════════╗
  ║  RELEASE CONFIG — 编辑 defaultUrl/aliases/theme/type ║
  ║  修改下方 JSON 后保存，直接部署即可                 ║
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
<!DOCTYPE html>...
```
编辑后保存，可以重命名为`index.html`，打开或上传到服务器。[更多信息](/guide/use)

具体配置可以在[配置说明](/config/index#配置说明)查看。

从 **tools-v1.2.0** 后，若不会编辑也可以使用[简单编辑 config.json 工具](/config/editor)来编辑。