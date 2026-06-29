// ============================================================
// release.js — 编辑 dist/index.html → dist/index.release.html
// 用法: node script/release.js [选项]
//
// 选项:
//   --defaultUrl <url>       设置默认 Markdown 地址
//   --alias <key:url>        添加别名映射（可多次使用）
//   --aliases <json>         通过 JSON 字符串设置全部别名
//
// 示例:
//   node script/release.js --defaultUrl "https://example.com/readme.md"
//   node script/release.js --alias "index:https://a.com/x.md" --alias "docs:https://a.com/y.md"
// ============================================================

var fs = require('fs');
var path = require('path');

var inFile = path.join(__dirname, '..', 'dist', 'index.html');
var outFile = path.join(__dirname, '..', 'dist', 'index.release.html');

// 验证输入文件
if (!fs.existsSync(inFile)) {
    console.error('❌ dist/index.html 不存在，请先运行 pnpm build');
    process.exit(1);
}
console.log('✅ 输入文件: ' + inFile);

var args = process.argv.slice(2);
var options = { defaultUrl: null, aliases: null, aliasPairs: [] };

for (var i = 0; i < args.length; i++) {
    if (args[i] === '--defaultUrl' && i + 1 < args.length) {
        options.defaultUrl = args[++i];
    } else if (args[i] === '--alias' && i + 1 < args.length) {
        var pair = args[++i].split(':');
        if (pair.length >= 2) {
            options.aliasPairs.push([pair[0], pair.slice(1).join(':')]);
        } else {
            console.error('⚠️  --alias 格式错误: ' + args[i] + '，应为 key:url');
        }
    } else if (args[i] === '--aliases' && i + 1 < args.length) {
        try {
            options.aliases = JSON.parse(args[++i]);
        } catch (e) {
            console.error('⚠️  --aliases JSON 解析失败: ' + e.message);
        }
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log([
            '用法: node script/release.js [选项]',
            '',
            '  读取 dist/index.html → 修改 config → 写入 dist/index.release.html',
            '',
            '选项:',
            '  --defaultUrl <url>    设置默认 Markdown 地址',
            '  --alias <key:url>     添加别名（可多次使用）',
            '  --aliases <json>      通过 JSON 设置全部别名',
            '',
            '示例:',
            '  node script/release.js --defaultUrl "https://a.com/readme.md"',
            '  node script/release.js --alias "index:https://a.com/x.md"',
            '  node script/release.js --aliases \'{"index":"https://a.com/x.md"}\''
        ].join('\n'));
        process.exit(0);
    }
}

var html = fs.readFileSync(inFile, 'utf8');

var match = html.match(/window\.__CONFIG__\s*=\s*(\{[\s\S]*?\});/);
if (!match) {
    console.error('❌ 未在文件中找到 __CONFIG__ 配置块');
    process.exit(1);
}

var config;
try {
    config = JSON.parse(match[1]);
} catch (e) {
    console.error('❌ __CONFIG__ JSON 解析失败: ' + e.message);
    process.exit(1);
}

var changed = false;

if (options.defaultUrl) {
    config.defaultUrl = options.defaultUrl;
    changed = true;
    console.log('✅ defaultUrl: ' + options.defaultUrl);
}

if (options.aliasPairs.length > 0 || options.aliases) {
    if (!config.aliases || typeof config.aliases !== 'object') {
        config.aliases = {};
    }
    if (options.aliases) {
        Object.assign(config.aliases, options.aliases);
        changed = true;
        console.log('✅ aliases (JSON): ' + JSON.stringify(options.aliases));
    }
    for (var i = 0; i < options.aliasPairs.length; i++) {
        config.aliases[options.aliasPairs[i][0]] = options.aliasPairs[i][1];
        changed = true;
        console.log('✅ alias: ' + options.aliasPairs[i][0] + ' -> ' + options.aliasPairs[i][1]);
    }
}

if (!changed) {
    console.log('ℹ️  未提供修改参数，使用 --help 查看用法');
    process.exit(0);
}

var newScript = 'window.__CONFIG__ = ' + JSON.stringify(config) + ';';
var newHtml = html.replace(match[0], newScript);

fs.writeFileSync(outFile, newHtml, 'utf8');

// 验证输出文件
if (!fs.existsSync(outFile)) {
    console.error('❌ 输出文件创建失败: ' + outFile);
    process.exit(1);
}
console.log('✅ 已生成: ' + outFile + ' (' + fs.statSync(outFile).size + ' 字节)');
