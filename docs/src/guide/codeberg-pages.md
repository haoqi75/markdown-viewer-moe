# ☁ Codeberg Pages 部署

Actions文件在：[`.forgejo/workflows/static.yml`](https://codeberg.org/haoqi75/markdown-viewer-moe/src/branch/main/.forgejo/workflows/static.yml)

1. **Fork** 和 **⭐Star** 此[仓库](https://codeberg.org/haoqi75/markdown-viewer-moe/)。
2. 在`设置`->`仓库功能`->`概览`里面找到**使用Forgejo Actions启用集成CI/CD管道**并开启它。
3. 编辑`src/config.json`，把内容替换成你自己想要的。
4. 编辑`.forgejo/workflows/static.yml`里面的内容
    ```yaml
    // 在40行找到并替换一下代码，其他不要瞎碰碰
    - name: Deploy to Codeberg Pages
        uses: https://codeberg.org/git-pages/action@v2
        with:
          # 上传仅dist文件夹的文件
          source: ./dist
          # 网站域名，有自己的请替换
          site: https://${{ forge.repository_owner }}.codeberg.page/markdown-viewer-moe/
          token: ${{ forge.token }}
    ```
5. （可选）若你想要自定义域名，可以访问官方的文档[自定义域名](https://docs.codeberg.org/codeberg-pages/using-custom-domain/)。
    
    提示，需要在里面加上一行 `server: codeberg.page` 才能自定义域名生效。
6. 转到`Actions`，在左菜单里找到`Build and deploy to Codeberg Pages`。
    * 手动触发：点击 **Run Workflow**。
    * 自动触发：每当更改任何文件会自动触发。

祝你一切顺利~
