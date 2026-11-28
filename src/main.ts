import { createApp } from 'vue';
import App from './App.vue';
import './style.scss';

let savedTheme: string | null = null;
try {
  savedTheme = localStorage.getItem('moe:v2-theme');
} catch {
  // localStorage 不可用时使用系统偏好
}

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
if (themeMeta) {
  themeMeta.content = isDark ? '#08080c' : '#f4f1ff';
}

createApp(App).mount('#app');
