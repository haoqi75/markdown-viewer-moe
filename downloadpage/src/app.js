import config from "./config.js";
import { fetchLatestRelease } from "./api.js";
import {
    showLoading,
    hideLoading,
    showContent,
    showError,
    hideError,
    renderRelease
} from "./ui.js";

async function loadRelease() {
    try {
        showLoading();
        hideError();

        const release = await fetchLatestRelease(config);

        renderRelease(config, release);

        hideLoading();
        showContent();
    } catch (error) {
        console.error(error);

        hideLoading();

        showError(
            error?.message ||
            "Failed to fetch GitHub Release."
        );
    }
}

function registerEvents() {
    const retryButton = document.getElementById("retry-button");

    if (retryButton) {
        retryButton.addEventListener("click", () => {
            loadRelease();
        });
    }

    window.addEventListener("keydown", (event) => {
        if (event.key === "F5") return;

        if (event.key.toLowerCase() === "r" && event.ctrlKey) {
            event.preventDefault();
            loadRelease();
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            // 页面重新激活时不强制刷新，
            // 后续可以在这里加入缓存策略。
        }
    });
}

async function init() {
    document.title = `${config.title}`;

    const title = document.getElementById("project-title");
    const subtitle = document.getElementById("project-subtitle");

    if (title) {
        title.textContent = config.title;
    }

    if (subtitle) {
        subtitle.textContent = config.subtitle;
    }

    registerEvents();

    await loadRelease();
}

window.addEventListener("DOMContentLoaded", init);