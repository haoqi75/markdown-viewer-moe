const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const { deleteAsync } = require('del');
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');

const srcDir = 'src';
const distDir = 'dist';

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp'
    };
    return map[ext] || 'image/png';
}

function checkRequiredFiles() {
    const required = [
        path.join(srcDir, 'index.html'),
        path.join(srcDir, 'style.css'),
        path.join(srcDir, 'script.js'),
        path.join(srcDir, 'config.json')
    ];
    const missing = required.filter(file => !fs.existsSync(file));
    if (missing.length) {
        throw new Error(
            `❌ 构建失败：缺少以下必要文件：\n${missing.map(f => `  - ${f}`).join('\n')}`
        );
    }
    console.log('✅ 所有必要文件检查通过');
}

function verifyBuild() {
    const outputPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(outputPath)) {
        throw new Error(`❌ 构建产物缺失：${outputPath}`);
    }
    const content = fs.readFileSync(outputPath, 'utf8');
    if (!content.includes('__CONFIG__')) {
        throw new Error('❌ 构建产物缺少 __CONFIG__ 配置注入');
    }
    if (!content.includes('marked')) {
        throw new Error('❌ 构建产物可能缺少 marked 库（未找到 marked）');
    }
    if (!content.includes('.card') && !content.includes('--moe-pink') && !content.includes('<style')) {
        throw new Error('❌ 构建产物可能缺少样式（未找到 .card / CSS变量 / <style>）');
    }
    console.log('✅ 构建产物验证通过');
}

function clean() {
    return deleteAsync([distDir]);
}

function toDataUri(filePath, mimeType) {
    const fullPath = path.join(srcDir, filePath);
    if (!fs.existsSync(fullPath)) return null;
    const data = fs.readFileSync(fullPath);
    const base64 = data.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

function build() {
    checkRequiredFiles();

    // ======== 步骤 1：读取 config.json ========
    const configPath = path.join(srcDir, 'config.json');
    let config;
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
        console.log('✅ 读取配置成功:', config);
    } catch (err) {
        throw new Error(`❌ JSON 格式错误：${err.message}`);
    }

    // ======== 步骤 2：读取并压缩 style.css 和 script.js ========
    const styleContent = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
    const scriptContent = fs.readFileSync(path.join(srcDir, 'script.js'), 'utf8');

    const minifiedCss = new CleanCSS().minify(styleContent).styles;
    const minifiedJs = UglifyJS.minify(scriptContent).code;

    console.log(`📦 CSS: ${styleContent.length} → ${minifiedCss.length} 字节`);
    console.log(`📦 JS:  ${scriptContent.length} → ${minifiedJs.length} 字节`);

    // ======== 步骤 3：处理图标、Logo、吉祥物 (按 config 填写) ========
    const defaultIcon = {
        svg: 'img/favicon.svg',
        ico: 'img/favicon.ico',
        apple: 'img/apple-touch-icon.png'
    };
    const iconPaths = config.icon || {};
    const svgPath = iconPaths.svg || defaultIcon.svg;
    const icoPath = iconPaths.ico || defaultIcon.ico;
    const applePath = iconPaths.apple || defaultIcon.apple;

    const svgUri = toDataUri(svgPath, 'image/svg+xml');
    const icoUri = toDataUri(icoPath, 'image/x-icon');
    const appleUri = toDataUri(applePath, 'image/png');

    const logoPath = config.logoImage || null;
    let logoSrc = 'logo-placeholder';
    if (logoPath) {
        const mime = getMimeType(logoPath);
        const dataUri = toDataUri(logoPath, mime);
        if (dataUri) {
            logoSrc = dataUri;
            console.log(`✅ Logo 图片已转为 Data URI (${logoPath})`);
        } else {
            console.warn(`⚠️ Logo 图片文件不存在: ${logoPath}，将使用占位符`);
        }
    }
    if (logoSrc === 'logo-placeholder') {
        logoSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        console.log('ℹ️ 使用透明占位图代替 logo');
    }

    const mascotPath = config.mascot || null;
    let mascotSrc = 'mascot-placeholder';
    if (mascotPath) {
        const mime = getMimeType(mascotPath);
        const dataUri = toDataUri(mascotPath, mime);
        if (dataUri) {
            mascotSrc = dataUri;
            console.log(`✅ 吉祥物图片已转为 Data URI (${mascotPath})`);
        } else {
            console.warn(`⚠️ 吉祥物图片文件不存在: ${mascotPath}，将使用占位符`);
        }
    }
    if (mascotSrc === 'mascot-placeholder') {
        mascotSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        console.log('ℹ️ 使用透明占位图代替吉祥物');
    }

    // ---- 错误页吉祥物 ----
    const errorMascotUri = toDataUri('img/error.png', 'image/png');
    const extendedConfig = Object.assign({}, config);
    if (errorMascotUri) {
        extendedConfig.errorMascot = errorMascotUri;
        console.log('✅ 错误页吉祥物已转为 Data URI (img/error.png)');
    } else {
        console.warn('⚠️ 错误页吉祥物图片不存在: img/error.png');
    }
    const configScript = `<script>window.__CONFIG__ = ${JSON.stringify(extendedConfig)};</script>`;

    // ======== 步骤 4：流式组装，生成 dist/index.html ========
    return gulp.src(path.join(srcDir, 'index.html'))
        .pipe(replace('<config-placeholder>', configScript))
        .pipe(replace(/href="img\/favicon\.svg"/g, `href="${svgUri || 'img/favicon.svg'}"`))
        .pipe(replace(/href="img\/favicon\.ico"/g, `href="${icoUri || 'img/favicon.ico'}"`))
        .pipe(replace(/href="img\/apple-touch-icon\.png"/g, `href="${appleUri || 'img/apple-touch-icon.png'}"`))
        .pipe(replace(/src="logo-placeholder"/g, `src="${logoSrc}"`))
        .pipe(replace(/src="mascot-placeholder"/g, `src="${mascotSrc}"`))
        .pipe(replace(/<link rel="manifest" href="[^"]*">/g, ''))
        .pipe(replace(/<link[^>]*href="[^"]*style\.css"[^>]*>/gi, `<style>${minifiedCss}</style>`))
        .pipe(replace(/<script[^>]*src="[^"]*script\.js"[^>]*><\/script>/gi, `<script>${minifiedJs}</script>`))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(distDir))
        .on('end', verifyBuild)
        .on('error', function(err) {
            console.error('❌ 构建过程中出现错误：', err.message);
            throw err;
        });
}

exports.clean = clean;
exports.build = gulp.series(clean, build);
exports.default = exports.build;
