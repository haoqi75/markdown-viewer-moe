import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import htmlMinifierTerser from 'html-minifier-terser';

const { minify } = htmlMinifierTerser;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 压缩项目根目录 dist 下的 HTML 文件并覆盖原文件
 * @param {string} targetFileName - dist 目录下的文件名，默认 'index.html'
 */
async function minifyDistHtmlFile(targetFileName = 'index.html') {
  // 防止传入带路径的参数导致越界，只取文件名
  const safeFileName = path.basename(targetFileName);
  const resolvedPath = path.join(__dirname, '..', 'dist', safeFileName);

  try {
    const rawHtml = await fs.readFile(resolvedPath, 'utf8');

    const minifiedHtml = await minify(rawHtml, {
      collapseWhitespace: true,
      conservativeCollapse: false,
      removeComments: true,              // 清理 <!-- ... --> HTML 注释
      removeCommentsFromCDATA: true,     // 清理 CDATA 注释
      // 同时压缩内联脚本和样式
      minifyJS: {
        compress: true,
        mangle: true,
        format: {
          comments: false
        }
      },
      minifyCSS: {
        level: {
          1: {
            specialComments: 0           // 移除内联 CSS 中的 /* */（含 /*! */）注释
          },
          2: false
        }
      },
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      collapseBooleanAttributes: true
    });

    await fs.writeFile(resolvedPath, minifiedHtml, 'utf8');
    console.log(`压缩成功，已覆盖原文件：${resolvedPath}`);
  } catch (error) {
    console.error(`HTML 压缩失败（目标：${resolvedPath}），请检查文件是否存在或语法是否正确：`, error);
    throw error;
  }
}

function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

async function resolveTargets(inputPattern) {
  if (!inputPattern.includes('*')) {
    return [inputPattern];
  }

  const distDir = path.join(__dirname, '..', 'dist');
  const matcher = globToRegExp(inputPattern);
  const files = (await fs.readdir(distDir)).filter((file) => matcher.test(file));

  if (files.length === 0) {
    throw new Error(`没有找到匹配 ${inputPattern} 的 HTML 文件`);
  }

  return files;
}

async function main() {
  // 获取命令行参数：node scripts/minify-html.js tools.html -> process.argv[2] 为 'tools.html'
  const inputPattern = process.argv[2] || 'index.html';
  const targets = await resolveTargets(inputPattern);

  for (const target of targets) {
    await minifyDistHtmlFile(target);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMain) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}

export { main, minifyDistHtmlFile, resolveTargets };
