import { CONFIG } from './config';
import { contentEl } from './dom';
import { TOC } from './toc';

export function interceptAnchors(): void {
    contentEl.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const id = anchor.getAttribute('href')?.slice(1);
            if (id && document.getElementById(id)) {
                event.preventDefault();
                TOC.scrollToHeading(id, true);
            }
        });
    });
}

export function replaceBrokenImg(img: HTMLImageElement): void {
    const alt = img.getAttribute('alt') ?? '';
    const span = document.createElement('span');
    span.className = 'img-error';
    span.setAttribute('role', 'img');
    if (alt) span.setAttribute('aria-label', alt);

    const iconHtml = CONFIG.errorMascot
        ? `<img class="img-error-mascot" src="${CONFIG.errorMascot}" alt="">`
        : '<span class="img-error-icon">🖼️</span>';
    const altHtml = alt ? `<span class="img-error-alt">${alt}</span>` : '';
    span.innerHTML = `${iconHtml}<span class="img-error-text">哎呀，图片加载失败了</span>${altHtml}`;

    img.parentNode?.replaceChild(span, img);
}

interface CalloutInfo {
    icon: string;
    label: string;
    cls: string;
}

export function setupCallouts(): void {
    const types: Record<string, CalloutInfo> = {
        NOTE: { icon: '📝', label: '笔记 (Note)', cls: 'callout-note' },
        TIP: { icon: '💡', label: '提示 (Tip)', cls: 'callout-tip' },
        IMPORTANT: { icon: '📌', label: '重要 (Important)', cls: 'callout-important' },
        WARNING: { icon: '⚠️', label: '注意 (Warning)', cls: 'callout-warning' },
        CAUTION: { icon: '🚫', label: '警告 (Caution)', cls: 'callout-caution' },
    };

    contentEl.querySelectorAll<HTMLQuoteElement>('blockquote').forEach((blockquote) => {
        const paragraph = blockquote.querySelector('p');
        if (!paragraph) return;

        const match = (paragraph.textContent ?? '').match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (!match) return;

        const type = match[1].toUpperCase();
        const info = types[type];
        if (!info) return;

        const wrapper = document.createElement('div');
        wrapper.className = `callout ${info.cls}`;

        const title = document.createElement('p');
        title.className = 'callout-title';
        title.textContent = `${info.icon} ${info.label}`;
        wrapper.appendChild(title);

        // 移除第一行标签文字
        let text = paragraph.innerHTML.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
        // breaks:true 会在独占一行的 [!WARNING] 后插入 <br>，去掉
        text = text.replace(/^(\s*<br\s*\/?>\s*)+/i, '');

        // 收集第一段之后的所有子元素（后续段落等）
        let remaining = '';
        let sibling: Element | null = paragraph.nextElementSibling;
        while (sibling) {
            remaining += sibling.outerHTML;
            sibling = sibling.nextElementSibling;
        }

        if (text.trim() || remaining) {
            const body = document.createElement('div');
            body.className = 'callout-body';
            body.innerHTML = text + remaining;
            wrapper.appendChild(body);
        }

        blockquote.parentNode?.replaceChild(wrapper, blockquote);
    });
}

export function setupImagePreview(): void {
    let overlay = document.getElementById('img-preview');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'img-preview';
        overlay.className = 'img-preview-overlay';
        overlay.innerHTML = '<img class="img-preview-content" alt="">';
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) overlay?.classList.remove('active');
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') overlay?.classList.remove('active');
        });
        document.body.appendChild(overlay);
    }

    const previewImg = overlay.querySelector<HTMLImageElement>('img');
    if (!previewImg) return;

    contentEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        if (img.closest('a')) return;
        if (img.classList.contains('img-error-mascot')) return;
        if (img.parentElement?.classList.contains('img-error')) return;

        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (event) => {
            event.stopPropagation();
            previewImg.src = img.src;
            previewImg.alt = img.alt || '';
            overlay?.classList.add('active');
        });
    });
}
