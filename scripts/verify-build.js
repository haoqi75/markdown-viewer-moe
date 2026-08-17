#!/usr/bin/env node
/**
 * scripts/verify-build.js
 *
 * Post-build 校验脚本：
 *   1. 确认 dist/index.html、dist/tools.html、dist/404.html 是否存在
 *   2. 确认每个文件内容有效（非空、非损坏、结构完整），而不是通过浏览器加载判断
 *
 * 用法：
 *   node scripts/verify-build.js
 *
 * 校验失败时会打印具体原因，并以退出码 1 结束进程，
 * 方便在 CI / package.json 的 "postbuild" 钩子中拦截失败的构建。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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
      (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo
      (code >= 0x2e80 && code <= 0xa4cf) || // CJK 部首/符号/汉字等
      (code >= 0xac00 && code <= 0xd7a3) || // Hangul 音节
      (code >= 0xf900 && code <= 0xfaff) || // CJK 兼容表意文字
      (code >= 0xff00 && code <= 0xff60) || // 全角标点
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1faff) || // emoji 区段
      (code >= 0x2600 && code <= 0x27bf); // 杂项符号/emoji（如 ✅ ✔ ❌）
    width += isWide ? 2 : 1;
  }
  return width;
}

/** 在给定总宽度内，为一行文本两端补空格对齐（考虑全角字符宽度） */
function padLine(leftText, rightText, totalWidth) {
  const used = displayWidth(leftText) + displayWidth(rightText);
  const gap = Math.max(totalWidth - used, 1);
  return `${leftText}${' '.repeat(gap)}${rightText}`;
}

// ---- 配置：需要校验的文件列表 ----
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TOOLS_PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'tools', 'package.json');
const ROOT_PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json');

// 一个非空 HTML 文件的最小合理体积（字节），用于识别"内容被截断/空文件"等异常
const MIN_FILE_SIZE_BYTES = 50;

/** 收集所有错误，最后统一输出，而不是遇到第一个错误就退出 */
const errors = [];
/** 收集非致命警告（不会导致 exit 1），最后统一输出 */
const warnings = [];

// 用来包裹构建信息的唯一标记，方便重复运行时定位并替换旧的信息块（幂等，不会越叠越多）
const BUILD_INFO_START = 'BUILD-INFO-START';
const BUILD_INFO_END = 'BUILD-INFO-END';
const BUILD_INFO_BLOCK_RE = new RegExp(
  `<!--\\s*${BUILD_INFO_START}[\\s\\S]*?${BUILD_INFO_END}\\s*-->\\r?\\n?`,
  'i'
);

/**
 * 读取项目根目录 package.json 的 version 字段（用于 production 模式的构建信息标注）。
 * 失败时记为 warning 而非致命错误，返回 null。
 */
