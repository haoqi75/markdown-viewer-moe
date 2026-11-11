import { CONFIG } from './config';
import { contentEl } from './dom';
import { interceptAnchors, setupImagePreview } from './render-utils';
import { TOC } from './toc';
import { setupUpdateChecker } from './update-checker';

export function renderAbout(): void {
    const template = document.getElementById('about-page-template') as HTMLTemplateElement | null;
    if (!template) {
        contentEl.innerHTML = `
            <div class="error-wrap">
                <p class="error-code">?</p>
                <p class="error-msg">关于页面未找到</p>
                <p class="error-detail">构建产物中缺少 about-page-template，请重新运行构建。</p>
                <button class="retry-btn" onclick="location.href=location.origin+location.pathname">🏠 返回首页</button>
            </div>
        `;
        return;
    }

    const fragment = template.content.cloneNode(true) as DocumentFragment;

    // 复用 <link rel="icon"> 已内联的 favicon，避免在单文件中重复嵌入大体积 Data URI
    const aboutIcon = fragment.querySelector<HTMLImageElement>('.about-emoji');
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (aboutIcon && favicon?.href) {
        aboutIcon.src = favicon.href;
    }

    contentEl.innerHTML = '';
    contentEl.appendChild(fragment);
    setupUpdateChecker();

    const subEl = document.querySelector<HTMLElement>('.logo-sub');
    if (subEl) subEl.textContent = '关于';
    document.title = `关于 · ${CONFIG.title || '萌·Markdown'}`;

    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
    interceptAnchors();
    setupImagePreview();
    TOC.generate();
    TOC.startScrollSpy();
    window.scrollTo({ top: 0 });
}
