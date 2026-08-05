import {
    updateHeader,
    fillReleaseInfo,
    updateLatestButton
} from "./ui.p1.js";

import { renderAssets } from "./renderAssets.js";
import { renderNotes } from "./renderNotes.js";

/**
 * 更新页面标题
 */
function updatePageTitle(config, release) {

    const title = release.tag
        ? `${config.title} Beta · ${release.tag}`
        : `${config.title} Beta`;

    document.title = title;
}

/**
 * 更新 Header 信息
 */
function updateHero(config, release) {

    updateHeader(config);

    const subtitle = document.getElementById(
        "project-subtitle"
    );

    if (!subtitle)
        return;

    if (release.prerelease) {

        subtitle.textContent =
            `${config.subtitle} · Pre-release`;

    } else {

        subtitle.textContent =
            config.subtitle;

    }

}

/**
 * 更新 Footer
 */
function updateFooter(release) {

    const footer =
        document.querySelector("footer p");

    if (!footer)
        return;

    footer.innerHTML = `
        Made with ❤️ · ${__APP_NAME__}
        <span class="footer-beta">
            Beta / Experimental
        </span>
        ·
        v${__APP_VERSION__}
    `;
}

/**
 * 更新最新下载按钮文字
 */
function updateDownloadButton(release) {

    const button =
        document.getElementById(
            "latest-download"
        );

    if (!button)
        return;

    if (
        release.assets &&
        release.assets.length > 0
    ) {

        button.textContent =
            `⬇ 下载 (${release.assets.length})`;

    } else {

        button.textContent =
            "在GitHub打开";

    }

}

/**
 * 渲染 Release
 */
export function renderRelease(
    config,
    release
) {

    updatePageTitle(
        config,
        release
    );

    updateHero(
        config,
        release
    );

    fillReleaseInfo(
        release
    );

    updateLatestButton(
        release
    );

    updateDownloadButton(
        release
    );

    renderAssets(
        release
    );

    renderNotes(
        release
    );

    updateFooter(
        release
    );

}

/**
 * 默认导出
 */
export default {
    renderRelease
};