function getRootPackageVersion() {
  if (!fs.existsSync(ROOT_PACKAGE_JSON_PATH)) {
    warnings.push(`未找到 ${path.relative(process.cwd(), ROOT_PACKAGE_JSON_PATH)}，构建信息中的版本号将标记为 unknown`);
    return null;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf-8'));
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

/**
 * 将构建信息注释块注入文件头部（幂等：若文件中已有旧的构建信息块，
 * 通过 BUILD-INFO-START/END 标记先移除再插入新块，不会越叠越多）。
 * @param {string} filePath
 * @param {string} comment - 完整的 <!-- BUILD-INFO-START ... --> 注释块文本
 */
function injectBuildInfo(filePath, comment) {
  const original = fs.readFileSync(filePath, 'utf-8');
  const withoutOldBlock = original.replace(BUILD_INFO_BLOCK_RE, '');
  fs.writeFileSync(filePath, comment + withoutOldBlock, 'utf-8');
}

/**
 * 从 tools/package.json 读取 version 字段，用于生成 release 版本文件名。
 * 失败时把具体原因塞进 errors 并返回 null（调用方需自行判断后续是否继续）。
 */
function getReleaseVersion() {
  if (!fs.existsSync(TOOLS_PACKAGE_JSON_PATH)) {
    errors.push(
      `[版本文件缺失] ${path.relative(process.cwd(), TOOLS_PACKAGE_JSON_PATH)} 不存在，无法确定 release 版本号`
    );
    return null;
  }

  let pkg;
  try {
    const raw = fs.readFileSync(TOOLS_PACKAGE_JSON_PATH, 'utf-8');
    pkg = JSON.parse(raw);
  } catch (err) {
    errors.push(
      `[版本文件解析失败] ${path.relative(process.cwd(), TOOLS_PACKAGE_JSON_PATH)} 不是合法的 JSON: ${err.message}`
    );
    return null;
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    errors.push(
      `[版本号缺失] ${path.relative(process.cwd(), TOOLS_PACKAGE_JSON_PATH)} 中未找到有效的 "version" 字段`
    );
    return null;
  }

  if (!/^\d+\.\d+\.\d+/.test(pkg.version)) {
    errors.push(
      `[版本号格式异常] tools/package.json 中的 version="${pkg.version}" 不符合 X.X.X 语义化版本格式`
    );
    return null;
  }

  return pkg.version;
}

/**
 * 校验单个 HTML 文件
 * @param {string} fileName
 * @param {object} [options]
 * @param {boolean} [options.requireReleaseConfig] - 是否要求文件顶部（<!DOCTYPE html> 之前）
 *   存在 <script id="release-config" type="application/json"> 配置块
 */
function verifyHtmlFile(fileName, options = {}) {
  const { requireReleaseConfig = false } = options;
  const filePath = path.join(DIST_DIR, fileName);

  // 1. 文件是否存在
  if (!fs.existsSync(filePath)) {
    errors.push(`[缺失文件] ${path.relative(process.cwd(), filePath)} 不存在`);
    return;
  }

  // 2. 文件是否可读、是否是常规文件（防止是目录或损坏的软链接等）
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    errors.push(`[无法读取] ${fileName} 状态获取失败: ${err.message}`);
    return;
  }

  if (!stat.isFile()) {
    errors.push(`[类型错误] ${fileName} 不是一个常规文件`);
    return;
  }

  // 3. 文件大小是否合理（排除空文件 / 明显被截断的文件）
  if (stat.size === 0) {
    errors.push(`[空文件] ${fileName} 文件大小为 0 字节`);
    return;
  }
  if (stat.size < MIN_FILE_SIZE_BYTES) {
    errors.push(
      `[内容过短] ${fileName} 仅有 ${stat.size} 字节，小于最小阈值 ${MIN_FILE_SIZE_BYTES} 字节，可能是构建异常产生的残缺文件`
    );
    return;
  }

  // 4. 读取内容，做结构性校验（不依赖浏览器加载）
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    errors.push(`[读取失败] ${fileName} 读取时出错: ${err.message}`);
    return;
  }

  // 4.1 是否包含合法的 doctype / html 根标签
  const hasDoctype = /<!doctype\s+html/i.test(content);
  const hasOpenHtmlTag = /<html[\s>]/i.test(content);
  if (!hasDoctype && !hasOpenHtmlTag) {
    errors.push(`[结构异常] ${fileName} 未找到 <!DOCTYPE html> 或 <html> 标签，内容可能不是有效的HTML`);
    return;
  }

  // 4.1b [Release 专属] <!DOCTYPE html> 之前是否存在
  // <script id="release-config" type="application/json"> 配置块
  if (requireReleaseConfig) {
    // 用双重前瞻匹配 id 和 type 两个属性，不关心它们在标签里的先后顺序
    const releaseConfigRe =
      /<script(?=[^>]*\bid=["']release-config["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i;
    const match = content.match(releaseConfigRe);

    if (!match) {
      errors.push(
        `[Release配置缺失] ${fileName} 未找到 <script id="release-config" type="application/json"> 配置块`
      );
    } else {
      const doctypeIndex = content.search(/<!doctype\s+html/i);
      const scriptIndex = match.index;
      if (doctypeIndex !== -1 && scriptIndex > doctypeIndex) {
        errors.push(
          `[Release配置位置异常] ${fileName} 中的 release-config 配置块出现在 <!DOCTYPE html> 之后，应位于文件顶部`
        );
      }

      // 内容可以不一样，但既然声明了 type="application/json"，就应当是合法 JSON
      try {
        JSON.parse(match[1]);
      } catch (err) {
        errors.push(
          `[Release配置JSON非法] ${fileName} 中 release-config 配置块内容不是合法 JSON: ${err.message}`
        );
      }
    }
  }

  // 4.2 常见关键标签是否闭合完整（简单配对检测，非完整解析器，足以发现构建截断问题）
  //
  // 注意：<script>/<style> 标签内部可能包含任意 JS/CSS 文本（例如打包后的 JS 字符串、
  // 界面文案里恰好写了 "<head>"、"<body>" 这样的说明性文字），这些不是真正的 HTML 标签，
  // 必须先剥离掉，否则会把 JS 字符串误判成未闭合的标签，产生"假阳性"报错。
  // 同样，HTML 注释 <!-- ... --> 内的内容也应剥离。
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
        `[标签未闭合] ${fileName} 中 <${tag}> 标签数量(${openCount})与</${tag}>数量(${closeCount})不匹配（已排除 script/style/注释 内容），文件可能被截断或损坏`
      );
    }
  }

  // 4.3 是否包含常见的构建/服务器错误输出，误写入了 HTML 文件
  // 同样基于剥离 script/style 后的内容判断，避免命中打包代码里恰好出现的同名字符串/变量。
  const errorSignatures = [
    /cannot get \//i,
    /internal server error/i,
    /^\s*(error|typeerror|referenceerror):/im,
    /at\s+Object\.<anonymous>\s*\(/, // node 报错堆栈特征
    /webpack compiled with \d+ error/i,
  ];
  const matchedSignature = errorSignatures.find((re) => re.test(strippedContent));
  if (matchedSignature) {
    errors.push(`[疑似错误输出] ${fileName} 内容中检测到疑似构建/运行时错误信息，文件可能未正确生成`);
  }

  // 4.4 是否存在明显的乱码/二进制内容（例如出现大量 NULL 字符）
  if (content.includes('\u0000')) {
    errors.push(`[编码异常] ${fileName} 中检测到空字符(\\u0000)，文件可能是二进制损坏内容而非文本`);
  }
}

