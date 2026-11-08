# 💻 本地部署

## 前置要求

- **Node.js 26+**（仓库 `.nvmrc` 固定为 `v26.13.0`）
- **pnpm 12+**（`package.json` 的 `packageManager` 固定为 `pnpm@12.18.0`）
- Git

如果你使用 nvm，可以在仓库根目录执行：

```bash
nvm use
```

pnpm 版本通常会在执行 `pnpm install` 时根据 `packageManager` 自动切换。

## 克隆项目

```bash
git clone https://github.com/haoqi75/markdown-viewer-moe.git
cd markdown-viewer-moe
```

Codeberg 备份仓库：

```bash
git clone https://codeberg.org/haoqi75/markdown-viewer-moe.git
```

## 安装依赖

在仓库根目录执行即可，pnpm workspace 会同时安装 `tools/` 的依赖：

```bash
pnpm install
```

## 开发模式

```bash
# 主预览器：http://localhost:8520
pnpm dev

# JSON 配置编辑器：http://localhost:3000
pnpm dev:tools

# 文档站：http://localhost:5173
pnpm dev:docs
```

`pnpm dev` 会先清理并构建一次 `dist/`，然后启动 browser-sync 监听 `src/` 下的文件变化并自动刷新。

## 生产构建

```bash
# 页面 + tools + 404 全部构建
pnpm build

# 只构建主页面 → dist/index.html
pnpm build:page

# 只构建 JSON 编辑器 → dist/tools.html
pnpm build:tools

# 只构建 404 页面 → dist/404.html
pnpm build:404

# 构建文档站 → docs/.vitepress/dist
pnpm build:docs
```

`pnpm build` 会执行产物校验；如果 `dist/` 里缺少必要文件或结构异常，命令会以失败退出。

::: tip
文档站使用 pagefind 生成搜索索引。pagefind 没有 Android/Termux 的预编译二进制，在这些平台上 `pnpm build:docs` 可能在最后的搜索索引步骤失败，建议在桌面系统或 CI 中构建。
:::

## 构建 Release 版本

```bash
# 主页面 Release + tools Release
pnpm build:release

# 只生成 dist/index.release.html
pnpm build:page-release

# 只生成 dist/tools-vX.X.X.html
pnpm build:tools-release
```

完整 Release 构建还会生成 `dist/files-md5.txt` 校验清单。

## 运行本地服务器

::: warning
`pnpm start` 只负责启动 `server.js` 托管 `dist/`，运行前请先完成构建。
:::

```bash
pnpm build
pnpm start
```

## 其他命令

```bash
# 检查 tools 的 TypeScript 类型
pnpm lint:tools
```

## 目录说明

| 目录 | 内容 |
| --- | --- |
| `src/` | 主预览器源码：`index.html`、`script.js`、`style.css`、`config.json`、`about.html` |
| `tools/` | JSON 配置编辑器（React + Vite + TypeScript） |
| `docs/` | 当前文档站（VitePress） |
| `dist/` | 构建输出，已被 gitignore |
| `scripts/` | 构建、发布、校验和 404 生成脚本 |
