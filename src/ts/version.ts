export type ParsedVersion = [number, number, number];

export function parseVersion(value: string): ParsedVersion | null {
    const normalized = value.trim().replace(/^v/i, '').split(/[+-]/)[0];
    const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * 返回 1 表示 a > b，-1 表示 a < b，0 表示相等，null 表示无法解析。
 */
export function compareVersions(a: string, b: string): number | null {
    const left = parseVersion(a);
    const right = parseVersion(b);
    if (!left || !right) return null;

    for (let i = 0; i < 3; i += 1) {
        if (left[i] !== right[i]) {
            return left[i] > right[i] ? 1 : -1;
        }
    }
    return 0;
}
