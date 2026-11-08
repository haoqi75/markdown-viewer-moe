# Moe Markdown Viewer 文档

使用 [VitePress](https://vitepress.dev/) 构建的项目文档，内容位于 `docs/src/`，站点配置和主题位于 `docs/.vitepress/`。

## 本地开发

在仓库根目录执行：

```bash
pnpm install
pnpm dev:docs
```

默认地址为 <http://localhost:5173>。

## 构建

```bash
pnpm build:docs
```

产物输出到 `docs/.vitepress/dist/`。构建会通过 pagefind 生成搜索索引；pagefind 暂不支持 Android/Termux 的 `android-arm64`，在这些平台上可能需要在桌面系统或 CI 中构建。

## 目录

| 路径 | 内容 |
| --- | --- |
| `src/index.md` | 文档首页 |
| `src/guide/` | 快速开始、下载、本地部署、Pages 部署、使用说明 |
| `src/config/` | 配置字段、生产版配置、发布版配置、配置编辑器 |
| `src/about.md` | 关于项目 |
| `src/public/` | 静态资源（图标、截图） |
| `.vitepress/config.mts` | VitePress 站点配置 |
| `.vitepress/theme/` | 自定义主题与样式 |
