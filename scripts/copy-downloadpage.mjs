import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ESM (ES Module) 中获取 __dirname 的标准写法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义源文件和目标文件的绝对路径
// 假设 scripts 目录与 downloadpage 目录同级，或者在项目根目录下
const srcFile = path.resolve(__dirname, '../downloadpage/dist/download.html');
const destFile = path.resolve(__dirname, '../dist/download.html');

function copyFile() {
  try {
    // 1. 确保源文件存在
    if (!fs.existsSync(srcFile)) {
      console.error(`❌ Error: Source file not found at: ${srcFile}`);
      process.exit(1);
    }

    // 2. 确保目标目录存在（如果不存在则自动创建，包含多级目录）
    const destDir = path.dirname(destFile);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 3. 执行文件复制（如果目标文件已存在，会自动覆盖）
    fs.copyFileSync(srcFile, destFile);
    console.log(`\x1b[32m✓ Successfully copied download.html to ${destFile}\x1b[0m`);

  } catch (error) {
    console.error('❌ Failed to copy file:', error.message);
    process.exit(1);
  }
}

copyFile();
