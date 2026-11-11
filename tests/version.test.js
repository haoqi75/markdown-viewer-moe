'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const bundled = esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'src', 'ts', 'version.ts')],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
}).outputFiles[0].text;

const moduleShim = { exports: {} };
new Function('module', 'exports', bundled)(moduleShim, moduleShim.exports);
const { compareVersions, parseVersion } = moduleShim.exports;

test('版本比较：支持 v 前缀、预发布后缀和非法格式', () => {
    assert.deepEqual(parseVersion('v1.12.1'), [1, 12, 1]);
    assert.deepEqual(parseVersion('1.12.1-beta.1'), [1, 12, 1]);
    assert.equal(parseVersion('not-a-version'), null);

    assert.equal(compareVersions('v1.12.1', '1.12.0'), 1);
    assert.equal(compareVersions('1.12.0', 'v1.12.0'), 0);
    assert.equal(compareVersions('1.9.0', '1.12.0'), -1);
    assert.equal(compareVersions('v1.12.1-beta', '1.12.0'), 1);
    assert.equal(compareVersions('bad', '1.0.0'), null);
});
