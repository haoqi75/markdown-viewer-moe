// ============================================================
// 配置加载（由构建工具注入 __CONFIG__）
// ============================================================
const CONFIG = window.__CONFIG__ || {
    defaultUrl: 'https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/README.md',
    aliases: {}
};

// 禁止浏览器自动恢复滚动位置，避免与 #heading 导航冲突
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ============================================================
// 初始化：设置自定义标题
// ============================================================

if (CONFIG.title) {
    document.title = CONFIG.title;
}

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
    let _scrollSpyObserver = null;
    let _scrollSpyActiveAt = 0;

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
                let base = el.textContent.trim().slice(0, 50)
                    .replace(/[^a-zA-Z\u4e00-\u9fa5\d\-_]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '')
                    .toLowerCase();
                if (!base) base = 'section';
                id = base;
                var n = 1;
                while (document.getElementById(id)) {
                    id = base + '-' + (n++);
                }
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

    function scrollToHeading(id, pushState) {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        el.style.transition = 'background 0.3s';
        el.style.background = 'rgba(255,107,157,0.12)';
        el.style.borderRadius = '6px';
        el.style.padding = '0 0.4rem';
        setTimeout(function() {
            el.style.background = 'transparent';
            el.style.padding = '0';
        }, 1200);
        if (pushState !== false) {
            history.pushState(null, null, '#' + id);
        }
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

    function startScrollSpy() {
        if (_scrollSpyObserver) {
            _scrollSpyObserver.disconnect();
        }
        _scrollSpyActiveAt = Date.now();
        var hds = headings;
        if (!hds.length) return;

        _scrollSpyObserver = new IntersectionObserver(function(entries) {
            // 启动后 2 秒内不更新 hash，等待初始 hash 滚动完成
            if (Date.now() - _scrollSpyActiveAt < 2000) return;
            var candidates = [];
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    candidates.push({ id: entry.target.id, ratio: entry.intersectionRatio });
                }
            });
            if (candidates.length > 0) {
                candidates.sort(function(a, b) { return b.ratio - a.ratio; });
                var activeId = candidates[0].id;
                if (activeId && window.location.hash !== '#' + activeId) {
                    history.replaceState(null, null, '#' + activeId);
                }
            }
        }, { rootMargin: '-80px 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

        hds.forEach(function(h) { _scrollSpyObserver.observe(h.element); });
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
        init: init,
        generate: generate,
        scrollToHeading: scrollToHeading,
        open: open,
        close: close,
        toggle: toggle,
        getHeadings: function() { return headings; },
        startScrollSpy: startScrollSpy,
    };
})();

