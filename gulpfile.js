import gulp from 'gulp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifyDistHtmlFile } from './scripts/minify-html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const serverDir = path.join(rootDir, 'dist', 'server');
const serverHtmlPath = path.join(serverDir, 'index.html');
const releasePath = path.join(rootDir, 'dist', 'index.html');

function resolveLocalAsset(url) {
  if (/^(?:https?:)?\/\//i.test(url) || url.startsWith('data:')) {
    return null;
  }

  const cleanUrl = url.split(/[?#]/)[0].replace(/^\.\//, '').replace(/^\//, '');
  return path.join(serverDir, cleanUrl);
}

function readInlineAsset(url, type) {
  const assetPath = resolveLocalAsset(url);
  if (!assetPath) return null;

  if (!fs.existsSync(assetPath)) {
    throw new Error(`Release 打包失败：找不到 ${type} 资源 ${url}`);
  }

  return fs.readFileSync(assetPath, 'utf8');
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
}

function readInlineImage(url) {
  const assetPath = resolveLocalAsset(url);
  if (!assetPath) return null;

  if (!fs.existsSync(assetPath)) {
    throw new Error(`Release 打包失败：找不到图片资源 ${url}`);
  }

  return `data:${getMimeType(assetPath)};base64,${fs.readFileSync(assetPath).toString('base64')}`;
}

function inlineViteAssets(html) {
  let output = html;

  output = output.replace(
    /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,
    (tag) => {
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) return tag;

      const css = readInlineAsset(hrefMatch[1], 'CSS');
      return css === null ? tag : `<style>${css}</style>`;
    }
  );

  output = output.replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>/gi, '');

  output = output.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/\brel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i.test(tag)) {
      return tag;
    }

    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) return tag;

    const dataUri = readInlineImage(hrefMatch[1]);
    return dataUri === null ? tag : tag.replace(hrefMatch[0], `href="${dataUri}"`);
  });

  output = output.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return tag;

    const dataUri = readInlineImage(srcMatch[1]);
    return dataUri === null ? tag : tag.replace(srcMatch[0], `src="${dataUri}"`);
  });

  // 最后再内联脚本，避免把 JS 字符串里的 <img> 模板误判成真实标签
  output = output.replace(
    /<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (tag, src) => {
      const js = readInlineAsset(src, 'JS');
      return js === null ? tag : `<script type="module">${js}</script>`;
    }
  );

  return output;
}

async function packRelease() {
  if (!fs.existsSync(serverHtmlPath)) {
    throw new Error(`Release 打包失败：${serverHtmlPath} 不存在，请先运行 pnpm build`);
  }

  const html = fs.readFileSync(serverHtmlPath, 'utf8');
  const releaseHtml = inlineViteAssets(html);

  fs.mkdirSync(path.dirname(releasePath), { recursive: true });
  fs.writeFileSync(releasePath, releaseHtml, 'utf8');

  console.log(`✅ Release 单文件已生成: ${releasePath} (${Buffer.byteLength(releaseHtml)} 字节)`);
}

async function minifyRelease() {
  await minifyDistHtmlFile(path.basename(releasePath));
}

export { minifyRelease as 'minify-html' };
export { minifyRelease as minifyHtml };
export const release = gulp.series(packRelease, minifyRelease);
export default release;
