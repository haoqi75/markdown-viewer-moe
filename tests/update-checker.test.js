'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const BUNDLE = esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'src', 'ts', 'update-checker.ts')],
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: ['es2020'],
    write: false,
    logLevel: 'silent',
}).outputFiles[0].text;

function makeElement(tagName = 'div') {
    return {
        tagName: tagName.toUpperCase(),
        className: '',
        textContent: '',
        disabled: false,
        children: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        addEventListener() {},
    };
}

function createRuntime(fetchImpl) {
    const storage = new Map();
    const elements = new Map();

    const button = makeElement('button');
    button.textContent = '🔄 检查更新';
    elements.set('about-check-update', button);

    const statusEl = makeElement('p');
    elements.set('about-update-status', statusEl);

    const sessionStorage = {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, String(value));
        },
        removeItem(key) {
            storage.delete(key);
        },
    };

    const document = {
        getElementById(id) {
            if (id === 'release-config') return null;
            return elements.get(id) || null;
        },
        createElement(tagName) {
            return makeElement(tagName);
        },
        createTextNode(text) {
            return { nodeType: 3, textContent: String(text) };
        },
        querySelector() {
            return null;
        },
    };

    const windowObject = {
        __CONFIG__: {
            version: '1.12.1',
        },
    };

    const moduleShim = { exports: {} };
    const sandbox = {
        module: moduleShim,
        exports: moduleShim.exports,
        window: windowObject,
        document,
        sessionStorage,
        fetch: fetchImpl,
        AbortController,
        setTimeout,
        clearTimeout,
        console,
        URL,
        URLSearchParams,
    };
    sandbox.globalThis = sandbox;

    vm.createContext(sandbox);
    vm.runInContext(BUNDLE, sandbox, { filename: 'src/ts/update-checker.ts' });

    return {
        checkForUpdate: moduleShim.exports.checkForUpdate,
        button,
        statusEl,
        storage,
    };
}

test('更新检查：GitHub API 403 限流时给出 warning 和 Releases 链接', async () => {
    let requestedUrl = '';
    const runtime = createRuntime(async (url) => {
        requestedUrl = url;
        return {
            status: 403,
            ok: false,
            headers: {
                get(name) {
                    return name === 'X-RateLimit-Remaining' ? '0' : null;
                },
            },
            async json() {
                return {};
            },
        };
    });

    await runtime.checkForUpdate(runtime.button, runtime.statusEl);

    assert.match(requestedUrl, /api\.github\.com\/repos\/haoqi75\/markdown-viewer-moe\/releases\/latest/);
    assert.equal(runtime.statusEl.className, 'about-update-status is-warning');
    assert.ok(runtime.statusEl.textContent.includes('每小时最多 60 次'));
    assert.ok(runtime.statusEl.children.some((child) => child.tagName === 'A'));
    assert.equal(runtime.button.disabled, false);
    assert.equal(runtime.button.textContent, '🔄 检查更新');
    assert.ok(runtime.storage.has('moe:update-check:1.12.1'));
});

test('更新检查：发现新版本、渲染链接并缓存结果', async () => {
    let fetchCalls = 0;
    const runtime = createRuntime(async () => {
        fetchCalls += 1;
        return {
            status: 200,
            ok: true,
            headers: { get() { return null; } },
            async json() {
                return {
                    tag_name: 'v1.13.0',
                    html_url: 'https://github.com/haoqi75/markdown-viewer-moe/releases/tag/v1.13.0',
                };
            },
        };
    });

    await runtime.checkForUpdate(runtime.button, runtime.statusEl);

    assert.equal(fetchCalls, 1);
    assert.equal(runtime.statusEl.className, 'about-update-status is-success');
    assert.ok(runtime.statusEl.textContent.includes('发现新版本 v1.13.0'));
    const link = runtime.statusEl.children.find((child) => child.tagName === 'A');
    assert.ok(link, '缺少 Releases 链接');
    assert.equal(link.href, 'https://github.com/haoqi75/markdown-viewer-moe/releases/tag/v1.13.0');

    // 10 分钟缓存内再次点击不应重复请求 GitHub API
    await runtime.checkForUpdate(runtime.button, runtime.statusEl);
    assert.equal(fetchCalls, 1);
    assert.ok(runtime.statusEl.textContent.includes('缓存结果'));
});
