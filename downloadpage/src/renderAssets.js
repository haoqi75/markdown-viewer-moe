import {
    create,
    clear,
    getAssetIcon,
    getAssetClass
} from "./ui.p1.js";
import {
    formatSize,
    timeAgo
} from "./api.js";
import { buildDownloadURL } from "./utils.js";

/**
 * 创建 Asset 卡片
 */
function createAssetCard(config, release, asset) {

    const card = create("a", "asset-card");

    card.href = buildDownloadURL(config, release, asset);
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const icon = create(
        "div",
        `asset-icon ${getAssetClass(asset.name)}`
    );

    icon.textContent = getAssetIcon(asset.name);

    const body = create("div", "asset-body");

    const title = create("div", "asset-title");
    title.textContent = asset.name;

    const meta = create("div", "asset-meta");

    meta.textContent =
        `${formatSize(asset.size)} • ` +
        `${asset.downloads} downloads • ` +
        `${timeAgo(asset.updatedAt)}`;

    body.append(title);
    body.append(meta);

    const arrow = create("div", "asset-arrow");
    arrow.textContent = "⬇";

    card.append(icon);
    card.append(body);
    card.append(arrow);

    return card;
}

/**
 * 空状态
 */
function createEmptyAssets() {

    const div = create("div", "empty-assets");

    div.innerHTML = `
        <div class="empty-icon">
            📦
        </div>

        <h3>
            No Assets
        </h3>

        <p>
            This release doesn't contain downloadable files.
        </p>
    `;

    return div;
}

/**
 * 渲染 Assets
 */
export function renderAssets(
    config,
    release
) {

    const container =
        document.getElementById("asset-list");

    if (!container)
        return;

    clear(container);

    if (
        !release.assets ||
        release.assets.length === 0
    ) {

        container.append(
            createEmptyAssets()
        );

        return;
    }

    for (const asset of release.assets) {

        container.append(
            createAssetCard(config, release, asset)
        );

    }

}