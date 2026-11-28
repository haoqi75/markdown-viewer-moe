import { ref, watch } from 'vue';

export function useTheme() {
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

  return {
    isDark,
    toggleTheme,
  };
}
