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

function build() {
    checkRequiredFiles();

    // 读取配置并解析 JSON，捕获格式错误
    const configPath = path.join(srcDir, 'config.json');
    let config;
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
    } catch (err) {
        throw new Error(`❌ JSON 格式错误：${err.message}`);
    }

    const configScript = `<script>window.__CONFIG__ = ${JSON.stringify(config)};</script>`;

    return gulp.src(path.join(srcDir, 'index.html'))
        .pipe(replace('<config-placeholder>', configScript))  // 使用自定义标签代替注释
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

exports.clean = clean;
exports.build = gulp.series(clean, build);
exports.dev = gulp.series(clean, build, dev);
exports.default = exports.dev;