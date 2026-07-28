#!/usr/bin/env node
/**
 * 检查运行环境：
 * 1. 输出 Node.js 版本，若主版本号低于 18 则终止运行。
 * 2. 输出 pnpm 版本，若未安装或主版本号低于 10 则终止运行。
 */

'use strict';

const { execSync } = require('child_process');

const MIN_NODE_MAJOR = 18;
const MIN_PNPM_MAJOR = 10;

function getMajorVersion(versionString) {
  const match = versionString.trim().replace(/^v/, '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : NaN;
}

function checkNodeVersion() {
  const nodeVersion = process.version; // e.g. "v20.11.0"
  console.log(`Node.js 版本: ${nodeVersion}`);

  const major = getMajorVersion(nodeVersion);
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    console.error(
      `❌ Node.js 版本过低，要求 >= ${MIN_NODE_MAJOR}，当前为 ${nodeVersion}`
    );
    process.exit(1);
  }
}

function checkPnpmVersion() {
  let pnpmVersion;
  try {
    pnpmVersion = execSync('pnpm --version', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    console.error('❌ 未检测到 pnpm，请先安装 pnpm (要求版本 >= ' + MIN_PNPM_MAJOR + ')');
    process.exit(1);
  }

  console.log(`pnpm 版本: ${pnpmVersion}`);

  const major = getMajorVersion(pnpmVersion);
  if (Number.isNaN(major) || major < MIN_PNPM_MAJOR) {
    console.error(
      `❌ pnpm 版本过低，要求 >= ${MIN_PNPM_MAJOR}，当前为 ${pnpmVersion}`
    );
    process.exit(1);
  }
}

function checkGitVersion() {
  let gitVersionOutput;
  try {
    gitVersionOutput = execSync('git --version', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    console.error('❌ 未检测到 Git，请先安装 Git');
    process.exit(1);
  }

  console.log(gitVersionOutput);
}

function main() {
  checkNodeVersion();
  checkPnpmVersion();
  checkGitVersion();
  console.log('✅ 环境检查通过');
}

main();
