import { CONFIG } from './config';

export const ABOUT_PAGE = '__ABOUT_PAGE__';
export const ALIAS_NOT_FOUND = '__ALIAS_NOT_FOUND__';
export const MD_DECODE_FAILED = '__MD_DECODE_FAILED__';

const DEFAULT_FALLBACK = 'https://cp.qtdt.qzz.io/api/raw/index';

function decodeBase64(value: string): string | null {
    try {
        return atob(value);
    } catch {
        try {
            const padded = value + '==='.slice(0, (4 - value.length % 4) % 4);
            return atob(padded);
        } catch {
            return null;
        }
    }
}

export function resolveUrl(): string {
    const params = new URLSearchParams(window.location.search);

    // 1. 优先使用 ?md= base64 编码的 Markdown 地址
    const mdParam = params.get('md');
    if (mdParam) {
        const decoded = decodeBase64(mdParam);
        if (decoded && /^https?:\/\//.test(decoded)) {
            return decoded;
        }
        return MD_DECODE_FAILED;
    }

    // 2. 使用 ?p= 查询别名
    const pParam = params.get('p');
    if (pParam) {
        // 内置关于页：优先于 aliases，保证 /?p=about 始终可用
        if (pParam.toLowerCase() === 'about') {
            return ABOUT_PAGE;
        }

        const aliases = CONFIG.aliases ?? {};
        const lowerP = pParam.toLowerCase();
        for (const key of Object.keys(aliases)) {
            if (key.toLowerCase() === lowerP) {
                console.log(`✅ 匹配到别名 "${key}" -> ${aliases[key]}`);
                return aliases[key];
            }
        }
        return ALIAS_NOT_FOUND;
    }

    // 3. 回退到默认 URL
    return CONFIG.defaultUrl || DEFAULT_FALLBACK;
}
