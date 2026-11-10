'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const VERIFY_SCRIPT = path.join(ROOT, 'scripts', 'verify-build.js');
const ROOT_PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPnpmVersion() {
    try {
        return execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--version'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (error) {
        const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
        return pkg.packageManager.replace(/^pnpm@/, '').split('+')[0];
    }
}

function writeValidHtml(filePath) {
    fs.writeFileSync(
        filePath,
        '<!DOCTYPE html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><title>verify-build test</title></head>' +
        '<body><p>hello from the verify-build test fixture</p></body></html>\n',
        'utf8'
    );
}

test('verify-build：生产版注入 Node.js / pnpm / Gulp 信息且重复运行不叠加', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moe-verify-build-'));
    const distDir = path.join(tempDir, 'dist');
    const gulpPkgDir = path.join(tempDir, 'node_modules', 'gulp');
    const expectedPnpm = getPnpmVersion();

    try {
        fs.mkdirSync(distDir, { recursive: true });
        fs.mkdirSync(gulpPkgDir, { recursive: true });

        fs.writeFileSync(
            path.join(tempDir, 'package.json'),
            JSON.stringify({ name: 'verify-build-fixture', version: '9.9.9', packageManager: ROOT_PKG.packageManager }, null, 2),
            'utf8'
        );
        fs.writeFileSync(
            path.join(gulpPkgDir, 'package.json'),
            JSON.stringify({ name: 'gulp', version: '5.0.1' }, null, 2),
            'utf8'
        );

        for (const fileName of ['index.html', 'tools.html', '404.html']) {
            writeValidHtml(path.join(distDir, fileName));
        }

        const runVerify = () => execFileSync(process.execPath, [VERIFY_SCRIPT], {
            cwd: tempDir,
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 30000,
        });

        const firstRunOutput = runVerify();

        assert.match(firstRunOutput, new RegExp('Node\\.js: ' + escapeRegExp(process.version)));
        assert.match(firstRunOutput, new RegExp('pnpm: ' + escapeRegExp(expectedPnpm)));
        assert.match(firstRunOutput, /Gulp: 5\.0\.1/);

        for (const fileName of ['index.html', 'tools.html', '404.html']) {
            const html = fs.readFileSync(path.join(distDir, fileName), 'utf8');
            const header = html.match(/<!-- BUILD-INFO-START[\s\S]*?BUILD-INFO-END -->/);
            assert.ok(header, `${fileName} 缺少构建信息块`);
            assert.match(header[0], /Build Time: \d{4}-\d{2}-\d{2}T/);
            assert.match(header[0], /Version: 9\.9\.9/);
            assert.match(header[0], /Git Commit: /);
            assert.match(header[0], new RegExp('Node\\.js: ' + escapeRegExp(process.version)));
            assert.match(header[0], new RegExp('pnpm: ' + escapeRegExp(expectedPnpm)));
            assert.match(header[0], /Gulp: 5\.0\.1/);
        }

        // 再运行一次，确认旧 BUILD-INFO 块会被替换而不是叠加
        runVerify();
        const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
        assert.equal((indexHtml.match(/BUILD-INFO-START/g) || []).length, 1, '构建信息块不应重复叠加');
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
