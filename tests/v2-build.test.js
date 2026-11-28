'use strict';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT, 'dist', 'server');
const SERVER_HTML = path.join(SERVER_DIR, 'index.html');
const RELEASE_HTML = path.join(ROOT, 'dist', 'index.html');

test('V2 构建：Vite 多文件输出与 Gulp 单文件 Release', { timeout: 120000 }, () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const gulpSource = fs.readFileSync(path.join(ROOT, 'gulpfile.js'), 'utf8');
    assert.match(pkg.scripts['build:release'], /gulp release/, 'Release 构建应由 Gulp 执行');
    assert.match(gulpSource, /from '\.\/scripts\/minify-html\.js'/, 'gulpfile 应引入 minify-html');
    assert.match(gulpSource, /as 'minify-html'/, '应提供 gulp minify-html 任务');
    assert.match(gulpSource, /gulp\.series\(packRelease, minifyRelease\)/, 'release 任务应自动压缩');

    execFileSync(
        process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        ['run', 'build:release'],
        {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 110000,
        }
    );

    assert.ok(fs.existsSync(SERVER_HTML), '缺少 dist/server/index.html');

    const serverHtml = fs.readFileSync(SERVER_HTML, 'utf8');
    assert.match(serverHtml, /<script[^>]+src="\.\/assets\/[^"]+\.js"/);
    assert.match(serverHtml, /<link[^>]+href="\.\/assets\/[^"]+\.css"/);
    assert.ok(fs.existsSync(path.join(SERVER_DIR, 'favicon.svg')), '缺少 public 图标产物');
    assert.ok(fs.existsSync(path.join(SERVER_DIR, 'images', 'icon.png')), '缺少 README 图片产物');

    const assets = fs.readdirSync(path.join(SERVER_DIR, 'assets'));
    assert.ok(assets.some((file) => file.endsWith('.js')), '缺少 Vite JS 产物');
    assert.ok(assets.some((file) => file.endsWith('.css')), '缺少 Vite CSS 产物');

    assert.ok(fs.existsSync(RELEASE_HTML), '缺少 dist/index.html');
    const releaseHtml = fs.readFileSync(RELEASE_HTML, 'utf8');
    assert.ok(releaseHtml.includes('<style>'), 'Release 未内联 CSS');
    assert.ok(releaseHtml.includes('<script type="module">'), 'Release 未内联 JS');
    assert.ok(!releaseHtml.includes('src="./assets/'), 'Release 仍引用外部 JS');
    assert.ok(!releaseHtml.includes('href="./assets/'), 'Release 仍引用外部 CSS');
    assert.ok(releaseHtml.includes('href="data:image/svg+xml;base64,'), 'Release 未内联 favicon');
    assert.ok(!releaseHtml.includes('href="./favicon'), 'Release 仍引用外部 favicon');
    assert.ok(releaseHtml.includes('.callout-note'), 'Release 缺少 GitHub callout 样式');
    assert.ok(
        releaseHtml.includes('raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/images/'),
        'Release 模式应使用远程 README 图片'
    );
    assert.ok(releaseHtml.includes('2.0.0-rc.0'), 'Release 未注入 v2 版本');
});
