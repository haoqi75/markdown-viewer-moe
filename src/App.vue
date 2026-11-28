<script setup lang="ts">
import AmbientBackground from './components/AmbientBackground.vue';
import AppDock from './components/AppDock.vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import ReaderView from './components/ReaderView.vue';
</script>

<template>
  <div class="app-shell">
    <AmbientBackground />
    <AppHeader />
    <main class="reader-wrap">
      <ReaderView />
    </main>
    <AppDock />
    <AppFooter />
  </div>
</template>
