import type { MoeConfig } from './types';

const DEFAULT_URL = 'https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/README.md';

function loadConfig(): MoeConfig {
    const cfg: MoeConfig = window.__CONFIG__ ?? {
        defaultUrl: DEFAULT_URL,
        aliases: {},
    };

    const releaseBlock = document.getElementById('release-config');
    if (releaseBlock) {
        try {
            const rel = JSON.parse(releaseBlock.textContent ?? '{}') as Partial<MoeConfig>;
            if (rel.defaultUrl) cfg.defaultUrl = rel.defaultUrl;
            if (rel.aliases && typeof rel.aliases === 'object') {
                cfg.aliases = { ...(cfg.aliases ?? {}), ...rel.aliases };
            }
            if (rel.theme) cfg.theme = rel.theme;
        } catch (error) {
            console.warn('⚠️ release-config JSON 解析失败:', error);
        }
    }

    return cfg;
}

export const CONFIG = loadConfig();
