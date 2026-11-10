#!/usr/bin/env node
'use strict';

/**
 * 运行 tests/ 下的全部测试，并在仓库根目录生成 validation.txt。
 *
 * 用法:
 *   node scripts/run-tests.js
 *   pnpm test
 *
 * validation.txt 已被 .gitignore 忽略，用于本地/CI 留档。
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const VALIDATION_FILE = path.join(ROOT, 'validation.txt');
const TEST_DIR = path.join(ROOT, 'tests');

function readPackageJson() {
    try {
        return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    } catch (error) {
        return {};
    }
}

function getGitHash() {
    try {
        return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (error) {
        return 'unknown';
    }
}

function stripAnsi(value) {
    return value.replace(/\x1b\[[0-9;]*m/g, '');
}

function parseSummary(output) {
    const text = stripAnsi(output);
    const numeric = (name) => {
        const match = text.match(new RegExp('(?:ℹ|i)\\s*' + name + '\\s+(\\d+(?:\\.\\d+)?)'));
        return match ? match[1] : 'unknown';
    };
    return {
        tests: numeric('tests'),
        suites: numeric('suites'),
        pass: numeric('pass'),
        fail: numeric('fail'),
        cancelled: numeric('cancelled'),
        skipped: numeric('skipped'),
        todo: numeric('todo'),
        duration: numeric('duration_ms'),
    };
}

function parseTestCases(output) {
    const seen = new Set();
    return stripAnsi(output)
        .split(/\r?\n/)
        .filter((line) => /^\s*[✔✖✗]\s+/.test(line))
        .map((line) => line.trim())
        .filter((line) => !/^[✖✗]\s+failing tests:/i.test(line))
        .filter((line) => {
            if (seen.has(line)) return false;
            seen.add(line);
            return true;
        });
}

function writeValidation(output, exitCode, signal) {
    const pkg = readPackageJson();
    const gitHash = getGitHash();
    const summary = parseSummary(output);
    const cases = parseTestCases(output);
    const passed = exitCode === 0;
    const timestamp = new Date().toISOString();
    const pnpmVersion = typeof pkg.packageManager === 'string'
        ? pkg.packageManager.replace(/^pnpm@/, '').split('+')[0]
        : 'unknown';

    const lines = [
        '# Moe Markdown Viewer — Test Validation',
        '',
        `Generated: ${timestamp}`,
        `Project: ${pkg.name || 'unknown'} v${pkg.version || 'unknown'}`,
        `Git commit: ${gitHash}`,
        `Node.js: ${process.version}`,
        `pnpm: ${pnpmVersion}`,
        `Command: node --test --test-reporter=spec --test-concurrency=1 tests`,
        `Result: ${passed ? 'PASS' : 'FAIL'}`,
        `Exit code: ${exitCode === null ? 'null' : exitCode}${signal ? ` (signal: ${signal})` : ''}`,
        '',
        '## Summary',
        '',
        `tests: ${summary.tests}`,
        `suites: ${summary.suites}`,
        `pass: ${summary.pass}`,
        `fail: ${summary.fail}`,
        `cancelled: ${summary.cancelled}`,
        `skipped: ${summary.skipped}`,
        `todo: ${summary.todo}`,
        `duration_ms: ${summary.duration}`,
        '',
        '## Test cases',
        '',
    ];

    if (cases.length > 0) {
        lines.push(...cases.map((line) => `- ${line}`));
    } else {
        lines.push('- 未能从测试输出中解析出测试用例');
    }

    if (!passed) {
        const tail = stripAnsi(output).trim().split(/\r?\n/).slice(-120);
        lines.push('', '## Output (last 120 lines)', '', '```text', ...tail, '```');
    }

    fs.writeFileSync(VALIDATION_FILE, lines.join('\n') + '\n', 'utf8');
    console.log(`\n📄 测试验证文件已生成: ${path.relative(ROOT, VALIDATION_FILE)}`);
}

function main() {
    if (!fs.existsSync(TEST_DIR)) {
        console.error('❌ 未找到 tests/ 目录');
        process.exit(1);
    }

    const args = [
        '--test',
        '--test-reporter=spec',
        '--test-concurrency=1',
        'tests',
    ];

    const child = spawn(process.execPath, args, {
        cwd: ROOT,
        stdio: ['inherit', 'pipe', 'pipe'],
    });

    let output = '';
    let finalized = false;

    function finalize(exitCode, signal) {
        if (finalized) return;
        finalized = true;
        try {
            writeValidation(output, exitCode, signal);
        } catch (error) {
            console.error(`⚠️ 生成 validation.txt 失败: ${error.message}`);
        }
        process.exitCode = exitCode === 0 ? 0 : 1;
    }

    child.stdout.on('data', (chunk) => {
        output += chunk.toString();
        process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
        output += chunk.toString();
        process.stderr.write(chunk);
    });

    child.on('close', (code, signal) => finalize(code, signal));
    child.on('error', (error) => {
        output += `\n[无法启动测试进程] ${error.message}\n`;
        console.error(`❌ 无法启动测试进程: ${error.message}`);
        finalize(1, null);
    });
}

main();
