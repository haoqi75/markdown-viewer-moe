# 测试

`pnpm test` 使用 Node 内置 `node:test`，通过 `scripts/run-tests.js` 串行执行，并在仓库根目录生成 `validation.txt`（已 gitignore）。

## 测试文件

| 文件 | 覆盖内容 |
| --- | --- |
| `v2-build.test.js` | Vite + Vue 多文件生产构建到 `dist/server/`，以及 Gulp 单文件 Release 到 `dist/index.release.html` |

## 说明

- 测试会真实执行 `pnpm build:v2-release`，因此会重建 `dist/server/` 和 `dist/index.release.html`。
- 运行测试前请确保已执行 `pnpm install`。
