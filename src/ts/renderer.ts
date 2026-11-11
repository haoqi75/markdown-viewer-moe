import { renderAbout } from './about-page';
import { CONFIG } from './config';
import { contentEl } from './dom';
import {
    interceptAnchors,
    replaceBrokenImg,
    setupCallouts,
    setupImagePreview,
} from './render-utils';
import {
    ABOUT_PAGE,
    ALIAS_NOT_FOUND,
    MD_DECODE_FAILED,
    resolveUrl,
} from './router';
import { TOC } from './toc';
import type { RendererApi } from './types';

const STATUS_MESSAGES: Record<string, string> = {
    '400': '请求无效',
    '401': '需要身份验证',
    '403': '禁止访问',
    '404': '页面未找到',
    '408': '请求超时',
    '429': '请求过于频繁',
    '500': '服务器内部错误',
    '502': '网关错误',
    '503': '服务不可用',
    '504': '网关超时',
};

function updateLogoSubFromUrl(url: string): void {
    if (!CONFIG.logoSubUseDocTitle) return;

    try {
        const pathname = new URL(url).pathname;
        const segments = pathname.replace(/\/+$/, '').split('/');
        const filename = segments[segments.length - 1] || '';
        if (filename) {
            const subEl = document.querySelector<HTMLElement>('.logo-sub');
            if (subEl) subEl.textContent = filename;
        }
    } catch {
        // URL 不可解析时忽略
    }
}

function showAliasNotFound(): void {
    const aliasNotFound = new URLSearchParams(window.location.search).get('p');
    const homeUrl = window.location.pathname + (window.location.hash || '');
    contentEl.innerHTML = `
        <div class="error-wrap">
            ${CONFIG.errorMascot ? `<div class="error-mascot"><img class="error-mascot-img" src="${CONFIG.errorMascot}" alt=""></div>` : ''}
            <p class="error-code">?</p>
            <p class="error-msg">别名未找到</p>
            <p class="error-detail"><strong>别名：</strong>${aliasNotFound || ''}</p>
            <p class="error-detail">此别名不存在于配置中，请检查 URL 或联系管理员</p>
            <button class="retry-btn" style="margin-right:0.6rem;" onclick="location.href='${homeUrl}'">🏠 返回首页</button>
            <button class="retry-btn" onclick="location.reload()">🔄 重试</button>
        </div>
    `;
}

function showDecodeFailed(): void {
    const badMd = new URLSearchParams(window.location.search).get('md') || '';
    const displayed = badMd.length > 80 ? `${badMd.slice(0, 80)}...` : badMd;
    contentEl.innerHTML = `
        <div class="error-wrap">
            ${CONFIG.errorMascot ? `<div class="error-mascot"><img class="error-mascot-img" src="${CONFIG.errorMascot}" alt=""></div>` : ''}
            <p class="error-code">🔐</p>
            <p class="error-msg">?md= 解码失败</p>
            <p class="error-detail">?md= 参数需为 Base64 编码的 URL</p>
            <p class="error-detail"><strong>原始值：</strong><span style="word-break:break-all;font-size:0.8em;">${displayed}</span></p>
            <button class="retry-btn" style="margin-right:0.6rem;" onclick="location.href=location.origin+location.pathname+location.hash">🏠 返回首页</button>
            <button class="retry-btn" onclick="location.reload()">🔄 重试</button>
        </div>
    `;
}

function showLoading(url: string): void {
    contentEl.innerHTML = `
        <div class="loading-wrap">
            ${CONFIG.loadingMascot ? `<img class="loading-mascot" src="${CONFIG.loadingMascot}" alt="加载中">` : ''}
            <div class="spinner"></div>
            <p>🌸 正在加载文档…</p>
            <p style="font-size:0.8rem; opacity:0.5; word-break:break-all;">请求：${url}</p>
        </div>
    `;
}

function setupHashScroll(): void {
    if (!window.location.hash) {
        TOC.startScrollSpy();
        return;
    }

    let headingId = window.location.hash.slice(1);
    try {
        headingId = decodeURIComponent(headingId);
    } catch {
        // 保留原始值
    }

    let hashScrolled = false;

    function scrollToHash(): boolean {
        const element = document.getElementById(headingId);
        if (!element) return false;

        const top = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top });
        element.style.transition = 'background 0.3s';
        element.style.background = 'rgba(var(--moe-pink-rgb), 0.12)';
        element.style.borderRadius = '6px';
        setTimeout(() => {
            element.style.background = 'transparent';
        }, 1200);
        return true;
    }

    function afterLayout(fn: () => void): void {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(fn, 150);
            });
        });
    }

    function doScrollThenSpy(): void {
        if (hashScrolled) return;
        if (scrollToHash()) {
            hashScrolled = true;
        }
        setTimeout(() => TOC.startScrollSpy(), 800);
    }

    const images = contentEl.querySelectorAll<HTMLImageElement>('img');
    if (images.length === 0) {
        afterLayout(doScrollThenSpy);
        return;
    }

    let pending = images.length;
    function onImageDone(): void {
        pending -= 1;
        if (pending <= 0) afterLayout(doScrollThenSpy);
    }

    images.forEach((img) => {
        if (img.complete) {
            onImageDone();
        } else {
            img.addEventListener('load', onImageDone, { once: true });
            img.addEventListener('error', onImageDone, { once: true });
        }
    });

    setTimeout(() => {
        if (pending > 0) {
            pending = 0;
            afterLayout(doScrollThenSpy);
        }
    }, 5000);
}

