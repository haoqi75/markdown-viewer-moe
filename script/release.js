// ============================================================
// release.js — 直接编辑 dist/index.html 的 defaultUrl 和 aliases
// 用法: node script/release.js [选项]
//
// 选项:
//   --defaultUrl <url>       设置默认 Markdown 地址
//   --alias <key:url>        添加别名映射（可多次使用）
//   --aliases <json>         通过 JSON 字符串设置全部别名
//   --out <path>             输出路径（默认: dist/index.html）
//   --in  <path>             输入路径（默认: dist/index.html）
//
// 示例:
//   node script/release.js --defaultUrl "https://example.com/readme.md"
//   node script/release.js --alias "index:https://example.com/a.md" --alias "docs:https://example.com/b.md"
// ============================================================

var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);
var options = { defaultUrl: null, aliases: null, aliasPairs: [], inFile: null, outFile: null };

for (var i = 0; i < args.length; i++) {
    if (args[i] === '--defaultUrl' && i + 1 < args.length) {
        options.defaultUrl = args[++i];
    } else if (args[i] === '--alias' && i + 1 < args.length) {
        var pair = args[++i].split(':');
        if (pair.length >= 2) {
            var key = pair[0];
            var val = pair.slice(1).join(':');
            options.aliasPairs.push([key, val]);
        } else {
            console.error('⚠️  --alias 格式错误，应为 key:url，已跳过: ' + args[i]);
        }
    } else if (args[i] === '--aliases' && i + 1 < args.length) {
        try {
            options.aliases = JSON.parse(args[++i]);
        } catch (e) {
            console.error('⚠️  --aliases JSON 解析失败: ' + e.message);
        }
    } else if (args[i] === '--in' && i + 1 < args.length) {
        options.inFile = args[++i];
    } else if (args[i] === '--out' && i + 1 < args.length) {
        options.outFile = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log([
            '用法: node script/release.js [选项]',
            '',
            '选项:',
            '  --defaultUrl <url>    设置默认 Markdown 地址',
            '  --alias <key:url>     添加别名（可多次使用）',
            '  --aliases <json>      通过 JSON 设置全部别名',
            '  --in  <path>          输入文件（默认 dist/index.html）',
            '  --out <path>          输出文件（默认同输入）',
            '',
            '示例:',
            '  # 修改默认地址',
            '  node script/release.js --defaultUrl "https://a.com/readme.md"',
            '',
            '  # 添加多个别名',
            '  node script/release.js --alias "index:https://a.com/x.md" --alias "docs:https://a.com/y.md"',
            '',
            '  # JSON 方式设置别名',
            '  node script/release.js --aliases \'{"index":"https://a.com/x.md"}\'',
            '',
            '  # 输出到新文件',
            '  node script/release.js --defaultUrl "..." --out dist/release.html'
        ].join('\n'));
        process.exit(0);
    }
}

var inFile = options.inFile || path.join(__dirname, '..', 'dist', 'index.html');
var outFile = options.outFile || inFile;

if (!fs.existsSync(inFile)) {
    console.error('❌ 输入文件不存在: ' + inFile);
    console.error('   请先运行 pnpm build 构建项目');
    process.exit(1);
}

var html = fs.readFileSync(inFile, 'utf8');

// 找到 __CONFIG__ 并解析
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

// 修改 defaultUrl
if (options.defaultUrl) {
    if (config.defaultUrl !== options.defaultUrl) {
        config.defaultUrl = options.defaultUrl;
        changed = true;
        console.log('✅ defaultUrl 已更新: ' + options.defaultUrl);
    } else {
        console.log('ℹ️  defaultUrl 未变化');
    }
}

// 合并别名
if (options.aliasPairs.length > 0 || options.aliases) {
    if (!config.aliases || typeof config.aliases !== 'object') {
        config.aliases = {};
    }
    if (options.aliases) {
        Object.assign(config.aliases, options.aliases);
        changed = true;
        console.log('✅ aliases 已合并 (JSON): ' + JSON.stringify(options.aliases));
    }
    for (var i = 0; i < options.aliasPairs.length; i++) {
        config.aliases[options.aliasPairs[i][0]] = options.aliasPairs[i][1];
        changed = true;
        console.log('✅ alias 已添加: ' + options.aliasPairs[i][0] + ' -> ' + options.aliasPairs[i][1]);
    }
}

if (!changed) {
    console.log('ℹ️  未提供任何修改参数，文件未更改。使用 --help 查看用法。');
    process.exit(0);
}

// 替换
var newScript = 'window.__CONFIG__ = ' + JSON.stringify(config) + ';';
var newHtml = html.replace(match[0], newScript);

fs.writeFileSync(outFile, newHtml, 'utf8');
console.log('✅ 已写入: ' + outFile);
