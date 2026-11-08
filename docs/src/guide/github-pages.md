# ☁ GitHub Pages 部署

GitHub Actions 工作流文件：[`.github/workflows/static.yml`](https://github.com/haoqi75/markdown-viewer-moe/blob/main/.github/workflows/static.yml)

## 部署步骤

1. **Fork** 并给仓库点一个 **⭐Star**：[haoqi75/markdown-viewer-moe](https://github.com/haoqi75/markdown-viewer-moe)。
2. 打开自己仓库的 `Settings` → `Pages`。
3. 在 **Build and deployment** 里把 `Source` 设为 **GitHub Actions**。
4. （可选）在 `Custom domain` 里填写自己的域名。
5. 编辑 `src/config.json`，改成自己的标题、默认 Markdown 地址和别名。
6. 打开 `Actions` 标签页，启用工作流。
7. 在左侧选择 **Build and deploy to Github Pages**：
   - 手动运行：点击 **Run workflow**。
   - 自动运行：推送到 `main` 分支时自动触发。

部署完成后，GitHub Pages 会给你一个 `https://<用户名>.github.io/<仓库名>/` 地址。

## 工作流做了什么

- 使用 `pnpm/setup@v3`，自动读取 `.nvmrc` 安装 Node、读取 `packageManager` 安装 pnpm，并执行 `pnpm install`。
- 运行 `pnpm build`，生成 `dist/index.html`、`dist/tools.html`、`dist/404.html`。
- 把整个 `dist/` 上传并部署到 GitHub Pages。

::: tip
CI 只部署主预览器和 tools，**不会部署 `docs/` 文档站**。文档站需要单独构建和发布。
:::

## 常见问题

### Actions 页面没有工作流

Fork 后工作流默认可能是禁用状态，需要在 `Actions` 标签页点击启用。

### 部署成功但页面是 404

检查 `Settings` → `Pages` 的 `Source` 是否选择了 **GitHub Actions**，而不是 `Deploy from a branch`。

### 构建失败

打开失败的工作流查看日志。常见原因是 `src/config.json` JSON 格式错误，或自定义图片路径不存在导致构建失败。

### 国内访问慢

可以改用 [Codeberg Pages](/guide/codeberg-pages)，或给自己的 Pages 绑定自定义域名/CDN。

祝你一切顺利~
