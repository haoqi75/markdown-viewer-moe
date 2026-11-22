// ============================================================
// release.js — dist/index.html → dist/index.release.html
// 在文件顶部插入可编辑的 JSON config 块，直接运行:
//   node script/release.js
// ============================================================

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var inFile = path.join(__dirname, '..', 'dist', 'index.html');
var outFile = path.join(__dirname, '..', 'dist', 'index.release.html');

if (!fs.existsSync(inFile)) {
    console.error('❌ dist/index.html 不存在，请先运行 pnpm build');
    process.exit(1);
}
console.log('✅ 输入: ' + inFile);

var html = fs.readFileSync(inFile, 'utf8');

var configIndex = html.indexOf('window.__CONFIG__');
if (configIndex === -1) {
    console.error('❌ 未找到 __CONFIG__');
    process.exit(1);
}

var scriptStart = html.lastIndexOf('<script', configIndex);
var scriptEnd = html.indexOf('</script>', configIndex);
if (scriptStart === -1 || scriptEnd === -1) {
    console.error('❌ 未找到 __CONFIG__ 所在的 <script> 标签');
    process.exit(1);
}

var contentStart = html.indexOf('>', scriptStart) + 1;
var configScript = html.slice(contentStart, scriptEnd);
var sandbox = { window: {} };
var config;
try {
    // __CONFIG__ 可能是合法 JSON，也可能被 Terser 压缩成等价的 JS 对象字面量
    vm.runInNewContext(configScript, sandbox, { timeout: 1000 });
    config = sandbox.window.__CONFIG__;
} catch (e) {
    console.error('❌ 配置解析失败: ' + e.message);
    process.exit(1);
}
if (!config || typeof config !== 'object' || Array.isArray(config)) {
    console.error('❌ 配置解析失败: __CONFIG__ 不是对象');
    process.exit(1);
}

// showRawCopyButton 暂不开放给 Release 配置；它由构建时的 src/config.json 决定
var releaseConfig = {
    type: 'release',
    title: config.title || '',
    defaultUrl: config.defaultUrl || '',
    aliases: config.aliases || {},
    theme: config.theme || 'pink'
};

// ====== 强制 toolsUrl 为远程地址（release 版固定）======
// 同时兼容 "toolsUrl":"..." 和 Terser 压缩后的 toolsUrl:"..."
html = html.replace(
    /(["']?toolsUrl["']?\s*:\s*)(["'])[^"']*\2/,
    '$1$2https://moe520.cc.cd/tools.html$2'
);

var block =
    '\n<!--' +
    '\n  ╔══════════════════════════════════════════════╗' +
    '\n  ║  RELEASE CONFIG — 编辑 title/defaultUrl/aliases/theme/type ║' +
    '\n  ║  修改下方 JSON 后保存，直接部署即可               ║' +
    '\n  ╚══════════════════════════════════════════════╝' +
    '\n-->' +
    '\n<script id="release-config" type="application/json">' +
    '\n' + JSON.stringify(releaseConfig, null, 2) +
    '\n</script>' +
    '\n<!-- RELEASE CONFIG END -->\n';

var newHtml = html.replace(/^/, block);

fs.writeFileSync(outFile, newHtml, 'utf8');

if (!fs.existsSync(outFile)) {
    console.error('❌ 写入失败: ' + outFile);
    process.exit(1);
}
console.log('✅ 已生成: ' + outFile + ' (' + fs.statSync(outFile).size + ' 字节)');
console.log('📝 编辑文件顶部的 JSON 即可自定义 title、defaultUrl、aliases 和 theme');
