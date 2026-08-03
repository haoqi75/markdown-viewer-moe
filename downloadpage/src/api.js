/**
 * GitHub Release API
 * GitHub Release Download Beta
 */

/**
 * 请求 GitHub API
 * @param {string} url
 * @returns {Promise<any>}
 */
async function request(url) {
    const response = await fetch(url, {
        headers: {
            "Accept": "application/vnd.github+json"
        }
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
            const json = await response.json();

            if (json.message) {
                message = json.message;
            }
        } catch {}

        throw new Error(message);
    }

    return response.json();
}

/**
 * 格式化 Release 数据
 * @param {Object} release
 */
function normalizeRelease(release) {
    return {
        id: release.id,

        name: release.name || release.tag_name,

        tag: release.tag_name,

        body: release.body || "",

        htmlUrl: release.html_url,

        zipballUrl: release.zipball_url,

        tarballUrl: release.tarball_url,

        prerelease: release.prerelease,

        draft: release.draft,

        createdAt: release.created_at,

        publishedAt: release.published_at,

        author: {
            name: release.author?.login ?? "Unknown",
            avatar: release.author?.avatar_url ?? ""
        },

        assets: (release.assets || []).map(asset => ({
            id: asset.id,

            name: asset.name,

            size: asset.size,

            downloads: asset.download_count,

            contentType: asset.content_type,

            updatedAt: asset.updated_at,

            downloadUrl: asset.browser_download_url
        }))
    };
}

/**
 * 获取最新 Release
 * @param {Object} config
 */
export async function fetchLatestRelease(config) {

    const url =
        config.releaseAPI ??
        `https://api.github.com/repos/${config.owner}/${config.repo}/releases/latest`;

    const json = await request(url);

    return normalizeRelease(json);
}

/**
 * 获取指定 Tag 的 Release
 * 可用于以后增加版本切换功能
 */
export async function fetchRelease(owner, repo, tag) {

    const url =
        `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;

    const json = await request(url);

    return normalizeRelease(json);
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes) {

    if (!bytes) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }

    return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
}

/**
 * 格式化日期
 */
export function formatDate(dateString) {

    if (!dateString) {
        return "--";
    }

    return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/**
 * 距离现在多久
 */
export function timeAgo(dateString) {

    const now = Date.now();

    const time = new Date(dateString).getTime();

    const diff = Math.floor((now - time) / 1000);

    if (diff < 60)
        return `${diff} sec ago`;

    if (diff < 3600)
        return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
        return `${Math.floor(diff / 3600)} hr ago`;

    if (diff < 604800)
        return `${Math.floor(diff / 86400)} day(s) ago`;

    return formatDate(dateString);
}

export default {
    fetchLatestRelease,
    fetchRelease,
    formatDate,
    formatSize,
    timeAgo
};