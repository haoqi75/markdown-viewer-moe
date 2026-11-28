<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const version = __APP_VERSION__;
const { isDark, toggleTheme } = useTheme();
</script>

<template>
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
</template>
