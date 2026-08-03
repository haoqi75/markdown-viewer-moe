import {
    renderMarkdown,
    escapeHTML
} from "./ui.p1.js";

/**
 * 获取 Release Notes 容器
 */
function getContainer() {
    return document.getElementById("release-notes");
}

/**
 * 创建空状态 HTML
 */
function createEmptyHTML() {
    return `
        <div class="notes-empty">
            <div class="notes-empty-icon">
                📝
            </div>

            <h3>
                No Release Notes
            </h3>

            <p>
                This release doesn't contain any release notes.
            </p>
        </div>
    `;
}

/**
 * 创建错误 HTML
 */
function createErrorHTML(message) {

    return `
        <div class="notes-error">

            <div class="notes-empty-icon">
                ⚠️
            </div>

            <h3>
                Failed to Render
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}

/**
 * 渲染 Markdown
 */
export function renderNotes(release) {

    const container = getContainer();

    if (!container)
        return;

    container.innerHTML = "";

    if (
        !release ||
        !release.body ||
        release.body.trim() === ""
    ) {

        container.innerHTML =
            createEmptyHTML();

        return;
    }

    try {

        container.innerHTML =
            renderMarkdown(release.body);

    } catch (error) {

        console.error(error);

        container.innerHTML =
            createErrorHTML(
                error.message ||
                "Unknown Error"
            );

    }

}