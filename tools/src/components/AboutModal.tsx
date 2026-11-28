import React, { useEffect } from 'react';
import { ExternalLink, Github, Sparkles, X } from 'lucide-react';

interface AboutPalette {
  lightBg: string;
  darkBg: string;
  lightText: string;
  darkText: string;
  primaryAccent: string;
  primaryLight: string;
  primaryBorder: string;
  shadow: string;
}

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  palette: AboutPalette;
  version: string;
}

const FEATURES = [
  {
    emoji: '🎛️',
    title: '可视化配置',
    description: '表单填写与 JSON 源码双模式，自动匹配字段类型，改配置不用背格式。',
  },
  {
    emoji: '🧩',
    title: '模板与 type',
    description: '根据配置里的 type 自动选择模板，导入缺少 type 的 JSON 时也能手动套用样式。',
  },
  {
    emoji: '📦',
    title: 'Release 打包',
    description: '读取 index.html 里的 release-config，修改后精准写回并下载新文件。',
  },
  {
    emoji: '🔗',
    title: '链接工具',
    description: '内置 Markdown Base64 链接生成器和通用 Base64 编解码，支持多线路前缀。',
  },
  {
    emoji: '🔒',
    title: '本地处理',
    description: '配置解析、校验和打包全部在浏览器完成，不上传你的配置或 Markdown 内容。',
  },
  {
    emoji: '🌗',
    title: '主题适配',
    description: '跟随六种萌系主题切换，支持亮色/暗色模式，移动端状态栏颜色也会同步。',
  },
];

const TECH_TAGS = ['React 19', 'Vite 6', 'Tailwind 4', 'TypeScript', 'lucide-react', 'Gulp', 'pnpm'];

const LINKS = [
  { label: '主站', href: 'https://moe520.cc.cd/' },
  { label: '备用站', href: 'https://moe520.os.kg/' },
  { label: '使用文档', href: 'https://docs.moe520.cc.cd/' },
  { label: 'GitHub 源码', href: 'https://github.com/haoqi75/markdown-viewer-moe' },
  { label: 'Codeberg 源码', href: 'https://codeberg.org/haoqi75/markdown-viewer-moe' },
];

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  palette,
  version,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const surface = isDarkMode ? '#1a0f18' : '#fffafc';
  const muted = isDarkMode ? '#ccb3bc' : '#6e4e59';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)';
  const cardBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : palette.primaryBorder;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          id="tools-about-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tools-about-title"
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-2 shadow-2xl"
          style={{ backgroundColor: surface, borderColor: palette.primaryBorder }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-6 py-5 backdrop-blur-md"
            style={{
              backgroundColor: isDarkMode ? 'rgba(26,15,24,0.94)' : 'rgba(255,250,252,0.94)',
              borderColor: cardBorder,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{
                  backgroundColor: palette.primaryAccent,
                  boxShadow: `0 6px 18px ${palette.shadow}`,
                }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="tools-about-title"
                  className="text-lg font-black tracking-tight"
                  style={{ color: isDarkMode ? palette.darkText : palette.primaryAccent }}
                >
                  关于萌·Markdown 配置生成器
                </h2>
                <p className="mt-0.5 text-xs font-bold" style={{ color: muted }}>
                  Moe Config Box · v{version}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭关于页面"
              className="rounded-xl border p-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: palette.primaryBorder,
                color: palette.primaryAccent,
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-7 px-6 py-6">
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl"
                style={{ backgroundColor: palette.primaryLight }}
              >
                🎀
              </div>
              <p
                className="mx-auto max-w-xl text-sm leading-7 font-semibold"
                style={{ color: isDarkMode ? palette.darkText : palette.lightText }}
              >
                萌·Markdown 的配套配置编辑器。把复杂的 <code>config.json</code> 变成可视化表单，
                也能读取、修改并重新打包 <code>index.html</code>。
              </p>
              <p className="mt-2 text-xs font-bold" style={{ color: muted }}>
                纯前端 · 单文件 · 所有配置都在浏览器本地处理
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-black" style={{ color: palette.primaryAccent }}>
                ✨ 工具特色
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border p-4"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">{feature.emoji}</span>
                      <b className="text-sm" style={{ color: isDarkMode ? palette.darkText : palette.lightText }}>
                        {feature.title}
                      </b>
                    </div>
                    <p className="text-xs leading-6 font-medium" style={{ color: muted }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-black" style={{ color: palette.primaryAccent }}>
                🛠️ 技术栈
              </h3>
              <div className="flex flex-wrap gap-2">
                {TECH_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: palette.primaryLight,
                      borderColor: palette.primaryBorder,
                      color: palette.primaryAccent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-black" style={{ color: palette.primaryAccent }}>
                🔗 相关链接
              </h3>
              <div className="flex flex-wrap gap-2">
                {LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      backgroundColor: palette.primaryLight,
                      borderColor: palette.primaryBorder,
                      color: palette.primaryAccent,
                    }}
                  >
                    {link.label === 'GitHub 源码' ? (
                      <Github className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-4 text-center text-xs leading-6 font-medium"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, color: muted }}
            >
              <p>
                本项目以 <strong>MIT License</strong> 发布，作者 ApHeQua758，内容由 AI 辅助生成与修复。
              </p>
              <p className="mt-1">
                通过 <code>tools.html?p=about</code> 或页头「关于」按钮访问此页面。
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl px-6 py-2.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  backgroundColor: palette.primaryAccent,
                  boxShadow: `0 4px 14px ${palette.shadow}`,
                }}
              >
                返回编辑器
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
