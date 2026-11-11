import { CONFIG } from './config';
import { Renderer } from './renderer';
import { TOC } from './toc';

// 禁止浏览器自动恢复滚动位置，避免与 #heading 导航冲突
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 通过 User-Agent 检测移动端，增强图标显示判断
(function detectMobile() {
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        document.documentElement.classList.add('is-mobile');
    }
})();

if (CONFIG.title) {
    document.title = CONFIG.title;
}

// 区分锚点导航与页面切换
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const id = hash.slice(1);
        if (document.getElementById(id)) {
            TOC.scrollToHeading(id, false);
            return;
        }
    }

    void Renderer.load();
});

document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG.theme) {
        document.documentElement.setAttribute('data-theme', CONFIG.theme);
        const themeColors: Record<string, string> = {
            pink: '#ff6b9d',
            blue: '#3b82f6',
            green: '#22c55e',
            purple: '#9333ea',
            white: '#d4a5a5',
            yellow: '#d97706',
        };
        const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (meta && themeColors[CONFIG.theme]) {
            meta.setAttribute('content', themeColors[CONFIG.theme]);
        }
    }

    TOC.init();

    const logoEl = document.querySelector<HTMLElement>('.logo');
    const subEl = document.querySelector<HTMLElement>('.logo-sub');
    if (logoEl && CONFIG.logo?.text) {
        logoEl.textContent = CONFIG.logo.text;
    }
    if (subEl && CONFIG.logo?.sub) {
        subEl.textContent = CONFIG.logo.sub;
    }

    const headerLeft = document.querySelector<HTMLElement>('.header-left');
    if (headerLeft) {
        headerLeft.style.cursor = 'pointer';
        headerLeft.title = '返回首页';
        headerLeft.addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.searchParams.delete('p');
            url.searchParams.delete('md');
            window.location.href = url.href;
        });
    }

    const footerEl = document.getElementById('footer');
    if (footerEl && CONFIG.footer) {
        footerEl.innerHTML = marked.parse(CONFIG.footer);
        if (CONFIG.version) {
            const versionEl = document.createElement('div');
            versionEl.className = 'footer-version';
            versionEl.textContent = `v${CONFIG.version}${CONFIG.gitHash ? `(${CONFIG.gitHash})` : ''}`;
            footerEl.appendChild(versionEl);
        }
    }

    const mascotImg = document.getElementById('mascot-img') as HTMLImageElement | null;
    if (mascotImg && CONFIG.mascot) {
        if (!mascotImg.src.startsWith('data:')) {
            mascotImg.src = CONFIG.mascot;
        }
        mascotImg.style.cursor = 'pointer';
        mascotImg.title = '回到顶部';
        mascotImg.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const bubbleEl = document.getElementById('toc-bubble');
    if (bubbleEl && CONFIG.tocWelcome) {
        bubbleEl.textContent = CONFIG.tocWelcome;
    }

    const toolsLink = document.getElementById('tools-link') as HTMLAnchorElement | null;
    if (toolsLink && CONFIG.toolsUrl) {
        toolsLink.href = CONFIG.toolsUrl;
    }

    void Renderer.load();
});

console.log('🌸 Moe Markdown Preview 已加载');
console.log('📋 当前配置:', CONFIG);
console.log('🔑 别名键名:', Object.keys(CONFIG.aliases ?? {}));
window.__MOE = { CONFIG, TOC, Renderer };
