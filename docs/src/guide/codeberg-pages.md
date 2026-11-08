# ☁ Codeberg Pages 部署

Forgejo Actions 工作流文件：[`.forgejo/workflows/static.yml`](https://codeberg.org/haoqi75/markdown-viewer-moe/src/branch/main/.forgejo/workflows/static.yml)

## 部署步骤

1. **Fork** 并给仓库点一个 **⭐Star**：[haoqi75/markdown-viewer-moe](https://codeberg.org/haoqi75/markdown-viewer-moe/)。
2. 打开仓库的 `设置` → `仓库功能` → `概览`，启用 **使用 Forgejo Actions 启用集成 CI/CD 管道**。
3. 编辑 `src/config.json`，改成自己的标题、默认 Markdown 地址和别名。
4. 修改 `.forgejo/workflows/static.yml` 里的部署地址（见下一节）。
5. 打开 `Actions`，找到 **Build and deploy to Codeberg Pages**：
   - 手动运行：点击 **Run Workflow**。
   - 自动运行：推送到 `main` 分支时自动触发。

默认地址通常为：

```text
https://<用户名>.codeberg.page/markdown-viewer-moe/
```

## 修改部署地址

在 `.forgejo/workflows/static.yml` 中找到 `Deploy to Codeberg Pages` 步骤。**Fork 后必须把 `site` 改成自己的地址**，否则会尝试部署到维护者的域名：

```yaml
      - name: Deploy to Codeberg Pages
        uses: https://codeberg.org/git-pages/action@v2
        with:
          source: ./dist
          # 改成自己的 Codeberg Pages 地址
          site: https://<用户名>.codeberg.page/markdown-viewer-moe/
          server: codeberg.page
          token: ${{ forge.token }}
```

如果使用自定义域名：

```yaml
          site: https://your-domain.example
          # 自定义域名需要保留这一行
          server: codeberg.page
```

工作流顶部的 `enable-openid-connect: true` 和 `forge.token` 用于获取部署权限，通常不需要修改。

## 工作流做了什么

- 使用 `https://github.com/pnpm/setup@v3` 安装 Node 和 pnpm，并自动执行 `pnpm install`。
- 运行 `pnpm build`，生成 `dist/index.html`、`dist/tools.html`、`dist/404.html`。
- 把 `dist/` 推送到 Codeberg Pages。

::: tip
CI 只部署主预览器和 tools，**不会部署 `docs/` 文档站**。文档站需要单独构建和发布。
:::

## 常见问题

### Actions 没有运行

确认仓库设置里已经启用 Forgejo Actions；Fork 后可能需要手动开启。

### 部署到了别人的域名

`site` 还是模板里的默认值，改成自己的 Codeberg Pages 地址或自定义域名。

### 自定义域名不生效

确认保留了 `server: codeberg.page`，并按 Codeberg 官方文档配置 DNS：[自定义域名](https://docs.codeberg.org/codeberg-pages/using-custom-domain/)。

祝你一切顺利~
