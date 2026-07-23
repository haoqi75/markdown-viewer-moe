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
const browserSync = require('browser-sync').create();

const srcDir = 'src';
const distDir = 'dist';

const DEFAULTS = {
    title: '🌸 萌·Markdown 预览器',
    logo: { text: '📝 萌·Markdown', sub: 'README.md' },
    logoImage: 'img/favicon.svg',
    icon: { svg: 'img/favicon.svg', ico: 'img/favicon.ico', apple: 'img/apple-touch-icon.png' },
    footer: '[萌·Markdown](https://github.com/haoqi75/markdown-viewer-moe) | 由 ApHeQua758 与 AI 创建',
    mascot: 'img/mascot.png',
    defaultUrl: 'https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/README.md',
    aliases: {},
    tocWelcome: '欢迎来到萌·Markdown',
    toolsUrl: 'https://moe520.haoqi75.os.kg/tools.html',
    headInject: '',
    bodyInject: '',
    logoSubUseDocTitle: false
};

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
        path.join(srcDir, 'script.js')
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

function resolveImage(cfgPath, defPath, label) {
    if (cfgPath) {
        var mime = getMimeType(cfgPath);
        var uri = toDataUri(cfgPath, mime);
        if (uri) {
            console.log('✅ ' + label + ': ' + cfgPath);
            return uri;
        }
        console.warn('⚠️ ' + label + ' 配置图片不存在: ' + cfgPath + '，使用默认');
    }
    var mime = getMimeType(defPath);
    var uri = toDataUri(defPath, mime);
    if (uri) {
        console.log('✅ ' + label + '(默认): ' + defPath);
        return uri;
    }
    throw new Error('❌ ' + label + ' 默认图片不存在: ' + defPath);
}

