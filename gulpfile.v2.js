const gulp = require('gulp');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'dist', 'server');
const serverHtmlPath = path.join(serverDir, 'index.html');
const releasePath = path.join(rootDir, 'dist', 'index.release.html');

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

  output = output.replace(
    /<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (tag, src) => {
      const js = readInlineAsset(src, 'JS');
      return js === null ? tag : `<script type="module">${js}</script>`;
    }
  );

  output = output.replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>/gi, '');

  return output;
}

async function packRelease() {
  if (!fs.existsSync(serverHtmlPath)) {
    throw new Error(`Release 打包失败：${serverHtmlPath} 不存在，请先运行 pnpm build:v2`);
  }

  const html = fs.readFileSync(serverHtmlPath, 'utf8');
  const releaseHtml = inlineViteAssets(html);

  fs.mkdirSync(path.dirname(releasePath), { recursive: true });
  fs.writeFileSync(releasePath, releaseHtml, 'utf8');

  console.log(`✅ Release 单文件已生成: ${releasePath} (${Buffer.byteLength(releaseHtml)} 字节)`);
}

exports.release = gulp.series(packRelease);
exports.default = exports.release;
