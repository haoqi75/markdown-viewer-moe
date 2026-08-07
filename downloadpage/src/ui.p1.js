import { marked } from "marked";
import {
    formatDate,
    formatSize,
    timeAgo
} from "./api.js";
import { buildDownloadURL } from "./utils.js";

/* ------------------------------
 * DOM Helpers
 * ------------------------------ */

const $ = (id) => document.getElementById(id);

const loading = $("loading");
const error = $("error");
const content = $("content");

function show(element) {
    if (!element) return;
    element.classList.remove("hidden");
}

function hide(element) {
    if (!element) return;
    element.classList.add("hidden");
}

export function showLoading() {
    show(loading);
    hide(error);
    hide(content);
}

export function hideLoading() {
    hide(loading);
}

export function showContent() {
    hide(loading);
    hide(error);
    show(content);
}

export function hideContent() {
    hide(content);
}

export function hideError() {
    hide(error);
}

export function showError(message) {

    hide(loading);
    hide(content);

    show(error);

    const text = $("error-message");

    if (text) {
        text.textContent = message;
    }
}

/* ------------------------------
 * Common Helpers
 * ------------------------------ */

export function clear(node) {

    if (!node) return;

    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }

}

export function escapeHTML(str = "") {

    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

/* ------------------------------
 * Asset Icon
 * ------------------------------ */

export function getAssetIcon(filename = "") {

    const file = filename.toLowerCase();

    if (file.endsWith(".exe"))
        return "🪟";

    if (file.endsWith(".msi"))
        return "🪟";

    if (file.endsWith(".apk"))
        return "🤖";

    if (file.endsWith(".ipa"))
        return "📱";

    if (file.endsWith(".dmg"))
        return "🍎";

    if (file.endsWith(".pkg"))
        return "🍎";

    if (file.endsWith(".deb"))
        return "🐧";

    if (file.endsWith(".rpm"))
        return "🐧";

    if (file.endsWith(".appimage"))
        return "🐧";

    if (file.endsWith(".flatpak"))
        return "🐧";

    if (file.endsWith(".zip"))
        return "📦";

    if (file.endsWith(".7z"))
        return "📦";

    if (file.endsWith(".tar"))
        return "📦";

    if (file.endsWith(".gz"))
        return "📦";

    if (file.endsWith(".xz"))
        return "📦";

    if (file.endsWith(".rar"))
        return "📦";

    if (file.endsWith(".iso"))
        return "💿";

    return "📄";
}

/* ------------------------------
 * Asset Color
 * ------------------------------ */

export function getAssetClass(filename = "") {

    const file = filename.toLowerCase();

    if (
        file.endsWith(".exe") ||
        file.endsWith(".msi")
    )
        return "asset-windows";

    if (
        file.endsWith(".dmg") ||
        file.endsWith(".pkg")
    )
        return "asset-macos";

    if (
        file.endsWith(".deb") ||
        file.endsWith(".rpm") ||
        file.endsWith(".appimage")
    )
        return "asset-linux";

    if (file.endsWith(".apk"))
        return "asset-android";

    return "asset-default";
}

/* ------------------------------
 * Create Element
 * ------------------------------ */

export function create(tag, className = "") {

    const el = document.createElement(tag);

    if (className) {
        el.className = className;
    }

    return el;
}

/* ------------------------------
 * Markdown
 * ------------------------------ */

marked.setOptions({

    breaks: true,

    gfm: true

});

export function renderMarkdown(text = "") {

    if (!text.trim()) {
        return `
            <p class="empty-notes">
                No release notes.
            </p>
        `;
    }

    return marked.parse(text);
}

/* ------------------------------
 * Update Header
 * ------------------------------ */

export function updateHeader(config) {

    const title = $("project-title");
    const subtitle = $("project-subtitle");

    if (title)
        title.textContent = config.title;

    if (subtitle)
        subtitle.textContent = config.subtitle;

    document.title = `${config.title} Beta`;
}

/* ------------------------------
 * Fill Basic Release Info
 * ------------------------------ */

export function fillReleaseInfo(release) {

    $("release-tag").textContent =
        release.tag;

    $("release-date").textContent =
        formatDate(release.publishedAt);

    $("asset-count").textContent =
        release.assets.length;

}

/* ------------------------------
 * Latest Download Button
 * ------------------------------ */

export function updateLatestButton(
    config,
    release
) {

    const button = $("latest-download");

    if (!button)
        return;

    if (release.assets.length > 0) {

        button.href = buildDownloadURL(
            config,
            release,
            release.assets[0]
        );

    } else {

        button.href =
            release.htmlUrl;

    }

}