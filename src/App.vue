<script setup lang="ts">
import { ref, watch } from 'vue';

const version = __APP_VERSION__;
const isDark = ref(document.documentElement.dataset.theme === 'dark');

function toggleTheme(): void {
  isDark.value = !isDark.value;
}

watch(isDark, (dark) => {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';

  try {
    localStorage.setItem('moe:v2-theme', dark ? 'dark' : 'light');
  } catch {
    // localStorage 不可用时忽略
  }

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = dark ? '#08080c' : '#f4f1ff';
  }
});
</script>

<template>
  <div class="app-shell">
    <div class="ambient" aria-hidden="true">
      <span class="ambient-orb orb-pink"></span>
      <span class="ambient-orb orb-purple"></span>
      <span class="ambient-orb orb-blue"></span>
    </div>

    <header class="topbar glass">
      <a class="brand" href="./" aria-label="萌·Markdown V2 首页">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2.8l2.35 6.85L21.2 12l-6.85 2.35L12 21.2l-2.35-6.85L2.8 12l6.85-2.35L12 2.8z" fill="currentColor"/>
          </svg>
        </span>
        <span class="brand-copy">
          <strong>萌·Markdown</strong>
          <small>V2 · Liquid Glass</small>
        </span>
      </a>

      <div class="topbar-actions">
        <span class="version-pill">v{{ version }}</span>
        <button
          type="button"
          class="icon-button"
          :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="toggleTheme"
        >
          <svg v-if="!isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>
          </svg>
        </button>
        <a
          class="icon-button"
          href="https://github.com/haoqi75/markdown-viewer-moe"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub 仓库"
          aria-label="GitHub 仓库"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </header>

    <main>
      <section class="hero glass">
        <div class="hero-copy">
          <div class="eyebrow">
            <span class="status-dot"></span>
            V2 重构进行中
          </div>
          <h1>
            让 Markdown<br />
            <span class="gradient-text">闪耀如玻璃</span>
          </h1>
          <p>
            全新 iOS 玻璃透明视觉，基于 Vite + Vue 3 打造。
            清爽、轻盈、有层次，同时保留萌系温度。
          </p>

          <div class="hero-actions">
            <a
              class="primary-button"
              href="https://github.com/haoqi75/markdown-viewer-moe"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              查看 GitHub
            </a>
            <a
              class="secondary-button"
              href="https://docs.moe520.cc.cd/"
              target="_blank"
              rel="noopener noreferrer"
            >
              阅读文档
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </a>
          </div>

          <div class="hero-meta">
            <span>Vite 6</span>
            <span>Vue 3</span>
            <span>Glass UI</span>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="preview-window">
            <div class="window-bar">
              <span class="window-dots"><i></i><i></i><i></i></span>
              <span class="window-title">README.md</span>
            </div>
            <div class="preview-body">
              <span class="preview-kicker">MOE MARKDOWN</span>
              <strong>Hello,<br />beautiful reader.</strong>
              <div class="preview-lines">
                <span class="line line-1"></span>
                <span class="line line-2"></span>
                <span class="line line-3"></span>
              </div>
              <div class="preview-code">
                <span class="code-dot"></span>
                <span>v2.0.0-rc.0</span>
              </div>
            </div>
          </div>
          <div class="floating-card floating-a">
            <span class="floating-icon">◇</span>
            Liquid Glass
          </div>
          <div class="floating-card floating-b">
            <span class="status-dot"></span>
            Preview
          </div>
        </div>
      </section>

      <section class="feature-grid" aria-label="V2 特性">
        <article class="feature-card glass">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
              <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>
            </svg>
          </span>
          <h2>玻璃材质</h2>
          <p>多层透明、模糊与高光反射，模拟 iOS 新版 Liquid Glass 质感。</p>
        </article>

        <article class="feature-card glass">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/>
            </svg>
          </span>
          <h2>Vite + Vue</h2>
          <p>更快的开发服务器与更清晰的组件结构，为后续功能迁移打基础。</p>
        </article>

        <article class="feature-card glass">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7l8-4 8 4-8 4-8-4z"/>
              <path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>
            </svg>
          </span>
          <h2>双形态构建</h2>
          <p>生产版多文件输出到 <code>dist/server/</code>，Release 版打包为单文件 HTML。</p>
        </article>
      </section>
    </main>

    <nav class="dock glass" aria-label="快捷链接">
      <a href="https://moe520.cc.cd/" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 11l9-8 9 8"/>
          <path d="M5 10v10h14V10"/>
        </svg>
        <span>主站</span>
      </a>
      <a href="https://moe520.cc.cd/tools.html" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6 2.4-2.4z"/>
        </svg>
        <span>Tools</span>
      </a>
      <a href="https://docs.moe520.cc.cd/" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z"/>
          <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>
        </svg>
        <span>Docs</span>
      </a>
      <a href="https://github.com/haoqi75/markdown-viewer-moe" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>GitHub</span>
      </a>
    </nav>

    <footer class="footer">
      <span>萌·Markdown V2 Preview</span>
      <span>Built with Vite + Vue 3</span>
    </footer>
  </div>
</template>
