<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useReadme } from '../composables/useReadme';
import { highlightMarkdown } from '../utils/prism';

const version = __APP_VERSION__;
const { html: readmeHtml } = useReadme();
const articleRef = ref<HTMLElement | null>(null);

onMounted(() => {
  nextTick(() => {
    if (articleRef.value) {
      highlightMarkdown(articleRef.value);
    }
  });
});
</script>

<template>
  <section class="reader glass">
    <div class="reader-bar">
      <div class="reader-title">
        <span class="status-dot"></span>
        <span>README.md</span>
      </div>
      <div class="reader-meta">
        <span>v{{ version }}</span>
        <span class="meta-divider">·</span>
        <span>Markdown</span>
      </div>
    </div>
    <article ref="articleRef" class="markdown-body" v-html="readmeHtml"></article>
  </section>
</template>