/**
 * 计算文件的 MD5 值（十六进制小写字符串）
 * @param {string} filePath
 */
function computeFileMd5(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function main() {
  const startTime = Date.now();
  const isRelease = process.argv.includes('--release');

  // ---- 根据模式确定本次需要校验的文件列表 ----
  /** @type {{ name: string, requireReleaseConfig?: boolean }[]} */
  let targetFiles;
  let releaseVersion = null;

  if (isRelease) {
    const version = getReleaseVersion();
    if (!version) {
      // 版本号都拿不到，后面无法确定文件名，直接报错退出
      console.error(c('red', `\n❌ Release 校验无法继续，发现 ${errors.length} 个问题：\n`));
      errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
      console.error('');
      process.exit(1);
    }
    releaseVersion = version;
    targetFiles = [
      { name: 'index.release.html', requireReleaseConfig: true },
      { name: `tools-v${version}.html`, requireReleaseConfig: false },
    ];
  } else {
    targetFiles = [{ name: 'index.html' }, { name: 'tools.html' }, { name: '404.html' }];
  }

  const modeLabel = isRelease ? c('bold', 'RELEASE') : c('bold', 'PRODUCTION');
  console.log(
    `\n${c('dim', '🔍 正在校验构建产物目录:')} ${c('cyan', DIST_DIR)} ${c('dim', '· 模式:')} ${modeLabel}\n`
  );

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ 构建校验失败: dist 目录不存在 (${DIST_DIR})，请先执行构建`);
    process.exit(1);
  }

  for (const file of targetFiles) {
    verifyHtmlFile(file.name, { requireReleaseConfig: file.requireReleaseConfig });
  }

  if (errors.length > 0) {
    console.error(c('red', `\n❌ 构建产物校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  // ---- Release 模式：清理残留的开发版文件 ----
  // release 构建只应保留 index.release.html / tools-vX.X.X.html，
  // 如果 dist 目录里还留着旧的 dev 版 index.html，会被误当成默认入口文件部署出去，
  // 因此校验通过后顺手删掉；文件本来就不存在则忽略，不算错误。
  const removedFiles = [];
  if (isRelease) {
    const residualFiles = ['index.html'];
    for (const residualName of residualFiles) {
      const residualPath = path.join(DIST_DIR, residualName);
      if (!fs.existsSync(residualPath)) continue; // 不存在则忽略
      try {
        fs.unlinkSync(residualPath);
        removedFiles.push(residualName);
      } catch (err) {
        errors.push(`[残留文件清理失败] 删除 dist/${residualName} 时出错: ${err.message}`);
      }
    }
  }

  // 清理过程本身也可能出错，出错则同样按失败处理退出
  if (errors.length > 0) {
    console.error(c('red', `\n❌ 构建产物校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  // ---- 注入 / 刷新构建信息注释块 ----
  // production 与 release 模式均生效，写入每个目标文件的最顶部。
  // 幂等：通过 BUILD-INFO-START/END 标记识别旧块并替换，不会因重复执行 postbuild 而越叠越多。
  // 放在这里（MD5 清单生成之前）是为了让 files-md5.txt 覆盖的是注入构建信息后的最终文件内容。
  const buildTime = new Date().toISOString();
  const buildVersion = getRootPackageVersion(); // production/release 统一使用根目录 package.json 的版本
  const gitHash = getGitHash();
  const buildInfoComment =
    `<!-- ${BUILD_INFO_START}\n` +
    `  Build Time: ${buildTime}\n` +
    `  Version: ${buildVersion || 'unknown'}\n` +
    `  Git Commit: ${gitHash || 'unknown'}\n` +
    `${BUILD_INFO_END} -->\n`;

  for (const file of targetFiles) {
    const filePath = path.join(DIST_DIR, file.name);
    try {
      injectBuildInfo(filePath, buildInfoComment);
    } catch (err) {
      errors.push(`[构建信息注入失败] 写入 dist/${file.name} 时出错: ${err.message}`);
    }
  }

  // 注入过程本身也可能出错，出错则同样按失败处理退出
  if (errors.length > 0) {
    console.error(c('red', `\n❌ 构建产物校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  // ---- Release 模式：生成 files-md5.txt 校验和清单 ----
  // 覆盖本次校验通过的 release 交付文件（index.release.html / tools-vX.X.X.html），
  // 方便部署后核对文件完整性、排查 CDN 缓存或传输过程中的内容篡改/损坏问题。
  let md5FileName = null;
  if (isRelease) {
    md5FileName = 'files-md5.txt';
    const md5FilePath = path.join(DIST_DIR, md5FileName);
    try {
      const lines = targetFiles
        .map((file) => file.name)
        .sort()
        .map((name) => `${computeFileMd5(path.join(DIST_DIR, name))}  ${name}`);
      fs.writeFileSync(md5FilePath, lines.join('\n') + '\n', 'utf-8');
    } catch (err) {
      errors.push(`[MD5清单生成失败] 写入 dist/${md5FileName} 时出错: ${err.message}`);
    }
  }

  // 生成校验和清单也可能失败，同样按失败处理退出
  if (errors.length > 0) {
    console.error(c('red', `\n❌ 构建产物校验未通过，发现 ${errors.length} 个问题：\n`));
    errors.forEach((msg, idx) => console.error(`  ${c('red', `${idx + 1}.`)} ${msg}`));
    console.error(c('dim', '\n请检查构建流程后重新构建。\n'));
    process.exit(1);
  }

  const elapsedMs = Date.now() - startTime;
  const boxWidth = 52; // 边框内部可用宽度
  const line = '─'.repeat(boxWidth);
  const printRow = (content) =>
    console.log(`${c('green', '│')} ${padLine(content, '', boxWidth - 2)} ${c('green', '│')}`);

  console.log(c('green', `┌${line}┐`));
  printRow(`✅ ${c('bold', isRelease ? 'Release 构建校验通过' : '构建产物校验通过')}`);
  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);

  targetFiles.forEach((file) => {
    const filePath = path.join(DIST_DIR, file.name);
    const size = fs.statSync(filePath).size;
    const sizeStr = size >= 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
    const left = ` ${c('cyan', '✔')} dist/${file.name}`;
    console.log(
      `${c('green', '│')} ${padLine(left, c('gray', sizeStr), boxWidth - 2)} ${c('green', '│')}`
    );
  });

  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
  const summary = `共 ${targetFiles.length} 个文件，耗时 ${elapsedMs}ms`;
  printRow(c('dim', summary));

  if (removedFiles.length > 0) {
    console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
    removedFiles.forEach((name) => {
      printRow(`${c('gray', '🧹 已清理残留文件')} dist/${name}`);
    });
  }

  if (md5FileName) {
    console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
    printRow(`${c('gray', '🔐 已生成校验和清单')} dist/${md5FileName}`);
  }

  console.log(`${c('green', '├')}${line}${c('green', '┤')}`);
  printRow(`${c('gray', '📝 已注入构建信息')}`);
  printRow(c('dim', `  Build Time: ${buildTime}`));
  printRow(c('dim', `  Version: ${buildVersion || 'unknown'}`));
  printRow(c('dim', `  Git Commit: ${gitHash || 'unknown'}`));

  console.log(c('green', `└${line}┘`));

  if (warnings.length > 0) {
    console.log(c('yellow', '\n⚠ 提示（不影响本次校验通过）：'));
    warnings.forEach((msg, idx) => console.log(`  ${c('yellow', `${idx + 1}.`)} ${msg}`));
  }

  console.log('');

  process.exit(0);
}

main();
