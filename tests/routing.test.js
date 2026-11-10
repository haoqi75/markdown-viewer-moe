'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createHarness } = require('./lib/script-harness');

function base64(value) {
    return Buffer.from(value, 'utf8').toString('base64');
}

function resolveWith(search, options) {
    const harness = createHarness(Object.assign({ search }, options || {}));
    return harness.MOE.Renderer.resolveUrl();
}

test('路由：无参数时使用 defaultUrl', () => {
    const harness = createHarness({
        config: {
            defaultUrl: 'https://default.test/index.md',
            aliases: {},
        },
    });
    assert.equal(harness.MOE.Renderer.resolveUrl(), 'https://default.test/index.md');
});

test('路由：?p= 别名匹配且不区分大小写', () => {
    const config = {
        defaultUrl: 'https://default.test/index.md',
        aliases: {
            Page: 'https://docs.test/page.md',
            docs: 'https://docs.test/docs.md',
        },
    };
    assert.equal(resolveWith('?p=page', { config }), 'https://docs.test/page.md');
    assert.equal(resolveWith('?p=PAGE', { config }), 'https://docs.test/page.md');
    assert.equal(resolveWith('?p=docs', { config }), 'https://docs.test/docs.md');
});

test('路由：未知别名返回特殊标记', () => {
    assert.equal(
        resolveWith('?p=missing', { config: { defaultUrl: 'https://default.test/index.md', aliases: { page: 'https://docs.test/page.md' } } }),
        '__ALIAS_NOT_FOUND__'
    );
});

test('路由：?p=about 是内置关于页，并优先于同名别名', () => {
    const config = {
        defaultUrl: 'https://default.test/index.md',
        aliases: { about: 'https://docs.test/about.md' },
    };
    assert.equal(resolveWith('?p=about', { config }), '__ABOUT_PAGE__');
    assert.equal(resolveWith('?p=ABOUT', { config }), '__ABOUT_PAGE__');
});

test('路由：?md= 解码 Base64 URL', () => {
    const url = 'https://example.com/test.md';
    assert.equal(resolveWith('?md=' + base64(url)), url);
});

test('路由：?md= 优先级高于 ?p=', () => {
    const url = 'https://example.com/test.md';
    assert.equal(resolveWith('?md=' + base64(url) + '&p=about'), url);
});

test('路由：?md= 非法或非 http(s) 地址返回解码失败标记', () => {
    assert.equal(resolveWith('?md=%%%'), '__MD_DECODE_FAILED__');
    assert.equal(resolveWith('?md=' + base64('ftp://example.com/test.md')), '__MD_DECODE_FAILED__');
});

test('配置：release-config 覆盖 defaultUrl、aliases 和 theme', () => {
    const harness = createHarness({
        config: {
            defaultUrl: 'https://normal.test/index.md',
            aliases: { page: 'https://normal.test/page.md' },
            theme: 'pink',
        },
        releaseConfig: {
            type: 'release',
            defaultUrl: 'https://release.test/index.md',
            aliases: { page: 'https://release.test/page.md' },
            theme: 'blue',
        },
    });

    assert.equal(harness.MOE.CONFIG.defaultUrl, 'https://release.test/index.md');
    assert.equal(harness.MOE.CONFIG.aliases.page, 'https://release.test/page.md');
    assert.equal(harness.MOE.CONFIG.theme, 'blue');
    assert.equal(harness.MOE.Renderer.resolveUrl(), 'https://release.test/index.md');

    harness.window.location.search = '?p=page';
    assert.equal(harness.MOE.Renderer.resolveUrl(), 'https://release.test/page.md');
});

test('关于页：?p=about 渲染内嵌模板并更新标题/副标题', async () => {
    const harness = createHarness({
        search: '?p=about',
        config: {
            title: '测试站点',
            defaultUrl: 'https://default.test/index.md',
            aliases: {},
        },
    });

    await harness.MOE.Renderer.load();

    assert.equal(harness.templateCloneCount, 1, '应克隆一次关于页模板');
    assert.ok(harness.contentElement.children.length > 0, '关于页内容应写入 #content');
    assert.equal(harness.logoSub.textContent, '关于');
    assert.equal(harness.document.title, '关于 · 测试站点');
});
