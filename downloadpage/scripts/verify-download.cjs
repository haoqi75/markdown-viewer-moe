#!/usr/bin/env node
/**
 * scripts/verify-download.js
 *
 * 专门校验 dist/download.html 是否存在且内容有效（不依赖浏览器加载）。
 *
 * 用法：
 *   node scripts/verify-download.js
 *
 * 校验失败时打印具体原因，并以退出码 1 结束进程。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---- 终端颜色（零依赖，仅用 ANSI 转义码） ----
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};
const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

/**
 * 计算字符串在终端中的"显示宽度"（中文/全角字符按 2 列计算），
 * 并自动去除 ANSI 颜色码，用于对齐带颜色文本的边框。
 */
function displayWidth(text) {
  const plain = text.replace(/\x1b\[[0-9;]*m/g, '');
  let width = 0;
  for (const ch of plain) {
    const code = ch.codePointAt(0);
    const isWide =
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1faff) ||
      (code >= 0x2600 && code <= 0x27bf);
    width += isWide ? 2 : 1;
  }
  return width;
}

function padLine(leftText, rightText, totalWidth) {
  const used = displayWidth(leftText) + displayWidth(rightText);
  const gap = Math.max(totalWidth - used, 1);
  return `${leftText}${' '.repeat(gap)}${rightText}`;
}

// ---- 配置 ----
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TARGET_FILE = 'download.html';
const MIN_FILE_SIZE_BYTES = 50;
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json');

// 用来包裹构建信息的唯一标记，方便重复运行时定位并替换旧的信息块（幂等，不会越叠越多）
const BUILD_INFO_START = 'BUILD-INFO-START';
const BUILD_INFO_END = 'BUILD-INFO-END';
const BUILD_INFO_BLOCK_RE = new RegExp(
  `<!--\\s*${BUILD_INFO_START}[\\s\\S]*?${BUILD_INFO_END}\\s*-->\\r?\\n?`,
  'i'
);

const errors = [];
const warnings = [];

/** 读取项目根目录 package.json 的 version 字段，失败时返回 null（记为 warning，而非致命错误） */
function getPackageVersion() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    warnings.push(`未找到 ${path.relative(process.cwd(), PACKAGE_JSON_PATH)}，构建信息中的版本号将标记为 unknown`);
    return null;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    if (!pkg.version) {
      warnings.push('package.json 中缺少 "version" 字段，构建信息中的版本号将标记为 unknown');
      return null;
    }
    return pkg.version;
  } catch (err) {
    warnings.push(`package.json 解析失败(${err.message})，构建信息中的版本号将标记为 unknown`);
    return null;
  }
}

/** 获取当前 Git 短哈希，非 Git 仓库或 git 命令不可用时返回 null（记为 warning，而非致命错误） */
function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch (err) {
    warnings.push('无法获取 Git commit hash（可能不是 Git 仓库，或未安装 git），构建信息中将标记为 unknown');
    return null;
  }
}

/** 生成本次构建信息注释块的内容 */
function buildInfoComment() {
  const buildTime = new Date().toISOString();
  const version = getPackageVersion() || 'unknown';
  const gitHash = getGitHash() || 'unknown';

  const comment =
    `<!-- ${BUILD_INFO_START}\n` +
    `  Build Time: ${buildTime}\n` +
    `  Version: ${version}\n` +
    `  Git Commit: ${gitHash}\n` +
    `${BUILD_INFO_END} -->\n`;

  return { comment, buildTime, version, gitHash };
}

/**
 * 将构建信息注释块注入文件头部。
 * 若文件中已存在旧的构建信息块（通过 BUILD-INFO-START/END 标记识别），先移除旧块再插入新块，
 * 保证重复运行 postbuild 时不会越叠越多。
 */
function injectBuildInfo(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8');
  const withoutOldBlock = original.replace(BUILD_INFO_BLOCK_RE, '');
  const { comment, buildTime, version, gitHash } = buildInfoComment();
  fs.writeFileSync(filePath, comment + withoutOldBlock, 'utf-8');
  return { buildTime, version, gitHash };
}

