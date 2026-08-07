/**
 * utils.js
 * Common Utility Functions
 */

/* --------------------------
 * Delay
 * -------------------------- */

export function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* --------------------------
 * Debounce
 * -------------------------- */

export function debounce(fn, delay = 300) {

    let timer = null;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, delay);

    };

}

/* --------------------------
 * Throttle
 * -------------------------- */

export function throttle(fn, delay = 200) {

    let locked = false;

    return (...args) => {

        if (locked) return;

        locked = true;

        fn(...args);

        setTimeout(() => {
            locked = false;
        }, delay);

    };

}

/* --------------------------
 * Copy Text
 * -------------------------- */

export async function copy(text) {

    try {

        await navigator.clipboard.writeText(text);

        return true;

    } catch {

        return false;

    }

}

/* --------------------------
 * Open URL
 * -------------------------- */

export function open(url) {

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}

/* --------------------------
 * File Extension
 * -------------------------- */

export function getExtension(filename = "") {

    const index =
        filename.lastIndexOf(".");

    if (index === -1)
        return "";

    return filename
        .substring(index + 1)
        .toLowerCase();

}

/* --------------------------
 * Escape HTML
 * -------------------------- */

export function escapeHTML(text = "") {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");

}

/* --------------------------
 * Download Filename
 * -------------------------- */

export function guessPlatform(filename = "") {

    const file =
        filename.toLowerCase();

    if (
        file.endsWith(".exe") ||
        file.endsWith(".msi")
    )
        return "Windows";

    if (
        file.endsWith(".dmg") ||
        file.endsWith(".pkg")
    )
        return "macOS";

    if (
        file.endsWith(".deb") ||
        file.endsWith(".rpm") ||
        file.endsWith(".appimage")
    )
        return "Linux";

    if (
        file.endsWith(".apk")
    )
        return "Android";

    if (
        file.endsWith(".ipa")
    )
        return "iOS";

    return "Unknown";

}

/* --------------------------
 * Bytes
 * -------------------------- */

export function formatBytes(bytes = 0) {

    if (bytes <= 0)
        return "0 B";

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    let value = bytes;
    let unit = 0;

    while (
        value >= 1024 &&
        unit < units.length - 1
    ) {

        value /= 1024;
        unit++;

    }

    return `${value.toFixed(
        value >= 100 ? 0 : 1
    )} ${units[unit]}`;

}

/* --------------------------
 * Date
 * -------------------------- */

export function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

}

/* --------------------------
 * Time Ago
 * -------------------------- */

export function timeAgo(date) {

    const now = Date.now();

    const target =
        new Date(date).getTime();

    const seconds =
        Math.floor((now - target) / 1000);

    if (seconds < 60)
        return `${seconds}s ago`;

    if (seconds < 3600)
        return `${Math.floor(seconds / 60)}m ago`;

    if (seconds < 86400)
        return `${Math.floor(seconds / 3600)}h ago`;

    if (seconds < 604800)
        return `${Math.floor(seconds / 86400)}d ago`;

    return formatDate(date);

}

/* --------------------------
 * Safe JSON
 * -------------------------- */

export function safeJSON(text) {

    try {

        return JSON.parse(text);

    } catch {

        return null;

    }

}

/* --------------------------
 * Random ID
 * -------------------------- */

export function randomID(length = 8) {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {

        result += chars[
            Math.floor(
                Math.random() * chars.length
            )
        ];

    }

    return result;

}

/* --------------------------
 * is Mobile
 * -------------------------- */

export function isMobile() {

    return window.matchMedia(
        "(max-width:768px)"
    ).matches;

}

/* --------------------------
 * Scroll Top
 * -------------------------- */

export function scrollTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* --------------------------
 * GitHub Release URL
 * -------------------------- */

export function releaseURL(owner, repo) {

    return `https://github.com/${owner}/${repo}/releases/latest`;

}

/* --------------------------
 * GitHub Repository URL
 * -------------------------- */

export function repositoryURL(owner, repo) {

    return `https://github.com/${owner}/${repo}`;

}

/* --------------------------
 * Build Download URL
 * -------------------------- */

export function buildDownloadURL(
    config,
    release,
    asset
) {

    const index = Number(
        localStorage.getItem("download-source")
        ?? config.defaultSource
    );

    const source =
        config.downloadSources[index]
        ?? config.downloadSources[0];

    return source.base
        .replace("{tag}", release.tag)
        + asset.name;

}

/* --------------------------
 * Export
 * -------------------------- */

export default {

    sleep,

    debounce,

    throttle,

    copy,

    open,

    getExtension,

    escapeHTML,

    guessPlatform,

    formatBytes,

    formatDate,

    timeAgo,

    safeJSON,

    randomID,

    isMobile,

    scrollTop,

    releaseURL,

    repositoryURL,

    buildDownloadURL

};