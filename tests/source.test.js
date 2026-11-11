'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const THEMES = ['pink', 'blue', 'green', 'purple', 'white', 'yellow'];

test('配置：src/config.json 结构有效', () => {
    const config = JSON.parse(read('src/config.json'));

    assert.equal(config.type, 'normal');
    assert.equal(typeof config.title, 'string');
    assert.match(config.defaultUrl, /^https?:\/\//);
    assert.ok(THEMES.includes(config.theme), 'theme 必须是支持的六种主题之一');
    assert.ok(config.aliases && typeof config.aliases === 'object' && !Array.isArray(config.aliases));

    for (const [name, url] of Object.entries(config.aliases)) {
        assert.ok(name.length > 0, '别名不能为空');
        assert.match(url, /^https?:\/\//, `别名 ${name} 必须是 http(s) 地址`);
    }
});

test('关于页源码：内容和占位符齐全', () => {
    const source = read('src/about.html');

    assert.match(source, /<!--\s*ABOUT_CONTENT_START\s*-->/);
    assert.match(source, /<!--\s*ABOUT_CONTENT_END\s*-->/);
    assert.match(source, /id="about-page-style"/);
    assert.match(source, /class="about-env"/);
    assert.match(source, /src="img\/favicon\.svg"/);
    assert.match(source, /id="about-check-update"/);
    assert.match(source, /id="about-update-status"/);

    for (const placeholder of [
        '__VERSION_DISPLAY__',
        '__NODE_VERSION__',
        '__PNPM_VERSION__',
        '__GULP_VERSION__',
        '__GIT_HASH__',
    ]) {
        assert.ok(source.includes(placeholder), `缺少占位符 ${placeholder}`);
    }
});

test('主页面：关于页入口和模板占位符存在', () => {
    const source = read('src/index.html');

    assert.match(source, /href="\?p=about"/);
    assert.match(source, /id="about-link"/);
    assert.match(source, /<about-page-template><\/about-page-template>/);
});

test('样式：SCSS 入口已接入 gulp 构建', () => {
    const gulpSource = read('gulpfile.js');

    assert.ok(fs.existsSync(path.join(ROOT, 'src', 'style.scss')), '缺少 src/style.scss');

    for (const partial of [
        '_base.scss',
        '_decorations.scss',
        '_toc.scss',
        '_content.scss',
        '_responsive.scss',
        '_callouts.scss',
        '_image-preview.scss',
    ]) {
        assert.ok(
            fs.existsSync(path.join(ROOT, 'src', 'styles', partial)),
            `缺少 src/styles/${partial}`
        );
    }

    assert.match(gulpSource, /require\('sass'\)/);
    assert.match(gulpSource, /sass\.compile/);
    assert.match(gulpSource, /require\('esbuild'\)/);
    assert.match(gulpSource, /esbuild\.buildSync/);
});

test('TypeScript：主程序模块拆分齐全', () => {
    const modules = [
        'types.ts',
        'globals.d.ts',
        'dom.ts',
        'config.ts',
        'router.ts',
        'toc.ts',
        'render-utils.ts',
        'about-page.ts',
        'renderer.ts',
        'version.ts',
        'update-checker.ts',
        'main.ts',
    ];

    for (const moduleName of modules) {
        assert.ok(
            fs.existsSync(path.join(ROOT, 'src', 'ts', moduleName)),
            `缺少 src/ts/${moduleName}`
        );
    }

    const tsconfig = JSON.parse(read('tsconfig.viewer.json'));
    assert.equal(tsconfig.compilerOptions.strict, true);
});

test('路由与渲染：关键行为没有退化', () => {
    const router = read('src/ts/router.ts');
    const renderer = read('src/ts/renderer.ts');
    const main = read('src/ts/main.ts');
    const renderUtils = read('src/ts/render-utils.ts');
    const aboutPage = read('src/ts/about-page.ts');
    const updateChecker = read('src/ts/update-checker.ts');

    assert.ok(router.includes("pParam.toLowerCase() === 'about'"));
    assert.ok(router.includes('ABOUT_PAGE'));
    assert.match(aboutPage, /export function renderAbout\s*\(/);
    assert.ok(aboutPage.includes('template.content.cloneNode(true)'));
    assert.match(renderer, /breaks:\s*false/, 'marked 必须保持 GitHub 风格：breaks: false');
    assert.ok(main.includes('history.scrollRestoration = \'manual\''));
    assert.ok(renderUtils.includes("img.closest('a')"), '图片预览应跳过链接内的图片');
    assert.ok(updateChecker.includes('api.github.com/repos/'));
    assert.ok(updateChecker.includes('rate-limit'));
    assert.ok(updateChecker.includes('60'));
});

test('工程配置：pnpm test 与工具链版本已声明', () => {
    const pkg = JSON.parse(read('package.json'));
    const nvmrc = read('.nvmrc').trim();

    assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    assert.equal(typeof pkg.scripts.test, 'string');
    assert.match(pkg.scripts.test, /run-tests\.js/);
    assert.match(pkg.scripts.typecheck, /tsc --noEmit/);
    assert.match(pkg.scripts['build:page'], /pnpm typecheck/);

    const testRunner = read('scripts/run-tests.js');
    assert.ok(testRunner.includes("'--test'"), '测试包装脚本应调用 node --test');
    assert.ok(testRunner.includes('validation.txt'), '测试包装脚本应生成 validation.txt');

    assert.match(pkg.packageManager, /^pnpm@\d+\.\d+\.\d+/);
    assert.match(nvmrc, /^v\d+\.\d+\.\d+$/);
});