function verifyDownloadHtml() {
  const filePath = path.join(DIST_DIR, TARGET_FILE);

  // 1. 文件是否存在
  if (!fs.existsSync(filePath)) {
    errors.push(`[缺失文件] ${path.relative(process.cwd(), filePath)} 不存在`);
    return;
  }

  // 2. 文件是否可读、是否是常规文件
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    errors.push(`[无法读取] ${TARGET_FILE} 状态获取失败: ${err.message}`);
    return;
  }

  if (!stat.isFile()) {
    errors.push(`[类型错误] ${TARGET_FILE} 不是一个常规文件`);
    return;
  }

  // 3. 文件大小是否合理
  if (stat.size === 0) {
    errors.push(`[空文件] ${TARGET_FILE} 文件大小为 0 字节`);
    return;
  }
  if (stat.size < MIN_FILE_SIZE_BYTES) {
    errors.push(
      `[内容过短] ${TARGET_FILE} 仅有 ${stat.size} 字节，小于最小阈值 ${MIN_FILE_SIZE_BYTES} 字节，可能是构建异常产生的残缺文件`
    );
    return;
  }

  // 4. 读取内容做结构性校验
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    errors.push(`[读取失败] ${TARGET_FILE} 读取时出错: ${err.message}`);
    return;
  }

  // 4.1 是否包含合法的 doctype / html 根标签
  const hasDoctype = /<!doctype\s+html/i.test(content);
  const hasOpenHtmlTag = /<html[\s>]/i.test(content);
  if (!hasDoctype && !hasOpenHtmlTag) {
    errors.push(`[结构异常] ${TARGET_FILE} 未找到 <!DOCTYPE html> 或 <html> 标签，内容可能不是有效的HTML`);
    return;
  }

  // 4.2 关键标签是否闭合完整（剥离 script/style/注释后再判断，避免误判JS字符串里的同名文本）
  const strippedContent = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const tagPairs = ['html', 'head', 'body'];
  for (const tag of tagPairs) {
    const openCount = (strippedContent.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
    const closeCount = (strippedContent.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (openCount !== closeCount) {
      errors.push(
        `[标签未闭合] ${TARGET_FILE} 中 <${tag}> 标签数量(${openCount})与</${tag}>数量(${closeCount})不匹配（已排除 script/style/注释 内容），文件可能被截断或损坏`
      );
    }
  }

  // 4.3 是否包含常见的构建/服务器错误输出，误写入了 HTML 文件
  const errorSignatures = [
    /cannot get \//i,
    /internal server error/i,
    /^\s*(error|typeerror|referenceerror):/im,
    /at\s+Object\.<anonymous>\s*\(/,
    /webpack compiled with \d+ error/i,
  ];
  const matchedSignature = errorSignatures.find((re) => re.test(strippedContent));
  if (matchedSignature) {
    errors.push(`[疑似错误输出] ${TARGET_FILE} 内容中检测到疑似构建/运行时错误信息，文件可能未正确生成`);
  }

  // 4.4 是否存在明显的乱码/二进制内容
  if (content.includes('\u0000')) {
    errors.push(`[编码异常] ${TARGET_FILE} 中检测到空字符(\\u0000)，文件可能是二进制损坏内容而非文本`);
  }
}

function main() {
  const startTime = Date.now();
  console.log(`\n${c('dim', '🔍 正在校验:')} ${c('cyan', path.join(DIST_DIR, TARGET_FILE))}\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ 构建校验失败: dist 目录不存在 (${DIST_DIR})，请先执行构建`);
    process.exit(1);
  }

  verifyDownloadHtml();

  if (errors.length > 0) {
    console.error(c('red', `\n❌ download.html 校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  // ---- 基础校验通过后，向文件头部注入/刷新构建信息注释块 ----
  // 幂等：若文件里已有旧的构建信息块（通过 BUILD-INFO-START/END 标记识别），会先移除再插入新的，
  // 不会因为多次执行 postbuild 而不断堆叠。
  const targetFilePath = path.join(DIST_DIR, TARGET_FILE);
  let buildInfo;
  try {
    buildInfo = injectBuildInfo(targetFilePath);
  } catch (err) {
    errors.push(`[构建信息注入失败] 写入 dist/${TARGET_FILE} 时出错: ${err.message}`);
  }

  if (errors.length > 0) {
    console.error(c('red', `\n❌ download.html 校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  const elapsedMs = Date.now() - startTime;
  const stat = fs.statSync(targetFilePath); // 重新 stat：注入后文件大小已变化
  const sizeStr = stat.size >= 1024 ? `${(stat.size / 1024).toFixed(1)} KB` : `${stat.size} B`;
  const boxWidth = 52;
  const line = '─'.repeat(boxWidth);
  const printRow = (content2) =>
    console.log(`${c('green', '│')} ${padLine(content2, '', boxWidth - 2)} ${c('green', '│')}`);

  console.log(c('green', `┌${line}┐`));
  printRow(`✅ ${c('bold', 'download.html 校验通过')}`);
  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
  console.log(
    `${c('green', '│')} ${padLine(` ${c('cyan', '✔')} dist/${TARGET_FILE}`, c('gray', sizeStr), boxWidth - 2)} ${c('green', '│')}`
  );
  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
  printRow(`${c('gray', '📝 已注入构建信息')}`);
  printRow(c('dim', `  Build Time: ${buildInfo.buildTime}`));
  printRow(c('dim', `  Version: ${buildInfo.version}`));
  printRow(c('dim', `  Git Commit: ${buildInfo.gitHash}`));
  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
  printRow(c('dim', `耗时 ${elapsedMs}ms`));
  console.log(c('green', `└${line}┘`));

  if (warnings.length > 0) {
    console.log(c('yellow', '\n⚠ 提示（不影响本次校验通过）：'));
    warnings.forEach((msg, idx) => console.log(`  ${c('yellow', `${idx + 1}.`)} ${msg}`));
  }

  console.log('');

  process.exit(0);
}

main();
