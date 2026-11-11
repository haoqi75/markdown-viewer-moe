'use strict';

const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const GULP_BIN = path.join(ROOT, 'node_modules', 'gulp', 'bin', 'gulp.js');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const sourceConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'config.json'), 'utf8'));

function runNode(args) {
    return execFileSync(process.execPath, args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 180000,
    });
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

function getGitHash() {
    try {
        return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (error) {
        return null;
    }
}

function getPnpmVersion() {
    try {
        return execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--version'], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (error) {
        return pkg.packageManager.replace(/^pnpm@/, '').split('+')[0];
    }
}

function getGulpVersion() {
    const pkgPath = path.join(ROOT, 'node_modules', 'gulp', 'package.json');
    return JSON.parse(read(pkgPath)).version;
}

let builtHtml = '';
let builtConfig = null;
let gitHash = null;

before(() => {
    assert.ok(fs.existsSync(GULP_BIN), '未找到 gulp CLI，请先执行 pnpm install');
    runNode([GULP_BIN, 'build']);
    builtHtml = read(path.join(DIST, 'index.html'));
    gitHash = getGitHash();

    const match = builtHtml.match(/window\.__CONFIG__\s*=\s*(\{[\s\S]*?\});/);
    assert.ok(match, '构建产物中未找到 window.__CONFIG__');
    builtConfig = JSON.parse(match[1]);
});

test('主程序构建：生成可用的单文件 index.html', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'index.html')));

    assert.ok(builtHtml.length > 100000, 'index.html 体积异常，可能没有内联资源');
    assert.ok(builtHtml.includes('window.__CONFIG__'));
    assert.ok(builtHtml.includes('<style>'));
    assert.ok(builtHtml.includes('id="about-page-template"'));
    assert.ok(builtHtml.includes('id="about-link"'));
});

test('主程序构建：配置、版本号和构建信息正确注入', () => {
    assert.equal(builtConfig.title, sourceConfig.title);
    assert.equal(builtConfig.defaultUrl, sourceConfig.defaultUrl);
    assert.equal(builtConfig.theme, sourceConfig.theme);
    assert.equal(builtConfig.version, pkg.version);
    assert.deepEqual(builtConfig.aliases, sourceConfig.aliases);

    if (gitHash) {
        assert.equal(builtConfig.gitHash, gitHash);
    }

    assert.match(builtConfig.errorMascot || '', /^data:image\/png;base64,/);
    assert.match(builtConfig.loadingMascot || '', /^data:image\/png;base64,/);
});

test('关于页构建：环境和 Git hash 占位符全部替换', () => {
    const match = builtHtml.match(/<template id="about-page-template">([\s\S]*?)<\/template>/);
    assert.ok(match, '缺少关于页模板');
    const template = match[1];

    assert.ok(template.includes('class="about-env"'));
    assert.ok(template.includes('id="about-check-update"'));
    assert.ok(template.includes('id="about-update-status"'));
    assert.ok(template.includes('class="about-emoji" src="img/favicon.svg"'), '关于页图标保留源路径');
    assert.ok(template.includes(`<b>${process.version}</b>`), '缺少注入后的 Node.js 版本');
    assert.ok(template.includes(`<b>${getPnpmVersion()}</b>`), '缺少注入后的 pnpm 版本');
    assert.ok(template.includes(`<b>${getGulpVersion()}</b>`), '缺少注入后的 Gulp 版本');

    if (gitHash) {
        assert.ok(template.includes(`v${pkg.version}(${gitHash})`), '关于页版本行缺少 Git hash');
        assert.ok(template.includes(`<b>${gitHash}</b>`), '构建环境缺少 Git hash');
    }

    for (const placeholder of [
        '__VERSION_DISPLAY__',
        '__APP_VERSION__',
        '__NODE_VERSION__',
        '__PNPM_VERSION__',
        '__GULP_VERSION__',
        '__GIT_HASH__',
    ]) {
        assert.ok(!template.includes(placeholder), `残留占位符 ${placeholder}`);
    }
});

test('Release 构建：release.js 生成可编辑配置块并保留关于页', () => {
    runNode([path.join(ROOT, 'scripts', 'release.js')]);

    const releasePath = path.join(DIST, 'index.release.html');
    assert.ok(fs.existsSync(releasePath), '缺少 dist/index.release.html');
    const releaseHtml = read(releasePath);

    const configMatch = releaseHtml.match(/<script id="release-config" type="application\/json">([\s\S]*?)<\/script>/);
    assert.ok(configMatch, '缺少 release-config 配置块');
    const releaseConfig = JSON.parse(configMatch[1]);

    assert.equal(releaseConfig.type, 'release');
    assert.equal(releaseConfig.defaultUrl, sourceConfig.defaultUrl);
    assert.equal(releaseConfig.theme, sourceConfig.theme);
    assert.deepEqual(releaseConfig.aliases, sourceConfig.aliases);

    assert.ok(
        releaseHtml.indexOf('<script id="release-config"') < releaseHtml.indexOf('<!DOCTYPE html>'),
        'release-config 应位于 <!DOCTYPE html> 之前'
    );
    assert.ok(releaseHtml.includes('"toolsUrl":"https://moe520.cc.cd/tools.html"'));
    assert.ok(releaseHtml.includes('id="about-page-template"'));
});