// ============================================================
// 渲染引擎
// ============================================================
const Renderer = (function() {
    var contentEl = document.getElementById('content');

    function resolveUrl() {
        var params = new URLSearchParams(window.location.search);

        // 1. 优先使用 ?md= 直接指定 Markdown 地址
        var mdParam = params.get('md');
        if (mdParam) return mdParam;

        // 2. 使用 ?p= 查询别名
        var pParam = params.get('p');
        if (pParam && CONFIG.aliases && typeof CONFIG.aliases === 'object') {
            var lowerP = pParam.toLowerCase();
            var keys = Object.keys(CONFIG.aliases);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].toLowerCase() === lowerP) {
                    console.log('✅ 匹配到别名 "' + keys[i] + '" -> ' + CONFIG.aliases[keys[i]]);
                    return CONFIG.aliases[keys[i]];
                }
            }
            console.log('⚠️ 未匹配到别名: ' + pParam);
        }

        // 3. 回退到默认 URL
        return CONFIG.defaultUrl || 'https://cp.qtdt.qzz.io/api/raw/index';
    }

    function interceptAnchors() {
        contentEl.querySelectorAll('a[href^="#"]').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var id = a.getAttribute('href').slice(1);
                if (id && document.getElementById(id)) {
                    e.preventDefault();
                    TOC.scrollToHeading(id, true);
                }
            });
        });
    }

    function replaceBrokenImg(img) {
        var alt = img.getAttribute('alt') || '';
        var span = document.createElement('span');
        span.className = 'img-error';
        span.setAttribute('role', 'img');
        if (alt) span.setAttribute('aria-label', alt);
        var iconHtml = CONFIG.errorMascot
            ? '<img class="img-error-mascot" src="' + CONFIG.errorMascot + '" alt="">'
            : '<span class="img-error-icon">🖼️</span>';
        span.innerHTML = iconHtml + '<span class="img-error-text">哎呀，图片加载失败了</span>';
        if (img.parentNode) {
            img.parentNode.replaceChild(span, img);
        }
    }

    async function load() {
        var url = resolveUrl();
        contentEl.innerHTML =
            '<div class="loading-wrap">' +
                '<div class="spinner"></div>' +
                '<p>🌸 正在加载文档…</p>' +
                '<p style="font-size:0.8rem; opacity:0.5; word-break:break-all;">请求：' + url + '</p>' +
            '</div>';

        try {
            var resp = await fetch(url);
            if (!resp.ok) {
                throw new Error('HTTP ' + resp.status + ' ' + resp.statusText);
            }
            var markdown = await resp.text();
            var html = marked.parse(markdown, { gfm: true, breaks: true, pedantic: false });
            contentEl.innerHTML = html;

            // 修正相对路径图片和链接
            contentEl.querySelectorAll('img[src]').forEach(function(img) {
                var src = img.getAttribute('src');
                if (src && !/^https?:\/\//i.test(src) && !src.startsWith('data:')) {
                    try { img.src = new URL(src, url).href; } catch(e) {}
                }
            });
            contentEl.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.getAttribute('href');
                if (href && !/^https?:\/\//i.test(href) && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                    try { a.href = new URL(href, url).href; } catch(e) {}
                }
            });

            // 加载失败的图片替换为 moe 占位提示
            contentEl.querySelectorAll('img').forEach(function(img) {
                if (img.complete && img.naturalWidth === 0 && img.naturalHeight === 0 && img.src) {
                    replaceBrokenImg(img);
                } else {
                    img.addEventListener('error', function() {
                        replaceBrokenImg(img);
                    });
                }
            });

            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }

            TOC.generate();
            interceptAnchors();

            contentEl.querySelectorAll('img').forEach(function(img) {
                img.addEventListener('load', function() {
                    if (typeof Prism !== 'undefined') Prism.highlightAll();
                });
            });

            // 初次加载后，跳到 URL 中已有 #heading
            if (window.location.hash) {
                var headingId = window.location.hash.slice(1);
                try { headingId = decodeURIComponent(headingId); } catch(e) {}
                var _hashScrolled = false;

                function scrollToHash() {
                    var el = document.getElementById(headingId);
                    if (!el) return false;
                    var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: top });
                    el.style.transition = 'background 0.3s';
                    el.style.background = 'rgba(255,107,157,0.12)';
                    el.style.borderRadius = '6px';
                    el.style.padding = '0 0.4rem';
                    setTimeout(function() {
                        el.style.background = 'transparent';
                        el.style.padding = '0';
                    }, 1200);
                    return true;
                }

                function afterLayout(fn) {
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            setTimeout(fn, 150);
                        });
                    });
                }

                function doScrollThenSpy() {
                    if (_hashScrolled) return;
                    if (scrollToHash()) {
                        _hashScrolled = true;
                    }
                    setTimeout(function() { TOC.startScrollSpy(); }, 800);
                }

                var imgs = contentEl.querySelectorAll('img');
                if (imgs.length === 0) {
                    afterLayout(doScrollThenSpy);
                } else {
                    var pending = imgs.length;
                    function onImgDone() {
                        pending--;
                        if (pending <= 0) afterLayout(doScrollThenSpy);
                    }
                    imgs.forEach(function(img) {
                        if (img.complete) { onImgDone(); }
                        else {
                            img.addEventListener('load', onImgDone, { once: true });
                            img.addEventListener('error', onImgDone, { once: true });
                        }
                    });
                    setTimeout(function() {
                        if (pending > 0) { pending = 0; afterLayout(doScrollThenSpy); }
                    }, 5000);
                }
            } else {
                TOC.startScrollSpy();
            }
        } catch (err) {
            console.error('加载失败:', err);
            var statusCode = '';
            var statusMsg = '';
            var m = err.message && err.message.match(/HTTP\s*(\d+)/);
            if (m) {
                statusCode = m[1];
                var messages = {
                    '400': '请求无效',
                    '401': '需要身份验证',
                    '403': '禁止访问',
                    '404': '页面未找到',
                    '408': '请求超时',
                    '429': '请求过于频繁',
                    '500': '服务器内部错误',
                    '502': '网关错误',
                    '503': '服务不可用',
                    '504': '网关超时'
                };
                statusMsg = messages[statusCode] || ('服务器错误');
            }
            var mascotHtml = '';
            if (CONFIG.errorMascot) {
                mascotHtml = '<img class="error-mascot-img" src="' + CONFIG.errorMascot + '" alt="Error Mascot">';
            } else {
                mascotHtml = '<span class="error-mascot-text">🌸</span>';
            }
            contentEl.innerHTML =
                '<div class="error-wrap">' +
                    '<div class="error-mascot">' + mascotHtml + '</div>' +
                    (statusCode ? '<p class="error-code">' + statusCode + '</p>' : '') +
                    (statusMsg ? '<p class="error-msg">' + statusMsg + '</p>' : '<p class="error-msg">🌸 哎呀，加载失败了</p>') +
                    '<p class="error-detail"><strong>请求地址：</strong><span style="word-break:break-all;">' + url + '</span></p>' +
                    '<p class="error-detail"><strong>原始信息：</strong>' + (err.message || '未知错误') + '</p>' +
                    '<p style="font-size:0.85rem; opacity:0.6; margin-top:0.5rem;">' +
                        (err.name === 'TypeError' && err.message && err.message.indexOf('Failed to fetch') >= 0 ?
                        '💡 可能是跨域（CORS）问题或网络不可达' : '') +
                    '</p>' +
                    '<button class="retry-btn" onclick="location.reload()">🔄 重试</button>' +
                '</div>';
        }
    }

    return { load: load, resolveUrl: resolveUrl };
})();

