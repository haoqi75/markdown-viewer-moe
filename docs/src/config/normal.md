# 生产版配置（normal）

`normal` 是完整版配置，对应 `src/config.json`，用于本地构建或自己部署整站。

## 适用场景

- 克隆仓库后修改 `src/config.json`，再运行 `pnpm build`。
- 使用 tools 编辑器生成一个完整的 `config.json`。
- 需要控制标题、Logo、图标、吉祥物、页脚、别名、主题和 HTML 注入等全部选项。

## 最小示例

只写需要修改的字段也可以，其余字段会在构建时用 `DEFAULTS` 补齐：

```json
{
    "type": "normal",
    "title": "我的 Markdown 空间",
    "defaultUrl": "https://example.com/readme.md",
    "aliases": {
        "docs": "https://example.com/docs.md"
    },
    "theme": "pink"
}
```

字段、默认值和优先级见[配置概览](/config/)。

## 推荐流程

1. 修改 `src/config.json`。
2. 运行 `pnpm dev`，在 `http://localhost:8520` 实时预览。
3. 确认无误后运行 `pnpm build`，把 `dist/index.html` 部署到静态托管。

```bash
pnpm install
pnpm dev
# 另开终端或完成编辑后
pnpm build
```

## 构建时会做什么

- 读取 `config.json` 并与 gulpfile 中的 `DEFAULTS` 深度合并。
- 把 Logo、favicon、吉祥物等图片转换成 Data URI 内联。
- 注入版本号和 Git 提交短 hash，显示在页脚。
- 把 `src/about.html` 提取为关于页模板内嵌进单文件。
- 生成 `dist/index.html`；如果运行完整 `pnpm build`，还会生成 `tools.html` 和 `404.html`。

::: tip
`normal` 配置只影响生产构建。发布版 `index.release.html` 使用单独的 `release` 配置块，见[发布版配置](/config/release)。
:::

## 用编辑器生成

打开 [tools.html](https://moe520.cc.cd/tools.html)（或[备用地址](https://moe520.os.kg/tools.html)），选择「萌·Markdown 预览器」模板，编辑后下载 `config.json`，覆盖 `src/config.json` 即可。
