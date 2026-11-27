'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT, 'dist', 'server');
const SERVER_HTML = path.join(SERVER_DIR, 'index.html');
const RELEASE_HTML = path.join(ROOT, 'dist', 'index.release.html');

test('V2 构建：Vite 多文件输出与 Gulp 单文件 Release', { timeout: 120000 }, () => {
    execFileSync(
        process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        ['run', 'build:v2-release'],
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

    const assets = fs.readdirSync(path.join(SERVER_DIR, 'assets'));
    assert.ok(assets.some((file) => file.endsWith('.js')), '缺少 Vite JS 产物');
    assert.ok(assets.some((file) => file.endsWith('.css')), '缺少 Vite CSS 产物');

    assert.ok(fs.existsSync(RELEASE_HTML), '缺少 dist/index.release.html');
    const releaseHtml = fs.readFileSync(RELEASE_HTML, 'utf8');
    assert.ok(releaseHtml.includes('<style>'), 'Release 未内联 CSS');
    assert.ok(releaseHtml.includes('<script type="module">'), 'Release 未内联 JS');
    assert.ok(!releaseHtml.includes('src="./assets/'), 'Release 仍引用外部 JS');
    assert.ok(!releaseHtml.includes('href="./assets/'), 'Release 仍引用外部 CSS');
    assert.ok(releaseHtml.includes('2.0.0-rc.0'), 'Release 未注入 v2 版本');
});
