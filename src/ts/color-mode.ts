type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'moe:color-mode';
let lightThemeColor: string | null = null;

function readSavedMode(): ColorMode {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') return saved;
    } catch {
        // localStorage 不可用时使用浅色模式
    }
    return 'light';
}

function getCurrentMode(): ColorMode {
    return document.documentElement.getAttribute('data-color-mode') === 'dark' ? 'dark' : 'light';
}

function updateButtons(mode: ColorMode): void {
    const isDark = mode === 'dark';
    const label = isDark ? '切换到浅色模式' : '切换到深色模式';

    document.querySelectorAll<HTMLButtonElement>('[data-color-mode-toggle]').forEach((button) => {
        button.setAttribute('aria-pressed', String(isDark));
        button.setAttribute('aria-label', label);
        button.title = label;

        const text = button.querySelector<HTMLElement>('[data-color-mode-label]');
        if (text) {
            text.textContent = isDark ? '浅色模式' : '深色模式';
        }
    });
}

function updateThemeMeta(mode: ColorMode): void {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;

    if (mode === 'dark') {
        const darkBg = getComputedStyle(document.documentElement).getPropertyValue('--moe-bg').trim();
        if (darkBg) meta.content = darkBg;
    } else if (lightThemeColor) {
        meta.content = lightThemeColor;
    }
}

function applyMode(mode: ColorMode, persist = false): void {
    document.documentElement.setAttribute('data-color-mode', mode);
    updateButtons(mode);
    updateThemeMeta(mode);

    if (persist) {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // 隐私模式 / 禁用 storage 时忽略
        }
    }
}

export function setupColorMode(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-color-mode-toggle]');
    if (buttons.length === 0) return;

    lightThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content ?? null;
    applyMode(getCurrentMode());

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            applyMode(getCurrentMode() === 'dark' ? 'light' : 'dark', true);
        });
    });
}

// 尽早应用，避免页面先闪一下浅色主题
applyMode(readSavedMode());
