# 💻 本地部署

## 前置要求

- **Node.js 22.22.2**（`package.json` 的 `engines.node` 已声明 `>=22.22.2`；推荐使用 `.nvmrc` 固定的 `v26.13.1`）
- **pnpm 12.23.0**（`package.json` 的 `packageManager` 固定版本，并带 sha512 校验）
- Git

如果你使用 nvm，可以在仓库根目录执行：

```bash
nvm install
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
cd markdown-viewer-moe
```

## 安装依赖

在仓库根目录执行即可，pnpm workspace 会同时安装 `tools/` 的依赖：

```bash
pnpm install
```

## 开发模式

```bash
# 主预览器（Vite + Vue）：http://localhost:8520
pnpm dev

# JSON 配置编辑器：http://localhost:3000
pnpm dev:tools

# 文档站：http://localhost:5173
pnpm dev:docs
```

`pnpm dev` 使用 Vite 开发服务器，修改 `src/` 下的文件会自动热更新。

## 生产构建

```bash
# V2 主程序：多文件输出 → dist/server/
pnpm build

# V2 Release：Vite 构建后由 Gulp 打包单文件 → dist/index.release.html
pnpm build:release

# JSON 编辑器 → dist/tools.html
pnpm build:tools

# 带版本号的 Tools → dist/tools-vX.X.X.html
pnpm build:tools-release

# 文档站 → docs/.vitepress/dist
pnpm build:docs
```


## 构建 Release 版本

```bash
# 主程序单文件 Release
pnpm build:release

# Tools 单文件 Release
pnpm build:tools-release
```

主程序 Release 会把 Vite 生成的 CSS、JS 内联进 `dist/index.release.html`。

::: tip
文档站使用 pagefind 生成搜索索引。pagefind 没有 Android/Termux 的预编译二进制，在这些平台上 `pnpm build:docs` 可能在最后的搜索索引步骤失败，建议在桌面系统或 CI 中构建。
:::

## 运行本地服务器

`pnpm start` 会通过 `server.js` 托管 V2 的生产构建目录 `dist/server/`：

```bash
pnpm build
pnpm start
```

## 其他命令

```bash
# 运行 V2 构建测试
# 结束后会在根目录生成 validation.txt（已 gitignore）
pnpm test

# 检查 tools 的 TypeScript 类型
pnpm lint:tools
```

## 目录说明

| 目录 | 内容 |
| --- | --- |
| `src/` | V2 主预览器源码（Vite + Vue + TypeScript + SCSS） |
| `tools/` | JSON 配置编辑器（React + Vite + TypeScript） |
| `docs/` | 当前文档站（VitePress） |
| `dist/server/` | V2 生产构建，多文件输出 |
| `dist/index.release.html` | V2 单文件 Release |
| `scripts/` | Tools 构建、图标注入、HTML 压缩和测试脚本 |
