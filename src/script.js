// ============================================================
// 配置加载（由构建工具注入 __CONFIG__）
// ============================================================
const CONFIG = window.__CONFIG__ || {
    defaultUrl: 'https://cp.qtdt.qzz.io/api/raw/index',
    aliases: {}
};

// ============================================================
// 目录功能 (TOC) —— 完整实现
// ============================================================
const TOC = (function() {
    const sidebar = document.getElementById('toc-sidebar');
    const overlay = document.getElementById('toc-overlay');
    const content = document.getElementById('content');
    const tocContent = document.getElementById('toc-content');
    const toggleBtn = document.getElementById('toc-toggle');
    const closeBtn = document.getElementById('toc-close-btn');
    const badge = document.getElementById('toc-badge');
    const countEl = document.getElementById('toc-count');

    let isOpen = false;
    let headings = [];

    function generate() {
        const els = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings = [];

        if (els.length === 0) {
            tocContent.innerHTML = `<div class="toc-empty">🌸 暂无标题</div>`;
            badge.textContent = '0';
            countEl.textContent = '0';
            return;
        }

        let html = '';
        els.forEach((el, index) => {
            let id = el.id;
            if (!id) {
                const base = el.textContent.trim().slice(0, 30).replace(/[^a-zA-Z\u4e00-\u9fa5\d\-_]/g, '_');
                id = `heading-${base}-${index}`;
                el.id = id;
            }
            const level = parseInt(el.tagName.charAt(1), 10);
            const text = el.textContent.trim() || `标题 ${index + 1}`;
            const icons = ['🌸', '🌿', '🍀', '💮', '🌺', '🌻'];
            const icon = icons[(level - 1) % icons.length];
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

        tocContent.querySelectorAll('.toc-item').forEach(item => {
            const targetId = item.dataset.target;
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                scrollToHeading(targetId);
            });
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToHeading(targetId);
                }
            });
        });
    }

    function scrollToHeading(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        el.style.transition = 'background 0.3s';
        el.style.background = 'rgba(255,107,157,0.12)';
        el.style.borderRadius = '6px';
        el.style.padding = '0 0.4rem';
        setTimeout(() => {
            el.style.background = 'transparent';
            el.style.padding = '0';
        }, 1200);
        if (window.innerWidth < 768) {
            close();
        }
    }

    function open() {
        isOpen = true;
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        isOpen = false;
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function toggle() {
        isOpen ? close() : open();
    }

    function init() {
        toggleBtn.addEventListener('click', toggle);
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) close();
        });
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && isOpen) close();
        });
        generate();
    }

    return {
        init,
        generate,
        scrollToHeading,
        open,
        close,
        toggle,
        getHeadings: () => headings,
    };
})();

// ============================================================
// 渲染引擎
// ============================================================
const Renderer = (function() {
    const contentEl = document.getElementById('content');

    function resolveUrl() {
        // 1. 优先使用 URL 参数 ?md=
        const params = new URLSearchParams(window.location.search);
        const mdParam = params.get('md');
        if (mdParam) return mdParam;

        // 2. 从 hash 中提取路径（支持 #!/path、#/path、#!path）
        const hash = window.location.hash;
        let path = '';
        if (hash.startsWith('#!/')) {
            path = hash.slice(3);
        } else if (hash.startsWith('#!')) {
            path = hash.slice(2);
        } else if (hash.startsWith('#/')) {
            path = hash.slice(2);
        } else if (hash.startsWith('#')) {
            path = hash.slice(1);
        }
        // 去掉查询参数
        path = path.split('?')[0];
        // 去除首尾斜杠和空格
        path = path.replace(/^\/+/, '').replace(/\/+$/, '').trim();

        console.log('🔍 原始 hash:', hash);
        console.log('🔍 提取的路径:', path);
        console.log('📋 可用别名键名:', Object.keys(CONFIG.aliases || {}));

        if (path && CONFIG.aliases && typeof CONFIG.aliases === 'object') {
            const lowerPath = path.toLowerCase();
            for (const [key, val] of Object.entries(CONFIG.aliases)) {
                if (key.toLowerCase() === lowerPath) {
                    console.log(`✅ 匹配到别名 "${key}" -> ${val}`);
                    return val;
                }
            }
        }

        // 3. 回退到默认 URL
        console.log('🔁 未匹配别名，使用默认 URL:', CONFIG.defaultUrl);
        return CONFIG.defaultUrl || 'https://cp.qtdt.qzz.io/api/raw/index';
    }

    async function load() {
        const url = resolveUrl();
        contentEl.innerHTML = `
            <div class="loading-wrap">
                <div class="spinner"></div>
                <p>🌸 正在加载文档…</p>
                <p style="font-size:0.8rem; opacity:0.5; word-break:break-all;">请求：${url}</p>
            </div>
        `;

        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            }
            const markdown = await resp.text();
            const html = marked.parse(markdown, { gfm: true, breaks: true, pedantic: false });
            contentEl.innerHTML = html;
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
            TOC.generate();
            contentEl.querySelectorAll('img').forEach(img => {
                img.addEventListener('load', () => {
                    if (typeof Prism !== 'undefined') Prism.highlightAll();
                });
            });
        } catch (err) {
            console.error('加载失败:', err);
            contentEl.innerHTML = `
                <div class="error-wrap">
                    <h3>🌸 哎呀，加载失败了</h3>
                    <p><strong>请求地址：</strong><span style="word-break:break-all;">${url}</span></p>
                    <p><strong>错误信息：</strong>${err.message || '未知错误'}</p>
                    <p style="font-size:0.85rem; opacity:0.6; margin-top:0.5rem;">
                        ${err.name === 'TypeError' && err.message.includes('Failed to fetch') ?
                        '💡 可能是跨域（CORS）问题或网络不可达，请检查 URL 是否支持跨域或网络连接。' :
                        ''}
                    </p>
                    <button class="retry-btn" onclick="location.reload()">🔄 重试</button>
                </div>
            `;
        }
    }

    return { load, resolveUrl };
})();

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    TOC.init();
    Renderer.load();
    if (window.location.hash) {
        setTimeout(() => {
            const id = window.location.hash.slice(1);
            TOC.scrollToHeading(id);
        }, 600);
    }
});

window.addEventListener('hashchange', function() {
    console.log('🔄 Hash 变化，重新加载');
    Renderer.load();
});

console.log('🌸 Moe Markdown Preview 已加载');
console.log('📋 当前配置:', CONFIG);
console.log('🔑 别名键名:', Object.keys(CONFIG.aliases || {}));
window.__MOE = { CONFIG, TOC, Renderer };