<script setup lang="ts">
const version = __APP_VERSION__;
</script>

<template>
  <div class="moe-deco" aria-hidden="true">🌸</div>
  <div class="moe-deco" aria-hidden="true">✨</div>

  <main class="card">
    <div class="header">
      <div class="header-left">
        <span class="logo">📝 萌·Markdown</span>
        <span class="logo-sub">v2 preview</span>
      </div>
      <a
        class="github-link"
        href="https://github.com/haoqi75/markdown-viewer-moe"
        target="_blank"
        rel="noopener"
        title="GitHub 仓库"
        aria-label="GitHub 仓库"
      >
        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
    </div>

    <div id="content">
      <h1>V2 Preview</h1>
      <p class="v2-lead">
        基于 <strong>Vite + Vue 3</strong> 的新版查看器骨架已经就绪。
        现有功能和界面会分批迁移到 Vue 组件。
      </p>

      <div class="v2-grid">
        <div class="v2-item">
          <b>生产构建</b>
          <span>多文件输出到 <code>dist/server/</code></span>
        </div>
        <div class="v2-item">
          <b>Release 构建</b>
          <span>Vite 构建后由 Gulp 打包为 <code>dist/index.release.html</code></span>
        </div>
        <div class="v2-item">
          <b>当前阶段</b>
          <span>构建骨架与入口已建立，功能迁移进行中</span>
        </div>
      </div>

      <p class="v2-version">主项目版本：v{{ version }}</p>
    </div>
  </main>
</template>

<style scoped>
.v2-lead {
  margin: 0.8rem 0 1.2rem;
  color: var(--moe-text-light);
  font-size: 1rem;
  line-height: 1.8;
}

.v2-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.8rem;
  margin: 1.2rem 0;
}

.v2-item {
  padding: 1rem;
  border: 1px solid rgba(var(--moe-pink-rgb), 0.14);
  border-radius: var(--moe-radius-sm);
  background: rgba(var(--moe-pink-rgb), 0.06);
}

.v2-item b {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--moe-pink-dark);
}

.v2-item span {
  color: var(--moe-text-light);
  font-size: 0.85rem;
  line-height: 1.6;
}

.v2-version {
  margin-top: 1.5rem;
  opacity: 0.65;
  font-size: 0.8rem;
}
</style>
