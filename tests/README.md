# 测试

使用 Node.js 内置的 `node:test`，不需要额外的测试框架或依赖。

## 运行

在仓库根目录：

```bash
pnpm test
```

运行结束后会在仓库根目录生成 `validation.txt`（已加入 `.gitignore`），包含：

- 生成时间、项目版本、Git 短 hash
- Node.js / pnpm 版本
- 测试结果（PASS / FAIL）、退出码
- tests / pass / fail / skipped 等汇总
- 测试用例列表；失败时附上输出末尾 120 行

## 测试文件

| 文件 | 覆盖内容 |
| --- | --- |
| `routing.test.js` | `src/script.js` 的 `?md=` / `?p=` / `?p=about` 路由、别名大小写、release-config 覆盖、关于页渲染 |
| `build.test.js` | 执行 `gulp build` 检查单文件产物、配置/版本/构建环境注入；执行 `scripts/release.js` 检查 Release 配置块 |
| `source.test.js` | `config.json` 结构、关于页占位符、主页面入口、关键渲染逻辑和工具链声明 |
| `verify-build.test.js` | `scripts/verify-build.js` 注入 Build Time / Version / Git Commit / Node.js / pnpm / Gulp，且重复运行不叠加 |

## 说明

- `routing.test.js` 通过 `tests/lib/script-harness.js` 在 Node `vm` 沙箱中加载 `src/script.js`，使用最小 DOM mock，不会启动浏览器。
- `build.test.js` 会真实执行一次 `gulp build`，因此会清理并重建 `dist/`；这是预期行为。
- `pnpm test` 使用 `--test-concurrency=1` 串行执行测试文件，避免构建测试与其他测试互相干扰。
- GitHub Actions / Forgejo Actions 会在构建前运行 `pnpm test`，并把 `validation.txt` 写入 job summary；构建完成后还会写入版本、commit 和产物列表。
