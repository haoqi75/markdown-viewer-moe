import { CONFIG } from './config';
import { compareVersions } from './version';

const REPO = 'haoqi75/markdown-viewer-moe';
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FAILURE_TTL_MS = 60 * 1000;

interface GitHubRelease {
    tag_name?: string;
    html_url?: string;
}

type FailureReason = 'rate-limit' | 'not-found' | 'network' | 'invalid';

interface CachedResult {
    at: number;
    ok: boolean;
    latest?: string;
    url?: string;
    reason?: FailureReason;
    message?: string;
}

class UpdateError extends Error {
    readonly reason: FailureReason;

    constructor(reason: FailureReason, message: string) {
        super(message);
        this.name = 'UpdateError';
        this.reason = reason;
    }
}

function currentVersion(): string {
    return (CONFIG.version || '').replace(/^v/i, '');
}

function cacheKey(): string {
    return `moe:update-check:${currentVersion() || 'dev'}`;
}

function readCache(): CachedResult | null {
    try {
        const raw = sessionStorage.getItem(cacheKey());
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedResult;
        if (typeof parsed.at !== 'number' || typeof parsed.ok !== 'boolean') return null;
        return parsed;
    } catch {
        return null;
    }
}

function writeCache(result: CachedResult): void {
    try {
        sessionStorage.setItem(cacheKey(), JSON.stringify(result));
    } catch {
        // 隐私模式 / file:// 下可能不可用，忽略即可
    }
}

function setStatus(
    statusEl: HTMLElement,
    text: string,
    tone: 'info' | 'success' | 'warning' | 'error',
    link?: { href: string; label: string }
): void {
    statusEl.className = `about-update-status is-${tone}`;
    statusEl.textContent = text;

    if (link) {
        statusEl.appendChild(document.createTextNode(' '));
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.textContent = link.label;
        statusEl.appendChild(anchor);
    }
}

function renderVersionResult(
    statusEl: HTMLElement,
    latest: string,
    url: string,
    cached = false
): void {
    const current = currentVersion();
    const suffix = cached ? '（缓存结果）' : '';

    if (!current) {
        setStatus(statusEl, `无法读取当前版本；最新 Release 为 ${latest}${suffix}`, 'info', {
            href: url,
            label: '查看 Releases',
        });
        return;
    }

    const comparison = compareVersions(latest, current);
    if (comparison === null) {
        setStatus(statusEl, `版本格式无法比较（当前 v${current}，最新 ${latest}）${suffix}`, 'warning', {
            href: url,
            label: '前往 Releases',
        });
        return;
    }

    if (comparison > 0) {
        setStatus(statusEl, `发现新版本 ${latest}（当前 v${current}）${suffix}`, 'success', {
            href: url,
            label: '查看更新',
        });
    } else if (comparison === 0) {
        setStatus(statusEl, `已是最新版本 v${current}${suffix}`, 'success');
    } else {
        setStatus(statusEl, `当前 v${current} 比最新 Release ${latest} 更新${suffix}`, 'info');
    }
}

function renderFailure(statusEl: HTMLElement, reason: FailureReason, message: string): void {
    if (reason === 'rate-limit') {
        setStatus(statusEl, `GitHub API 请求受限：${message}`, 'warning', {
            href: RELEASES_URL,
            label: '直接打开 Releases',
        });
        return;
    }

    if (reason === 'not-found') {
        setStatus(statusEl, '仓库暂时没有可用的 Release', 'warning', {
            href: RELEASES_URL,
            label: '打开 Releases 页面',
        });
        return;
    }

    setStatus(statusEl, `检查更新失败：${message}`, 'error', {
        href: RELEASES_URL,
        label: '前往 Releases 查看',
    });
}

async function fetchLatestRelease(): Promise<{ latest: string; url: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(API_URL, {
            headers: { Accept: 'application/vnd.github+json' },
            signal: controller.signal,
        });

        if (response.status === 403 || response.status === 429) {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            throw new UpdateError(
                'rate-limit',
                remaining === '0'
                    ? '未认证请求每小时最多 60 次'
                    : `GitHub API 返回 ${response.status}`
            );
        }

        if (response.status === 404) {
            throw new UpdateError('not-found', 'GitHub Release 不存在');
        }

        if (!response.ok) {
            throw new UpdateError('network', `GitHub API 返回 ${response.status}`);
        }

        const data = (await response.json()) as GitHubRelease;
        if (!data.tag_name) {
            throw new UpdateError('invalid', 'GitHub API 返回数据缺少 tag_name');
        }

        return {
            latest: data.tag_name,
            url: data.html_url || RELEASES_URL,
        };
    } catch (error) {
        if (error instanceof UpdateError) throw error;
        if ((error as Error).name === 'AbortError') {
            throw new UpdateError('network', '请求超时');
        }
        throw new UpdateError('network', (error as Error).message || '网络请求失败');
    } finally {
        clearTimeout(timer);
    }
}

export async function checkForUpdate(button: HTMLButtonElement, statusEl: HTMLElement): Promise<void> {
    const cached = readCache();
    const now = Date.now();

    if (cached && cached.ok && cached.latest) {
        if (now - cached.at < CACHE_TTL_MS) {
            renderVersionResult(statusEl, cached.latest, cached.url || RELEASES_URL, true);
            return;
        }
    }

    if (cached && !cached.ok && now - cached.at < FAILURE_TTL_MS) {
        renderFailure(statusEl, cached.reason || 'network', cached.message || '请稍后重试');
        return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ 检查中…';
    setStatus(statusEl, '正在向 GitHub 查询最新 Release…', 'info');

    try {
        const result = await fetchLatestRelease();
        renderVersionResult(statusEl, result.latest, result.url);
        writeCache({
            at: Date.now(),
            ok: true,
            latest: result.latest,
            url: result.url,
        });
    } catch (error) {
        const updateError = error instanceof UpdateError
            ? error
            : new UpdateError('network', '未知错误');

        renderFailure(statusEl, updateError.reason, updateError.message);
        writeCache({
            at: Date.now(),
            ok: false,
            reason: updateError.reason,
            message: updateError.message,
        });
    } finally {
        button.disabled = false;
        button.textContent = originalText || '🔄 检查更新';
    }
}

export function setupUpdateChecker(): void {
    const button = document.getElementById('about-check-update') as HTMLButtonElement | null;
    const statusEl = document.getElementById('about-update-status');
    if (!button || !statusEl) return;

    button.addEventListener('click', () => {
        void checkForUpdate(button, statusEl);
    });
}
