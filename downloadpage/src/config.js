export default {
    owner: "haoqi75",
    repo: "markdown-viewer-moe",
    downloadSources: [
        {
            name: "GitHub",
            base: "https://github.com/haoqi75/markdown-viewer-moe/releases/download/{tag}/"
        },
        {
            name: "Codeberg",
            base: "https://codeberg.org/haoqi75/markdown-viewer-moe/releases/download/{tag}/"
        }
    ],
    defaultSource: 0,
    rememberSource: true,
    title: "下载",
    subtitle: "最新稳定发布版本",
    github: true,
    showAssets: true,
    releaseAPI:
        "https://api.github.com/repos/haoqi75/markdown-viewer-moe/releases/latest"
};