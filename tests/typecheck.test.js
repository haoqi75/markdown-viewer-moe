'use strict';

const { test } = require('node:test');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

test('TypeScript：主程序类型检查通过', { timeout: 120000 }, () => {
    execFileSync(
        process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.viewer.json'],
        {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 110000,
        }
    );
});
