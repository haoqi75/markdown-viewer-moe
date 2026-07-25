// ============================================================
// release.js — dist/index.html → dist/index.release.html
// 在文件顶部插入可编辑的 JSON config 块，直接运行:
//   node script/release.js
// ============================================================

var fs = require('fs');
var path = require('path');

var inFile = path.join(__dirname, '..', 'dist', 'index.html');
var outFile = path.join(__dirname, '..', 'dist', 'index.release.html');

if (!fs.existsSync(inFile)) {
    console.error('❌ dist/index.html 不存在，请先运行 pnpm build');
    process.exit(1);
}
console.log('✅ 输入: ' + inFile);

var html = fs.readFileSync(inFile, 'utf8');

var match = html.match(/window\.__CONFIG__\s*=\s*(\{[\s\S]*?\});/);
if (!match) {
    console.error('❌ 未找到 __CONFIG__');
    process.exit(1);
}

var config;
try { config = JSON.parse(match[1]); } catch (e) {
    console.error('❌ JSON 解析失败: ' + e.message);
    process.exit(1);
}

var releaseConfig = {
    defaultUrl: config.defaultUrl || '',
    aliases: config.aliases || {}
};

// ====== 强制 toolsUrl 为远程地址（release 版固定）======
html = html.replace(/"toolsUrl"\s*:\s*"[^"]*"/, '"toolsUrl":"https://moe520.haoqi75.os.kg/tools.html"');

var block =
    '\n<!--' +
    '\n  ╔══════════════════════════════════════════════╗' +
    '\n  ║  RELEASE CONFIG — 编辑 defaultUrl 和 aliases  ║' +
    '\n  ║  修改下方 JSON 后保存，直接部署即可            ║' +
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
console.log('📝 编辑文件顶部的 JSON 即可自定义 defaultUrl 和 aliases');
