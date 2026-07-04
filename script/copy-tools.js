#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 项目根目录：script 的上一级
const projectRoot = path.resolve(__dirname, '..');

// 源文件：tools/dist/tools.html
const src = path.join(projectRoot, 'tools', 'dist', 'tools.html');
// 目标目录：dist
const destDir = path.join(projectRoot, 'dist');

// 检查命令行参数
const args = process.argv.slice(2);
const isRelease = args.includes('--release');

// 决定目标文件名
let destFileName;
if (isRelease) {
    try {
        // 读取 tools/package.json 获取版本号
        const pkgPath = path.join(projectRoot, 'tools', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (!pkg.version) {
            throw new Error('package.json 中未找到 version 字段');
        }
        destFileName = `tools-${pkg.version}.html`;
        console.log(`📌 版本：${pkg.version}，将输出带版本号的文件`);
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

// 3. 复制并覆盖
try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 成功复制：${src} -> ${dest}`);
} catch (err) {
    console.error(`❌ 复制失败：${err.message}`);
    process.exit(1);
}