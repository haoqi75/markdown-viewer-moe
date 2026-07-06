#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ====== 工具函数 ======

/**
 * 读取文件并返回 Base64 Data URI（保留原始格式）
 */
function fileToDataUri(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let mime;

    switch (ext) {
        case '.svg': mime = 'image/svg+xml'; break;
        case '.ico': mime = 'image/x-icon';  break;
        case '.png': mime = 'image/png';     break;
        default:     mime = 'image/png';
    }

    const data = fs.readFileSync(filePath);
    const base64 = data.toString('base64');
    return `data:${mime};base64,${base64}`;
}

/**
 * 在 HTML 的 </head> 前注入标签
 */
function injectIntoHead(html, tags) {
    const headCloseIndex = html.lastIndexOf('</head>');
    if (headCloseIndex === -1) {
        console.warn('⚠️ HTML 中未找到 </head>，跳过注入。');
        return html;
    }
    return html.slice(0, headCloseIndex) + '\n' + tags.join('\n') + '\n' + html.slice(headCloseIndex);
}

// ====== 主逻辑 ======

const projectRoot = path.resolve(__dirname, '..');
const src = path.join(projectRoot, 'tools', 'dist', 'tools.html');
const destDir = path.join(projectRoot, 'dist');
const configPath = path.join(projectRoot, 'src', 'config.json');

const args = process.argv.slice(2);
const isRelease = args.includes('--release');

// 确定目标文件名
let destFileName;
if (isRelease) {
    try {
        const pkgPath = path.join(projectRoot, 'tools', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (!pkg.version) throw new Error('package.json 中未找到 version 字段');
        destFileName = `tools-v${pkg.version}.html`;
        console.log(`📌 版本：${pkg.version}，输出带版本号的文件`);
    } catch (err) {
        console.error(`❌ 无法读取版本号：${err.message}`);
        process.exit(1);
    }
} else {
    destFileName = 'tools.html';
}

const dest = path.join(destDir, destFileName);

// 1. 检查源文件
if (!fs.existsSync(src)) {
    console.error(`❌ 错误：找不到源文件 ${src}`);
    process.exit(1);
}

// 2. 确保目标目录存在
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`📁 已创建文件夹：${destDir}`);
}

// 3. 读取图标配置
let iconTags = [];
if (fs.existsSync(configPath)) {
    try {
        const configDir = path.dirname(configPath); // config.json 所在目录（src/）
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        // 获取图标配置：优先使用嵌套对象 config.icon，如果不存在则退化为扁平键
        let iconCfg = config.icon || {};
        // 兼容扁平键（如 "icon.svg" 等），覆盖空对象
        if (!iconCfg.svg && config['icon.svg']) iconCfg.svg = config['icon.svg'];
        if (!iconCfg.ico && config['icon.ico']) iconCfg.ico = config['icon.ico'];
        if (!iconCfg.apple && config['icon.apple']) iconCfg.apple = config['icon.apple'];

        const iconDefs = [
            {
                key: 'icon.svg (config.icon.svg)',
                relPath: iconCfg.svg,
                rel: 'icon',
                mime: 'image/svg+xml',
                defaultPath: 'img/favicon.svg'
            },
            {
                key: 'icon.ico (config.icon.ico)',
                relPath: iconCfg.ico,
                rel: 'icon',
                mime: 'image/x-icon',
                defaultPath: 'img/favicon.ico'
            },
            {
                key: 'icon.apple (config.icon.apple)',
                relPath: iconCfg.apple,
                rel: 'apple-touch-icon',
                mime: undefined,
                defaultPath: 'img/apple-touch-icon.png'
            }
        ];

        for (const { key, relPath, rel, mime, defaultPath } of iconDefs) {
            if (!relPath) {
                const expectedAbsolute = path.resolve(configDir, defaultPath);
                console.log(`ℹ️ 未配置 "${key}" 图标路径，跳过。文件路径："${expectedAbsolute}"`);
                continue;
            }

            // 基于 config.json 目录解析相对路径
            const absolutePath = path.resolve(configDir, relPath);
            if (!fs.existsSync(absolutePath)) {
                console.warn(`⚠️ 图标文件不存在，跳过：${absolutePath}`);
                continue;
            }

            const dataUri = fileToDataUri(absolutePath);
            const typeAttr = mime ? ` type="${mime}"` : '';
            const tag = `<link rel="${rel}"${typeAttr} href="${dataUri}">`;
            iconTags.push(tag);
            console.log(`✅ 准备注入 "${key}" 图标：${relPath}`);
        }
    } catch (err) {
        console.error(`❌ 读取图标配置失败：${err.message}`);
        process.exit(1);
    }
} else {
    console.warn('⚠️ 未找到 src/config.json，跳过图标注入。');
}

// 4. 复制 HTML 文件
try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 已复制：${src} -> ${dest}`);
} catch (err) {
    console.error(`❌ 复制失败：${err.message}`);
    process.exit(1);
}

// 5. 注入图标
if (iconTags.length > 0) {
    try {
        let htmlContent = fs.readFileSync(dest, 'utf-8');
        const newHtml = injectIntoHead(htmlContent, iconTags);
        fs.writeFileSync(dest, newHtml, 'utf-8');
        console.log('🔧 已向 <head> 注入网站图标标签（保留原始格式）');
    } catch (err) {
        console.error(`❌ 注入失败：${err.message}`);
        process.exit(1);
    }
} else {
    console.log('ℹ️ 没有需要注入的图标，跳过修改。');
}

console.log('🎉 全部完成！');