// ============================================================
// hashchange 处理：区分锚点导航与页面切换
// ============================================================
window.addEventListener('hashchange', function() {
    // 如果 hash 非空且页面中有对应 id，仅滚动不重载
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
        var id = hash.slice(1);
        var target = document.getElementById(id);
        if (target) {
            TOC.scrollToHeading(id, false);
            return;
        }
    }

    // 如果 ?p= 参数变化了（通过 history.pushState 触发的 hashchange 不会走到这里
    // 因为上面已经 return 了），或者 hash 为空时查询参数变化，才重新加载
    Renderer.load();
});

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    TOC.init();

    var logoEl = document.querySelector('.logo');
    var subEl = document.querySelector('.logo-sub');
    if (logoEl && CONFIG.logo && CONFIG.logo.text) {
        logoEl.textContent = CONFIG.logo.text;
    }
    if (subEl && CONFIG.logo && CONFIG.logo.sub) {
        subEl.textContent = CONFIG.logo.sub;
    }

    var footerEl = document.getElementById('footer');
    if (footerEl && CONFIG.footer) {
        footerEl.innerHTML = marked.parse(CONFIG.footer);
    }

    var mascotImg = document.getElementById('mascot-img');
    if (mascotImg && CONFIG.mascot) {
        if (!mascotImg.src.startsWith('data:')) {
            mascotImg.src = CONFIG.mascot;
        }
        mascotImg.style.cursor = 'pointer';
        mascotImg.title = '回到顶部';
        mascotImg.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    Renderer.load();
});

console.log('🌸 Moe Markdown Preview 已加载');
console.log('📋 当前配置:', CONFIG);
console.log('🔑 别名键名:', Object.keys(CONFIG.aliases || {}));
window.__MOE = { CONFIG: CONFIG, TOC: TOC, Renderer: Renderer };
