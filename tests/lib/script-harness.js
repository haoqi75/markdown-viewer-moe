'use strict';

/**
 * 在 Node 的 vm 沙箱里加载 src/script.js，并提供最小 DOM mock。
 * 只用于测试路由和关于页渲染，不模拟完整浏览器。
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_SOURCE = fs.readFileSync(path.join(ROOT, 'src', 'script.js'), 'utf8');

const atobImpl = typeof globalThis.atob === 'function'
    ? globalThis.atob
    : function (value) { return Buffer.from(value, 'base64').toString('binary'); };
const btoaImpl = typeof globalThis.btoa === 'function'
    ? globalThis.btoa
    : function (value) { return Buffer.from(value, 'binary').toString('base64'); };

function makeElement(tag) {
    const element = {
        tagName: String(tag || 'div').toUpperCase(),
        id: '',
        className: '',
        textContent: '',
        innerHTML: '',
        style: {},
        dataset: {},
        attributes: {},
        children: [],
        classList: {
            add() {},
            remove() {},
            contains() { return false; },
            toggle() {},
        },
        appendChild(child) { this.children.push(child); return child; },
        removeChild(child) {
            const index = this.children.indexOf(child);
            if (index >= 0) this.children.splice(index, 1);
        },
        replaceChild(child, oldChild) {
            const index = this.children.indexOf(oldChild);
            if (index >= 0) this.children[index] = child;
        },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        addEventListener() {},
        removeEventListener() {},
        setAttribute(name, value) { this.attributes[name] = String(value); },
        getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; },
        closest() { return null; },
        cloneNode() { return this; },
        getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
        focus() {},
        remove() {},
    };
    return element;
}

/**
 * @param {object} [options]
 * @param {string} [options.search] 例如 '?p=about'
 * @param {object} [options.config] window.__CONFIG__
 * @param {object|null} [options.releaseConfig] <script id="release-config"> 内容
 */
function createHarness(options) {
    const opts = options || {};
    const elements = new Map();
    const getElement = (id) => {
        if (!elements.has(id)) elements.set(id, makeElement('div'));
        return elements.get(id);
    };

    // TOC 初始化/渲染时会直接访问这些节点
    [
        'toc-sidebar', 'toc-overlay', 'content', 'toc-content',
        'toc-toggle', 'toc-close-btn', 'toc-badge', 'toc-count',
        'footer', 'mascot-img', 'toc-bubble', 'img-preview',
    ].forEach(getElement);

    let templateCloneCount = 0;
    const aboutTemplate = makeElement('template');
    aboutTemplate.content = {
        cloneNode() {
            templateCloneCount += 1;
            return makeElement('div');
        },
    };
    elements.set('about-page-template', aboutTemplate);

    const contentElement = getElement('content');
    const logoSub = makeElement('span');

    const document = {
        title: '',
        documentElement: makeElement('html'),
        body: makeElement('body'),
        getElementById(id) {
            if (id === 'release-config') {
                return opts.releaseConfig
                    ? { textContent: JSON.stringify(opts.releaseConfig) }
                    : null;
            }
            return elements.get(id) || null;
        },
        querySelector(selector) {
            if (selector === '.logo-sub') return logoSub;
            return null;
        },
        querySelectorAll() { return []; },
        createElement(tag) { return makeElement(tag); },
        addEventListener() {},
    };

    const location = {
        search: opts.search || '',
        hash: '',
        pathname: '/',
        origin: 'https://example.test',
        href: 'https://example.test/' + (opts.search || ''),
        assign() {},
        replace() {},
    };

    const history = {
        scrollRestoration: undefined,
        pushState() {},
        replaceState() {},
    };

    const windowObject = {
        __CONFIG__: opts.config || {
            title: '测试站点',
            defaultUrl: 'https://default.test/index.md',
            aliases: {},
        },
        location,
        history,
        innerWidth: 1200,
        pageYOffset: 0,
        addEventListener() {},
        scrollTo() {},
    };

    const sandbox = {
        window: windowObject,
        document,
        history,
        navigator: { userAgent: 'node-test' },
        URL,
        URLSearchParams,
        atob: atobImpl,
        btoa: btoaImpl,
        console: {
            log() {},
            info() {},
            warn() {},
            debug() {},
            error(...args) { console.error(...args); },
        },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        fetch: async function () { throw new Error('fetch should not be called in this test'); },
        marked: { parse: function (value) { return value; } },
        Prism: undefined,
        IntersectionObserver: class {
            observe() {}
            disconnect() {}
        },
    };
    sandbox.globalThis = sandbox;

    vm.createContext(sandbox);
    vm.runInContext(SCRIPT_SOURCE, sandbox, { filename: 'src/script.js' });

    return {
        sandbox,
        document,
        window: windowObject,
        contentElement,
        logoSub,
        aboutTemplate,
        get templateCloneCount() { return templateCloneCount; },
        MOE: windowObject.__MOE,
    };
}

module.exports = { createHarness, makeElement };
