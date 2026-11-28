#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fileToDataUri(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let mime = 'image/png';

    if (ext === '.svg') mime = 'image/svg+xml';
    else if (ext === '.ico') mime = 'image/x-icon';

    const data = fs.readFileSync(filePath);
    return `data:${mime};base64,${data.toString('base64')}`;
}

function injectIntoHead(html, tags) {
    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex === -1) {
        console.warn('⚠️ HTML 中未找到 </head>，跳过注入。');
        return html;
    }
    return html.slice(0, headCloseIndex) + '\n' + tags.join('\n') + '\n' + html.slice(headCloseIndex);
}

const projectRoot = path.resolve(__dirname, '..');
const src = path.join(projectRoot, 'tools', 'dist', 'tools.html');
const destDir = path.join(projectRoot, 'dist');
const iconPath = path.join(projectRoot, 'tools', 'public', 'icon.png');

const args = process.argv.slice(2);
const isRelease = args.includes('--release');

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

if (!fs.existsSync(src)) {
    console.error(`❌ 错误：找不到源文件 ${src}`);
    process.exit(1);
}

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`📁 已创建文件夹：${destDir}`);
}

let iconTags = [];
if (fs.existsSync(iconPath)) {
    iconTags.push(`<link rel="icon" type="image/png" href="${fileToDataUri(iconPath)}">`);
    console.log(`✅ 准备注入 Tools 图标：${iconPath}`);
} else {
    console.warn(`⚠️ 未找到 Tools 图标，跳过图标注入：${iconPath}`);
}

try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 已复制：${src} -> ${dest}`);
} catch (err) {
    console.error(`❌ 复制失败：${err.message}`);
    process.exit(1);
}

if (iconTags.length > 0) {
    try {
        const htmlContent = fs.readFileSync(dest, 'utf-8');
        fs.writeFileSync(dest, injectIntoHead(htmlContent, iconTags), 'utf-8');
        console.log('🔧 已向 <head> 注入 Tools 图标');
    } catch (err) {
        console.error(`❌ 图标注入失败：${err.message}`);
        process.exit(1);
    }
}

console.log(`🎉 全部完成：${dest}`);
