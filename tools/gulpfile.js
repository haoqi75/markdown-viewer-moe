import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Gulp task to compile the React app and bundle it into a single tools.html file
function buildSingleHtml(cb) {
  try {
    console.log('正在执行 Vite 生产环境编译...');
    // Run build with automatic fallback between pnpm and npm
    try {
      execSync('pnpm run build', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ pnpm 执行失败或未找到，正在尝试使用 npm 运行编译...');
      execSync('npm run build', { stdio: 'inherit' });
    }

    console.log('编译成功！正在将 JS 和 CSS 文件注入单个 tools.html...');

    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const version = pkg.version || '1.3.1';
    console.log(`读取 package.json 版本号: ${version}`);

    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      throw new Error('未找到编译生成物 dist/index.html，请确保 Vite 正常编译！');
    }

    let htmlContent = fs.readFileSync(indexPath, 'utf-8');

    // Find and inline all link tags for CSS
    // Matches patterns like: <link rel="stylesheet" crossorigin href="/assets/index-Bf6N0B-j.css">
    const cssRegex = /<link[^>]*href=["']\/assets\/([^"']+\.css)["'][^>]*>/g;
    let cssMatch;
    let cssContent = '';

    while ((cssMatch = cssRegex.exec(htmlContent)) !== null) {
      const cssFileName = cssMatch[1];
      const cssFilePath = path.join(distPath, 'assets', cssFileName);
      if (fs.existsSync(cssFilePath)) {
        cssContent += '\n' + fs.readFileSync(cssFilePath, 'utf-8');
      }
    }

    // Replace the link stylesheet tag(s) with an inline <style> block using a function to avoid special "$" char replacement issue
    htmlContent = htmlContent.replace(cssRegex, '');
    htmlContent = htmlContent.replace('</head>', () => `<style>${cssContent}</style>\n</head>`);

    // Find and inline script tags
    // Matches patterns like: <script type="module" crossorigin src="/assets/index-ChT_X6Z2.js"></script>
    const jsRegex = /<script[^>]*src=["']\/assets\/([^"']+\.js)["'][^>]*><\/script>/g;
    let jsMatch;
    let jsContent = '';

    while ((jsMatch = jsRegex.exec(htmlContent)) !== null) {
      const jsFileName = jsMatch[1];
      const jsFilePath = path.join(distPath, 'assets', jsFileName);
      if (fs.existsSync(jsFilePath)) {
        jsContent += '\n' + fs.readFileSync(jsFilePath, 'utf-8');
      }
    }

    // Convert public/icon.png to Base64 and inline it into the Javascript / HTML contents
    const iconPath = path.join(process.cwd(), 'public', 'icon.png');
    if (fs.existsSync(iconPath)) {
      console.log('正在将 public/icon.png 转换为 Base64 并打包注入...');
      const iconBuffer = fs.readFileSync(iconPath);
      const iconBase64 = `data:image/png;base64,${iconBuffer.toString('base64')}`;
      
      jsContent = jsContent.split('"/icon.png"').join(`"${iconBase64}"`);
      jsContent = jsContent.split('\'/icon.png\'').join(`'${iconBase64}'`);
      jsContent = jsContent.split('`/icon.png`').join(`\`${iconBase64}\``);
      
      htmlContent = htmlContent.split('"/icon.png"').join(`"${iconBase64}"`);
      htmlContent = htmlContent.split('\'/icon.png\'').join(`'${iconBase64}'`);
    }

    // Replace script tags with inline <script type="module">
    jsContent = jsContent.split('__APP_VERSION__').join(version);
    htmlContent = htmlContent.split('__APP_VERSION__').join(version);

    htmlContent = htmlContent.replace(jsRegex, '');
    htmlContent = htmlContent.replace('</body>', () => `<script type="module">${jsContent}</script>\n</body>`);

    // Write to tools.html in the dist folder
    const outputPath = path.join(distPath, 'tools.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log(`🎉 恭喜！单网页文件 tools.html 已成功压缩生成在 dist 目录: ${outputPath}`);
    cb();
  } catch (error) {
    console.error('打包 tools.html 失败:', error);
    cb(error);
  }
}

// Export gulp task
export default buildSingleHtml;
