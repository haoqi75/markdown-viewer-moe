const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const inline = require('gulp-inline');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const { deleteAsync } = require('del');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync').create();

const srcDir = 'src';
const distDir = 'dist';

// ============================================================
// 获取 MIME 类型
// ============================================================
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

// ============================================================
// 检查必要文件
// ============================================================
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

// ============================================================
// 验证构建产物
// ============================================================
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

// ============================================================
// 清理
// ============================================================
function clean() {
    return deleteAsync([distDir]);
}

// ============================================================
// 将文件转为 Base64 Data URI
// ============================================================
function toDataUri(filePath, mimeType) {
    const fullPath = path.join(srcDir, filePath);
    if (!fs.existsSync(fullPath)) return null;
    const data = fs.readFileSync(fullPath);
    const base64 = data.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

// ============================================================
// 构建任务
// ============================================================

function build() {
    checkRequiredFiles();

    const configPath = path.join(srcDir, 'config.json');
    let config;
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
        console.log('✅ 读取配置成功:', config);
    } catch (err) {
        throw new Error(`❌ JSON 格式错误：${err.message}`);
    }
    const configScript = `<script>window.__CONFIG__ = ${JSON.stringify(config)};</script>`;

    // ---- 处理图标路径 ----
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

    // ---- 处理 Logo 图片 ----
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
    } else {
        console.log('ℹ️ 未配置 logoImage，将使用占位符');
    }

    // 如果仍然是占位符，可以设置为一个透明 1x1 GIF 的 data URI（避免 404）
    if (logoSrc === 'logo-placeholder') {
        // 1x1 透明 GIF data URI
        logoSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        console.log('ℹ️ 使用透明占位图代替 logo');
    }

    // ---- 开始流式处理 ----
    return gulp.src(path.join(srcDir, 'index.html'))
        .pipe(replace('<config-placeholder>', configScript))
        .pipe(replace(/href="img\/favicon\.svg"/g, `href="${svgUri || 'img/favicon.svg'}"`))
        .pipe(replace(/href="img\/favicon\.ico"/g, `href="${icoUri || 'img/favicon.ico'}"`))
        .pipe(replace(/href="img\/apple-touch-icon\.png"/g, `href="${appleUri || 'img/apple-touch-icon.png'}"`))
        // 替换 Logo 图片 src
        .pipe(replace(/src="logo-placeholder"/g, `src="${logoSrc}"`))
        .pipe(replace(/<link rel="manifest" href="[^"]*">/g, ''))
        .pipe(inline({
            base: srcDir,
            js: uglify,
            css: cleanCSS,
            disabledTypes: ['svg', 'img']
        }))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(distDir))
        .on('end', verifyBuild)
        .on('error', function(err) {
            console.error('❌ 构建过程中出现错误：', err.message);
            throw err;
        });
}

// ============================================================
// 开发任务
// ============================================================
function dev() {
    browserSync.init({
        server: {
            baseDir: distDir
        },
        port: 3000,
        open: true
    });

    gulp.watch(
        [srcDir + '/index.html', srcDir + '/style.css', srcDir + '/script.js', srcDir + '/config.json'],
        gulp.series(build, function reload(done) {
            browserSync.reload();
            done();
        })
    );
}

// ============================================================
// 导出任务
// ============================================================
exports.clean = clean;
exports.build = gulp.series(clean, build);
exports.dev = gulp.series(clean, build, dev);
exports.default = exports.dev;