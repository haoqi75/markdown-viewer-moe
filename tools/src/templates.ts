import { ConfigTemplate } from './types';

export const templates: ConfigTemplate[] = [
  {
    id: 'markdown_moe',
    name: '🌸 萌·Markdown 预览器 (Moe Markdown Viewer)',
    description: '专门为 萌·Markdown 预览器设计的主配置文件，包含网站 Logo、图标、页脚、看板娘以及内容别名路由等可爱设置。',
    icon: 'Sparkles',
    config: {
      title: "🌸 萌·Markdown 预览器：我的专属 Markdown 空间",
      logo: {
        text: "📝 萌·Markdown",
        sub: "我的专属 Markdown 空间"
      },
      logoImage: "img/favicon.svg",
      icon: {
        svg: "img/favicon.svg",
        ico: "img/favicon.ico",
        apple: "img/apple-touch-icon.png"
      },
      footer: "[萌·Markdown](https://github.com/haoqi75/markdown-viewer-moe) | 由 ApHeQua758 与 AI 创建",
      mascot: "img/mascot.png",
      defaultUrl: "https://your-default-api.com/raw/index.md",
      aliases: {
        test: "https://another-api.com/raw/rypa",
        docs: "https://docs.example.com/readme.md"
      },
      tocWelcome: "欢迎来到萌·Markdown",
      toolsUrl: "./tools.html",
      headInject: "",
      bodyInject: ""
    },
    schema: [
      {
        name: '🌸 基础展示 (Basic Info)',
        description: '预览器的标签页标题、欢迎词和版权页脚等基础信息。',
        icon: 'Sliders',
        fields: [
          { key: 'title', label: '页面标题 (title)', type: 'string', description: '浏览器标签页显示的文字标题' },
          { key: 'tocWelcome', label: '目录欢迎词 (tocWelcome)', type: 'string', description: '侧边栏目录最上方显示的欢迎文本' },
          { key: 'footer', label: '页脚版权声明 (footer)', type: 'textarea', description: '支持 Markdown 链接格式的页脚版权声明，例如: [名称](链接) | 额外信息' }
        ]
      },
      {
        name: '🎀 标志与图标 (Logo & Icons)',
        description: '配置顶部导航栏的 Logo 文字、副标题、大 Logo 图像以及各类平台的 favicon 图标路径。',
        icon: 'Palette',
        fields: [
          { key: 'logo.text', label: 'Logo 主标题文本', type: 'string', description: '导航栏显示的主标题（支持 emoji）' },
          { key: 'logo.sub', label: 'Logo 副标题文本', type: 'string', description: 'Logo 旁边的迷你萌系副标题' },
          { key: 'logoImage', label: 'Logo 图像路径', type: 'string', description: '网站 Logo 图片的路径或网络链接' },
          { key: 'icon.svg', label: 'SVG 图标路径', type: 'string', description: '现代化浏览器适用的 SVG 格式 favicon 图标' },
          { key: 'icon.ico', label: 'ICO 图标路径', type: 'string', description: '传统浏览器专用的 favicon.ico 文件路径' },
          { key: 'icon.apple', label: '苹果设备图标路径', type: 'string', description: 'iPhone/iPad 添加到主屏幕时的 PNG 图标文件路径' }
        ]
      },
      {
        name: '🧸 核心参数与看板娘 (Core & Mascot)',
        description: '默认加载的 Markdown 资源，以及悬浮看板娘的素材文件。',
        icon: 'Zap',
        fields: [
          { key: 'defaultUrl', label: '默认 Markdown 地址', type: 'string', description: '预览器启动时默认拉取并解析的 Markdown 原始文件链接' },
          { key: 'mascot', label: '看板娘/吉祥物路径', type: 'string', description: '右下角悬浮悬停的萌系看板娘或吉祥物图片路径/网络链接' },
          { key: 'toolsUrl', label: '工具箱相对地址 (toolsUrl)', type: 'string', description: '一键配置工具的相对路径或网页链接，例如: ./tools.html' }
        ]
      },
      {
        name: '🎨 路由与别名映射 (Aliases)',
        description: '简短路由到原始 Markdown 文件的别名映射表。您可以自由添加、修改或删除自定义别名。',
        icon: 'Route',
        fields: [
          { key: 'aliases', label: '别名映射表 (aliases)', type: 'object', description: '定义特定别名路由对应的 Markdown 直链。例如：添加别名 test，即可通过 /#test 或 ?id=test 快速访问！' }
        ]
      },
      {
        name: '⚙️ 高级自定义与注入 (Inject)',
        description: '在生成的预览页面中插入自定义的头部（如 meta、css）与尾部（如 js 脚本）代码。',
        icon: 'Sliders',
        fields: [
          { key: 'headInject', label: '头部 HTML 注入 (headInject)', type: 'textarea', description: '注入到 <head> 标签末尾 of 自定义 HTML 代码（多用于样式或额外 meta）' },
          { key: 'bodyInject', label: '尾部 HTML 注入 (bodyInject)', type: 'textarea', description: '注入到 <body> 标签末尾 of 自定义 HTML 代码（多用于统计、自定义脚本）' }
        ]
      }
    ]
  },
  {
    id: 'markdown_basic',
    name: '📄 基础·发布配置模板 (Basic Release Config)',
    description: '标准、极简的 Markdown 预览发布配置，包含默认加载的 Markdown 文件地址与路由别名定义。',
    icon: 'Globe',
    config: {
      defaultUrl: "https://your-default-api.com/raw/index.md",
      aliases: {
        test: "https://another-api.com/raw/rypa",
        docs: "https://docs.example.com/readme.md"
      }
    },
    schema: [
      {
        name: '⚙️ 基础设置 (Basic Settings)',
        description: '配置最核心的数据源与路由别名映射表。您可以自由添加、修改或删除自定义别名。',
        icon: 'Sliders',
        fields: [
          { key: 'defaultUrl', label: '默认 Markdown 地址 (defaultUrl)', type: 'string', description: '预览器默认加载的 Markdown 原始文件链接' },
          { key: 'aliases', label: '别名映射表 (aliases)', type: 'object', description: '定义特定别名路由对应的 Markdown 直链。例如：添加别名 test，即可通过 /#test 或 ?id=test 快速访问！' }
        ]
      }
    ]
  }
];
