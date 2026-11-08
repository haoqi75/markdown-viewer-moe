import { defineConfig } from 'vitepress'
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "./src",
  outDir: "./.vitepress/dist",
  lang: 'zh-cn',
  lastUpdated: true,
  title: 'Moe Markdown 预览器文档',
  description: '由 AI 生成的 Moe Markdown 查看器 · 萌系主题 · 开箱即用',
  cleanUrls: true,
  head: [
    [
      'link',
      { rel: 'icon', href: '/favicon.ico' }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=ZCOOL+KuaiLe&display=swap', rel: 'stylesheet' }
    ],
    [
      'meta',
      { name: 'theme-color', content: "#f472b6"}
    ]
  ],
  markdown: {
    container: {
      tipLabel: '💡 提示',
      warningLabel: '⚠️ 警告',
      dangerLabel: '🚫 危险',
      infoLabel: 'ℹ️ 信息',
      detailsLabel: '📌 详细信息',
      noteLabel: '📝 笔记'
    },
    codeCopyButton: {
        tooltipText: '复制代码',
        copiedText: '已复制'
    }
  },
  vite: {
    plugins: [pagefindPlugin({
      btnPlaceholder: '搜索',
      placeholder: '搜索文档',
      emptyText: '空空如也',
      heading: '共: {{searchResult}} 条结果',
      toSelect: '选择',
      toNavigate: '导航',
      toClose: '关闭',
      searchBy: '基于',
      // forceLanguage: 'zh-cn',
      // indexingCommand: 'pagefind --site "./.vitepress/dist" --output-path "./.vitepress/dist/pagefind" --exclude-selectors "div.aside, a.header-anchor"',
      customSearchQuery: chineseSearchOptimize
    })],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/icon.png',
    nav: [
      { text: '主页', link: '/' },
      { text: '快速开始', link: '/guide/quick-start', activeMatch: '/guide/' },
      { text: '配置文件', link: '/config', activeMatch: '/config/' }
    ],
    editLink: {
      pattern: 'https://github.com/haoqi75/markdown-viewer-moe-docs/edit/main/docs/:path',
      text: '在 GitHub 编辑此页面'
    },
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '🚀 快速开始', link: '/guide/quick-start' },
          { text: '📥 下载编辑好的', link: '/guide/release' },
          { text: '💻 本地部署', link: '/guide/local' },
          { text: '☁ GitHub Pages 部署', link: '/guide/github-pages' },
          { text: '☁ Codeberg Pages 部署', link: '/guide/codeberg-pages' },
          { text: '🌐 使用', link: '/guide/use' }
        ]
      },
      {
        text: '配置',
        items: [
          { text: '概览', link: '/config' },
          { text: '生产版配置', link: '/config/normal' },
          { text: '发布版配置', link: '/config/release' },
          { text: '简单编辑 config.json 工具', link: '/config/editor' }
        ]
      },
      {
        text: '关于',
        link: '/about'
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/haoqi75/markdown-viewer-moe' },
      { icon: 'codeberg', link: 'https://codeberg.org/haoqi75/markdown-viewer-moe' }
    ],
    footer: {
      message: '本作品采用 MIT 许可证发布',
      copyright: 'Moe Markdown Viewer © 2026'
    },
    darkModeSwitchLabel: '切换主题',
    lightModeSwitchTitle: '切换到浅色主题',
    darkModeSwitchTitle: '切换到深色主题',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '点我跑到上面',
    langMenuLabel: '切换语言',
    lastUpdated: {
      text: '最后更新时间'
    },
    outline: {
      label: '此页内容'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
})
