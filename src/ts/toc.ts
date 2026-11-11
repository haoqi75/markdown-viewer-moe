import type { TocApi, TocHeading } from './types';

const ICONS = ['🌸', '🌿', '🍀', '💮', '🌺', '🌻'];

function requiredElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element #${id}`);
    }
    return element as T;
}

const sidebar = requiredElement<HTMLElement>('toc-sidebar');
const overlay = requiredElement<HTMLElement>('toc-overlay');
const content = requiredElement<HTMLElement>('content');
const tocContent = requiredElement<HTMLElement>('toc-content');
const toggleBtn = requiredElement<HTMLButtonElement>('toc-toggle');
const closeBtn = requiredElement<HTMLButtonElement>('toc-close-btn');
const badge = requiredElement<HTMLElement>('toc-badge');
const countEl = requiredElement<HTMLElement>('toc-count');

let isOpen = false;
let headings: TocHeading[] = [];
let scrollSpyObserver: IntersectionObserver | null = null;
let scrollSpyActiveAt = 0;

function generate(): void {
    const els = content.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6');
    headings = [];

    if (els.length === 0) {
        tocContent.innerHTML = '<div class="toc-empty">🌸 暂无标题</div>';
        badge.textContent = '0';
        countEl.textContent = '0';
        return;
    }

    let html = '';
    els.forEach((el, index) => {
        let id = el.id;
        if (!id) {
            let base = (el.textContent ?? '')
                .trim()
                .slice(0, 50)
                .replace(/[^a-zA-Z\u4e00-\u9fa5\d-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase();
            if (!base) base = 'section';
            id = base;
            let n = 1;
            while (document.getElementById(id)) {
                id = `${base}-${n++}`;
            }
            el.id = id;
        }

        const level = parseInt(el.tagName.charAt(1), 10);
        const text = (el.textContent ?? '').trim() || `标题 ${index + 1}`;
        const icon = ICONS[(level - 1) % ICONS.length];
        headings.push({ id, level, text, element: el });
        html += `
            <div class="toc-item toc-h${level}" data-target="${id}" role="button" tabindex="0">
                <span class="icon">${icon}</span>
                <span>${text}</span>
            </div>
        `;
    });

    tocContent.innerHTML = html;
    badge.textContent = String(els.length);
    countEl.textContent = String(els.length);

    els.forEach((el) => {
        const level = parseInt(el.tagName.charAt(1), 10);
        const icon = ICONS[(level - 1) % ICONS.length];
        const anchor = document.createElement('a');
        anchor.className = 'heading-anchor';
        anchor.href = `#${el.id}`;
        anchor.textContent = icon;
        anchor.title = '链接到此标题';
        anchor.addEventListener('click', (event) => {
            event.preventDefault();
            scrollToHeading(el.id, true);
        });
        el.appendChild(anchor);
    });

    tocContent.querySelectorAll<HTMLElement>('.toc-item').forEach((item) => {
        const targetId = item.dataset.target;
        if (!targetId) return;

        item.addEventListener('click', (event) => {
            event.stopPropagation();
            scrollToHeading(targetId);
        });
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                scrollToHeading(targetId);
            }
        });
    });
}

function scrollToHeading(id: string, pushState = true): void {
    const element = document.getElementById(id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    element.style.transition = 'background 0.3s';
    element.style.background = 'rgba(var(--moe-pink-rgb), 0.12)';
    element.style.borderRadius = '6px';
    setTimeout(() => {
        element.style.background = 'transparent';
    }, 1200);

    if (pushState !== false) {
        history.pushState(null, '', `#${id}`);
    }
    close();
}

function open(): void {
    isOpen = true;
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function close(): void {
    isOpen = false;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function toggle(): void {
    if (isOpen) {
        close();
    } else {
        open();
    }
}

function startScrollSpy(): void {
    if (scrollSpyObserver) {
        scrollSpyObserver.disconnect();
    }
    scrollSpyActiveAt = Date.now();

    if (headings.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        // 启动后 2 秒内不更新 hash，等待初始 hash 滚动完成
        if (Date.now() - scrollSpyActiveAt < 2000) return;

        const candidates: Array<{ id: string; ratio: number }> = [];
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                candidates.push({
                    id: (entry.target as HTMLElement).id,
                    ratio: entry.intersectionRatio,
                });
            }
        });

        if (candidates.length > 0) {
            candidates.sort((a, b) => b.ratio - a.ratio);
            const activeId = candidates[0]?.id;
            if (activeId && window.location.hash !== `#${activeId}`) {
                history.replaceState(null, '', `#${activeId}`);
            }
        }
    }, {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    scrollSpyObserver = observer;
    headings.forEach((heading) => observer.observe(heading.element));
}

function init(): void {
    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen) close();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && isOpen) close();
    });

    generate();
}

export const TOC: TocApi = {
    init,
    generate,
    scrollToHeading,
    open,
    close,
    toggle,
    getHeadings: () => headings,
    startScrollSpy,
};
