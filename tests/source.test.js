'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const THEMES = ['pink', 'blue', 'green', 'purple', 'white', 'yellow'];

test('配置：src/config.json 结构有效', () => {
    const config = JSON.parse(read('src/config.json'));

    assert.equal(config.type, 'normal');
    assert.equal(typeof config.title, 'string');
    assert.match(config.defaultUrl, /^https?:\/\//);
    assert.ok(THEMES.includes(config.theme), 'theme 必须是支持的六种主题之一');
    assert.ok(config.aliases && typeof config.aliases === 'object' && !Array.isArray(config.aliases));

    for (const [name, url] of Object.entries(config.aliases)) {
        assert.ok(name.length > 0, '别名不能为空');
        assert.match(url, /^https?:\/\//, `别名 ${name} 必须是 http(s) 地址`);
    }
});

test('关于页源码：内容和占位符齐全', () => {
    const source = read('src/about.html');

    assert.match(source, /<!--\s*ABOUT_CONTENT_START\s*-->/);
    assert.match(source, /<!--\s*ABOUT_CONTENT_END\s*-->/);
    assert.match(source, /id="about-page-style"/);
    assert.match(source, /class="about-env"/);

    for (const placeholder of [
        '__VERSION_DISPLAY__',
        '__NODE_VERSION__',
        '__PNPM_VERSION__',
        '__GULP_VERSION__',
        '__GIT_HASH__',
    ]) {
        assert.ok(source.includes(placeholder), `缺少占位符 ${placeholder}`);
    }
});

test('主页面：关于页入口和模板占位符存在', () => {
    const source = read('src/index.html');

    assert.match(source, /href="\?p=about"/);
    assert.match(source, /id="about-link"/);
    assert.match(source, /<about-page-template><\/about-page-template>/);
});

test('路由与渲染：关键行为没有退化', () => {
    const source = read('src/script.js');

    assert.ok(source.includes("pParam.toLowerCase() === 'about'"));
    assert.ok(source.includes("'__ABOUT_PAGE__'"));
    assert.match(source, /function\s+renderAbout\s*\(/);
    assert.ok(source.includes('tpl.content.cloneNode(true)'));
    assert.match(source, /breaks:\s*false/, 'marked 必须保持 GitHub 风格：breaks: false');
    assert.ok(source.includes('history.scrollRestoration = \'manual\''));
    assert.ok(source.includes("img.closest('a')"), '图片预览应跳过链接内的图片');
});

test('工程配置：pnpm test 与工具链版本已声明', () => {
    const pkg = JSON.parse(read('package.json'));
    const nvmrc = read('.nvmrc').trim();

    assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    assert.equal(typeof pkg.scripts.test, 'string');
    assert.match(pkg.scripts.test, /run-tests\.js/);

    const testRunner = read('scripts/run-tests.js');
    assert.ok(testRunner.includes("'--test'"), '测试包装脚本应调用 node --test');
    assert.ok(testRunner.includes('validation.txt'), '测试包装脚本应生成 validation.txt');

    assert.match(pkg.packageManager, /^pnpm@\d+\.\d+\.\d+/);
    assert.match(nvmrc, /^v\d+\.\d+\.\d+$/);
});