function showLoadError(url: string, error: unknown): void {
    console.error('加载失败:', error);

    const err = error as Error;
    const message = err.message || '未知错误';
    let statusCode = '';
    let statusMsg = '';

    const match = message.match(/HTTP\s*(\d+)/);
    if (match) {
        statusCode = match[1];
        statusMsg = STATUS_MESSAGES[statusCode] || '服务器错误';
    }

    const mascotHtml = CONFIG.errorMascot
        ? `<img class="error-mascot-img" src="${CONFIG.errorMascot}" alt="Error Mascot">`
        : '<span class="error-mascot-text">🌸</span>';

    const params = new URLSearchParams(window.location.search);
    const homeBtn = (params.get('p') || params.get('md'))
        ? '<button class="retry-btn" style="margin-right:0.6rem;" onclick="location.href=location.origin+location.pathname+location.hash">🏠 返回首页</button>'
        : '';

    contentEl.innerHTML = `
        <div class="error-wrap">
            <div class="error-mascot">${mascotHtml}</div>
            ${statusCode ? `<p class="error-code">${statusCode}</p>` : ''}
            ${statusMsg ? `<p class="error-msg">${statusMsg}</p>` : '<p class="error-msg">🌸 哎呀，加载失败了</p>'}
            <p class="error-detail"><strong>请求地址：</strong><span style="word-break:break-all;">${url}</span></p>
            <p class="error-detail"><strong>原始信息：</strong>${message}</p>
            <p style="font-size:0.85rem; opacity:0.6; margin-top:0.5rem;">
                ${err.name === 'TypeError' && message.indexOf('Failed to fetch') >= 0 ? '💡 可能是跨域（CORS）问题或网络不可达' : ''}
            </p>
            ${homeBtn}
            <button class="retry-btn" onclick="location.reload()">🔄 重试</button>
        </div>
    `;
}

async function load(): Promise<void> {
    const url = resolveUrl();

    if (url === ABOUT_PAGE) {
        renderAbout();
        return;
    }

    updateLogoSubFromUrl(url);

    if (url === ALIAS_NOT_FOUND) {
        showAliasNotFound();
        return;
    }

    if (url === MD_DECODE_FAILED) {
        showDecodeFailed();
        return;
    }

    showLoading(url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const markdown = await response.text();
        const html = marked.parse(markdown, {
            gfm: true,
            breaks: false,
            pedantic: false,
            headerIds: false,
        });
        contentEl.innerHTML = html;

        // 修正相对路径图片和链接
        contentEl.querySelectorAll<HTMLImageElement>('img[src]').forEach((img) => {
            const src = img.getAttribute('src');
            if (src && !/^https?:\/\//i.test(src) && !src.startsWith('data:')) {
                try {
                    img.src = new URL(src, url).href;
                } catch {
                    // 无法解析时保留原值
                }
            }
        });

        contentEl.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
            const href = anchor.getAttribute('href');
            if (
                href
                && !/^https?:\/\//i.test(href)
                && !href.startsWith('#')
                && !href.startsWith('javascript:')
                && !href.startsWith('mailto:')
            ) {
                try {
                    anchor.href = new URL(href, url).href;
                } catch {
                    // 无法解析时保留原值
                }
            }
        });

        // 加载失败的图片替换为 moe 占位提示
        contentEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
            if (img.complete && img.naturalWidth === 0 && img.naturalHeight === 0 && img.src) {
                replaceBrokenImg(img);
            } else {
                img.addEventListener('error', () => replaceBrokenImg(img));
            }
        });

        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }

        setupCallouts();
        TOC.generate();
        interceptAnchors();
        setupImagePreview();

        contentEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
            img.addEventListener('load', () => {
                if (typeof Prism !== 'undefined') Prism.highlightAll();
            });
        });

        setupHashScroll();
    } catch (error) {
        showLoadError(url, error);
    }
}

export const Renderer: RendererApi = { load, resolveUrl };
