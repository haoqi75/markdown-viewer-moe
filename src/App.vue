<script setup lang="ts">
import AboutView from './components/AboutView.vue';
import AmbientBackground from './components/AmbientBackground.vue';
import AppDock from './components/AppDock.vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import ReaderView from './components/ReaderView.vue';

const page = document.getElementById('app')?.dataset.page;
const queryPage = new URLSearchParams(window.location.search).get('p')?.toLowerCase();
const isAbout = page === 'about' || queryPage === 'about';
const aboutHref = import.meta.env.MODE === 'release' ? '?p=about' : './about.html';

if (isAbout) {
  document.title = '关于 · 萌·Markdown V2';
}
</script>

<template>
  <div class="app-shell">
    <AmbientBackground />
    <AppHeader :about-href="aboutHref" :about-active="isAbout" />
    <main class="reader-wrap">
      <AboutView v-if="isAbout" />
      <ReaderView v-else />
    </main>
    <AppDock />
    <AppFooter />
  </div>
</template>