function build() {
    checkRequiredFiles();

    // ======== 步骤 0：读取 package.json 版本号 ========
    var pkgVersion = '';
    try {
        var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        pkgVersion = pkg.version || '';
        console.log('✅ 读取版本号成功: v' + pkgVersion);
    } catch (e) {
        console.warn('⚠️ package.json 版本号读取失败: ' + e.message);
    }

    // ======== 读取 Git 更改号（短 hash）========
    var gitHash = '';
    try {
        gitHash = require('child_process').execSync('git rev-parse --short HEAD', {
            cwd: __dirname
        }).toString().trim();
        console.log('✅ 读取 Git 更改号成功: ' + gitHash);
    } catch (e) {
        console.warn('⚠️ Git 更改号读取失败: ' + e.message);
    }

    // ======== 步骤 1：读取 config.json，缺失则用默认值 ========
    var configPath = path.join(srcDir, 'config.json');
    var config;
    try {
        var raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
        console.log('✅ 读取配置成功');
    } catch (e) {
        console.warn('⚠️ config.json 读取失败: ' + e.message + '，使用全部默认值');
        config = {};
    }

    // 合并默认值（config 中存在的字段保留，缺失的补默认值）
    function mergeDefault(cfg, def) {
        if (typeof def !== 'object' || def === null) return cfg != null ? cfg : def;
        if (cfg == null || typeof cfg !== 'object') return def;
        var result = {};
        var keys = Object.keys(def);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            result[k] = (k in cfg) ? mergeDefault(cfg[k], def[k]) : def[k];
        }
        // 保留 config 中额外的自定义字段
        Object.keys(cfg).forEach(function(k) {
            if (!(k in def)) result[k] = cfg[k];
        });
        return result;
    }
    config = mergeDefault(config, DEFAULTS);
    console.log('📋 最终配置:', JSON.stringify(config, null, 2));

    // ======== 步骤 2：读取并压缩 style.css 和 script.js ========
    var styleContent = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
    var scriptContent = fs.readFileSync(path.join(srcDir, 'script.js'), 'utf8');

    var minifiedCss = new CleanCSS().minify(styleContent).styles;
    var minifiedJs = UglifyJS.minify(scriptContent).code;

    console.log('📦 CSS: ' + styleContent.length + ' → ' + minifiedCss.length + ' 字节');
    console.log('📦 JS:  ' + scriptContent.length + ' → ' + minifiedJs.length + ' 字节');

    // ======== 步骤 3：按 config 处理图标、Logo、吉祥物 ========
    var iconCfg = config.icon || {};
    var svgUri = resolveImage(iconCfg.svg, DEFAULTS.icon.svg, 'Favicon SVG');
    var icoUri = resolveImage(iconCfg.ico, DEFAULTS.icon.ico, 'Favicon ICO');
    var appleUri = resolveImage(iconCfg.apple, DEFAULTS.icon.apple, 'Apple Icon');
    var logoSrc = resolveImage(config.logoImage, DEFAULTS.logoImage, 'Logo');
    var mascotSrc = resolveImage(config.mascot, DEFAULTS.mascot, '吉祥物');

    // ---- 错误页吉祥物 ----
    var errorMascotUri = toDataUri('img/error.png', 'image/png');
    var extendedConfig = Object.assign({}, config);
    extendedConfig.version = pkgVersion;
    extendedConfig.gitHash = gitHash;
    if (errorMascotUri) {
        extendedConfig.errorMascot = errorMascotUri;
        console.log('✅ 错误页吉祥物已转为 Data URI (img/error.png)');
    } else {
        console.warn('⚠️ 错误页吉祥物图片不存在: img/error.png');
    }

    // ---- 加载页吉祥物 ----
    var loadingMascotUri = toDataUri('img/loading.png', 'image/png');
    if (loadingMascotUri) {
        extendedConfig.loadingMascot = loadingMascotUri;
        console.log('✅ 加载页吉祥物已转为 Data URI (img/loading.png)');
    } else {
        console.warn('⚠️ 加载页吉祥物图片不存在: img/loading.png');
    }

    // ---- TOC 底部装饰图 ----
    var sitDownUri = toDataUri('img/sit-down.png', 'image/png');
    if (sitDownUri) {
        console.log('✅ TOC 装饰图已转为 Data URI (img/sit-down.png)');
    } else {
        console.warn('⚠️ TOC 装饰图不存在: img/sit-down.png，将使用透明占位');
        sitDownUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    var configScript = '<script>window.__CONFIG__ = ' + JSON.stringify(extendedConfig) + ';</script>';

    // ======== 步骤 4：流式组装，生成 dist/index.html ========
    return gulp.src(path.join(srcDir, 'index.html'))
        .pipe(replace('<config-placeholder>', configScript))
        .pipe(replace(/href="img\/favicon\.svg"/g, 'href="' + svgUri + '"'))
        .pipe(replace(/href="img\/favicon\.ico"/g, 'href="' + icoUri + '"'))
        .pipe(replace(/href="img\/apple-touch-icon\.png"/g, 'href="' + appleUri + '"'))
        .pipe(replace(/src="logo-placeholder"/g, 'src="' + logoSrc + '"'))
        .pipe(replace(/src="mascot-placeholder"/g, 'src="' + mascotSrc + '"'))
        .pipe(replace(/src="sit-down-placeholder"/g, 'src="' + sitDownUri + '"'))
        .pipe(replace(/<head-inject><\/head-inject>/g, config.headInject || ''))
        .pipe(replace(/<body-inject><\/body-inject>/g, config.bodyInject || ''))
        .pipe(replace(/<link rel="manifest" href="[^"]*">/g, ''))
        .pipe(replace(/<link[^>]*href="[^"]*style\.css"[^>]*>/gi, '<style>' + minifiedCss + '</style>'))
        .pipe(replace(/<script[^>]*src="[^"]*script\.js"[^>]*><\/script>/gi, '<script>' + minifiedJs + '</script>'))
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
        server: { baseDir: distDir },
        port: 8520,
        open: false
    });
    gulp.watch(
        [srcDir + '/index.html', srcDir + '/style.css', srcDir + '/script.js', srcDir + '/config.json'],
        gulp.series(build, function(done) { browserSync.reload(); done(); })
    );
}

exports.clean = clean;
exports.build = gulp.series(clean, build);
exports.dev = gulp.series(clean, build, dev);
exports.default = exports.dev;
