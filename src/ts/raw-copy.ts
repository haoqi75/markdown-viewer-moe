import { CONFIG } from './config';
import { resolveUrl } from './router';

let toastTimer: number | null = null;

function isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
}

export function getCurrentRawUrl(): string | null {
    const url = resolveUrl();
    return isHttpUrl(url) ? url : null;
}

export function refreshRawCopyVisibility(url: string = resolveUrl()): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-raw-copy]');
    const visible = CONFIG.showRawCopyButton !== false && isHttpUrl(url);

    buttons.forEach((button) => {
        button.hidden = !visible;
    });
}

function showCopyToast(message: string, success: boolean): void {
    let toast = document.getElementById('raw-copy-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'raw-copy-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    const toastEl = toast as HTMLElement;
    toastEl.className = `raw-copy-toast${success ? '' : ' error'}`;
    toastEl.textContent = message;
    requestAnimationFrame(() => toastEl.classList.add('show'));

    if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(() => {
        toastEl.classList.remove('show');
    }, 1800);
}

async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // 继续尝试兼容回退方案
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        return copied;
    } catch {
        return false;
    }
}

async function copyCurrentRawUrl(button: HTMLButtonElement): Promise<void> {
    const url = getCurrentRawUrl();
    if (!url) {
        showCopyToast('当前页面没有可复制的 RAW 链接', false);
        return;
    }

    const copied = await copyText(url);
    showCopyToast(copied ? '已复制当前文档 RAW 链接' : '复制失败，请手动复制', copied);

    if (copied) {
        button.classList.add('copied');
        window.setTimeout(() => button.classList.remove('copied'), 1200);
    }
}

export function setupRawCopyButton(): void {
    document.querySelectorAll<HTMLButtonElement>('[data-raw-copy]').forEach((button) => {
        button.addEventListener('click', () => {
            void copyCurrentRawUrl(button);
        });
    });

    refreshRawCopyVisibility();
}
