<script setup lang="ts">
const version = __APP_VERSION__;

const features = [
  {
    icon: '📖',
    title: 'README 首页',
    description: '构建时读取仓库 README.md，用 marked 渲染为玻璃阅读页，并支持 Prism 代码高亮。',
  },
  {
    icon: '🫧',
    title: 'Liquid Glass',
    description: '透明、模糊、高光与柔和渐变组成的 iOS Liquid Glass 界面，支持浅色与深色模式。',
  },
  {
    icon: '💬',
    title: 'GitHub Callouts',
    description: '支持 NOTE、TIP、IMPORTANT、WARNING、CAUTION 五种 GitHub Markdown 提示块。',
  },
  {
    icon: '📦',
    title: '双形态交付',
    description: '生产版输出到 dist/server/，Release 版由 Gulp 打包并压缩为单文件 dist/index.html。',
  },
  {
    icon: '🧰',
    title: '配套 Tools',
    description: '内置 JSON 配置编辑器，可视化编辑 config.json 与发布版配置，无需手写格式。',
  },
  {
    icon: '🌗',
    title: '主题记忆',
    description: '自动跟随系统偏好，并记住手动选择的浅色或深色模式，主题色同步到移动端浏览器。',
  },
];

const tags = ['Vue 3', 'Vite', 'TypeScript', 'SCSS', 'marked', 'Prism.js', 'Gulp', 'pnpm'];
</script>

<template>
  <section class="reader glass about-page">
    <div class="reader-bar">
      <div class="reader-title">
        <span class="status-dot"></span>
        <span>about.html</span>
      </div>
      <div class="reader-meta">
        <span>v{{ version }}</span>
        <span class="meta-divider">·</span>
        <span>About</span>
      </div>
    </div>

    <div class="about-body">
      <header class="about-hero">
        <div class="about-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2.8l2.35 6.85L21.2 12l-6.85 2.35L12 21.2l-2.35-6.85L2.8 12l6.85-2.35L12 2.8z" fill="currentColor"/>
          </svg>
        </div>

        <div class="about-intro">
          <p class="about-kicker">ABOUT MOE MARKDOWN</p>
          <h1>萌·Markdown</h1>
          <p class="about-lead">
            一个纯静态的 Markdown 阅读器，把普通 Markdown 变成 iOS Liquid Glass 风格的阅读页面。
            无需后端，构建后即可部署到任意静态托管。
          </p>
          <div class="about-actions">
            <a class="about-button about-button-primary" href="./">返回首页</a>
            <a
              class="about-button"
              href="https://github.com/haoqi75/markdown-viewer-moe"
              target="_blank"
              rel="noopener noreferrer"
            >GitHub 仓库</a>
            <a
              class="about-button"
              href="https://docs.moe520.cc.cd/"
              target="_blank"
              rel="noopener noreferrer"
            >文档站</a>
          </div>
        </div>
      </header>

      <div class="about-grid">
        <article v-for="feature in features" :key="feature.title" class="about-card">
          <span class="about-card-icon" aria-hidden="true">{{ feature.icon }}</span>
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.description }}</p>
        </article>
      </div>

      <section class="about-section">
        <div class="about-section-heading">
          <h2>当前版本</h2>
          <span class="about-version">v{{ version }} · V2 Preview</span>
        </div>
        <p>
          V2 使用 Vite + Vue 3 + TypeScript + SCSS 重写，保留 README 首页、Markdown 排版、
          GitHub Callouts 与代码高亮，并继续提供生产版和单文件 Release 两种交付形态。
        </p>
      </section>

      <section class="about-section">
        <h2>技术栈</h2>
        <div class="about-tags">
          <span v-for="tag in tags" :key="tag">{{ tag }}</span>
        </div>
      </section>

      <p class="about-footnote">
        萌·Markdown 由 AI 参与生成与修复，仅供 Markdown 展示与个人部署使用。
      </p>
    </div>
  </section>
</template>
