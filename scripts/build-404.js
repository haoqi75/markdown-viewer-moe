/**
 * Moe Style 404 Page Generator Script
 * 放置位置: ./scripts/build-404.js
 * 运行位置: 项目根目录 (.)
 */

const fs = require('fs/promises');
const path = require('path');
const { Jimp } = require('jimp');

// 基于进程当前工作目录 (process.cwd()) 计算路径，确保从项目根目录执行
const ROOT_DIR = process.cwd();
const INPUT_IMAGE_PATH = path.join(ROOT_DIR, 'src', 'img', 'error.png');
const OUTPUT_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_HTML_PATH = path.join(OUTPUT_DIR, '404.html');

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * 读取并压缩图片，转换为 Base64
 */
async function getCompressedBase64Image(filePath) {
  try {
    await fs.access(filePath);
    console.log('➜ 正在读取并处理图片:', filePath);

    const image = await Jimp.read(filePath);
    const origWidth = image.bitmap.width;
    const origHeight = image.bitmap.height;

    // 限制最高宽度 800px 以缩减网页体积
    if (origWidth > 800) {
      image.resize({ w: 800 });
    }

    const base64Data = await image.getBase64('image/png');
    console.log(`✔ 图片处理完成! 尺寸: ${origWidth}x${origHeight} -> 宽度: ${image.bitmap.width}px`);
    return base64Data;
  } catch (error) {
    console.warn('⚠️ 读取图片失败，使用 Moe 风格占位 SVG 插画:', error.message);
    
    const fallbackSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffd1dc"/>
            <stop offset="100%" stop-color="#e0c3fc"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" rx="30" fill="url(#bg)"/>
        <circle cx="200" cy="150" r="70" fill="#ffffff"/>
        <polygon points="140,110 120,40 170,90" fill="#ffffff"/>
        <polygon points="140,110 125,50 160,90" fill="#ffb6c1"/>
        <polygon points="260,110 280,40 230,90" fill="#ffffff"/>
        <polygon points="260,110 275,50 240,90" fill="#ffb6c1"/>
        <path d="M 170 140 Q 180 130 190 140" stroke="#5a4e69" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 210 140 Q 220 130 230 140" stroke="#5a4e69" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="165" cy="155" rx="12" ry="7" fill="#ff9aa2" opacity="0.6"/>
        <ellipse cx="235" cy="155" rx="12" ry="7" fill="#ff9aa2" opacity="0.6"/>
        <polygon points="197,152 203,152 200,156" fill="#ff9aa2"/>
        <path d="M 193 162 Q 200 167 200 160 Q 200 167 207 162" stroke="#5a4e69" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M 245 115 Q 255 125 250 130 Q 242 130 245 115" fill="#a0c4ff"/>
      </svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
  }
}

function generateMoeHtml(imageDataUri) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - 页面迷路了喵~</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Nunito:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #fff5f7 0%, #f0e6ff 50%, #e8f3ff 100%);
      --card-bg: rgba(255, 255, 255, 0.85);
      --primary-color: #ff758f;
      --primary-hover: #ff4d6d;
      --text-main: #4a3e56;
      --text-sub: #8c7a9c;
      --shadow-pink: rgba(255, 117, 143, 0.25);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Nunito', 'ZCOOL KuaiLe', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-gradient);
      background-size: 400% 400%;
      animation: gradientBG 15s ease infinite;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--text-main);
      overflow-x: hidden;
      position: relative;
    }

    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .bg-decorations {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }

    .bubble {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(2px);
      animation: floatUp 8s infinite linear;
    }

    @keyframes floatUp {
      0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }

    .container {
      position: relative;
      z-index: 1;
      width: 90%;
      max-width: 520px;
      padding: 40px 30px;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 32px;
      box-shadow: 0 20px 40px rgba(140, 122, 156, 0.12),
                  0 8px 16px rgba(255, 117, 143, 0.08);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .container:hover {
      transform: translateY(-4px);
    }

    .badge-404 {
      display: inline-block;
      background: linear-gradient(45deg, #ff758f, #ffb3c1);
      color: white;
      font-size: 1.2rem;
      font-weight: 800;
      padding: 6px 18px;
      border-radius: 20px;
      letter-spacing: 2px;
      box-shadow: 0 4px 12px var(--shadow-pink);
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .img-wrapper {
      position: relative;
      width: 100%;
      max-width: 280px;
      margin: 0 auto 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .img-wrapper img {
      width: 100%;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08));
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(2deg); }
    }

    h1 {
      font-size: 1.8rem;
      color: var(--text-main);
      margin-bottom: 12px;
      font-weight: 800;
      line-height: 1.3;
    }

    p {
      font-size: 0.98rem;
      color: var(--text-sub);
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .moe-kaomoji {
      display: inline-block;
      font-weight: bold;
      color: var(--primary-color);
    }

    .btn-group {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 28px;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 50px;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
      outline: none;
    }

    .btn-primary {
      background: linear-gradient(45deg, #ff758f, #ff8fa3);
      color: white;
      box-shadow: 0 6px 18px var(--shadow-pink);
    }

    .btn-primary:hover {
      background: linear-gradient(45deg, #ff4d6d, #ff758f);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 22px rgba(255, 77, 109, 0.35);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: var(--text-main);
      border: 2px solid #f0e6ff;
    }

    .btn-secondary:hover {
      background: #f8f0ff;
      transform: translateY(-2px);
      border-color: #e0c3fc;
    }

    .footer-note {
      margin-top: 25px;
      font-size: 0.82rem;
      color: #a89bb8;
    }

    @media (max-width: 480px) {
      .container { padding: 30px 20px; }
      h1 { font-size: 1.5rem; }
      .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="bg-decorations" id="bubbles"></div>

  <div class="container">
    <div class="badge-404">ERROR 404</div>
    
    <div class="img-wrapper">
      <img src="${imageDataUri}" alt="404 Moe Error" />
    </div>

    <h1>呜哇！页面跑丢了喵 <span class="moe-kaomoji">( >﹏< )</span></h1>
    <p>你访问的页面似乎掉进了异次元裂缝呢...<br>要不要喝杯草莓奶茶，然后返回首页看看？</p>

    <div class="btn-group">
      <a href="/" class="btn btn-primary">返回首页 🏠</a>
      <button onclick="history.back()" class="btn btn-secondary">返回上一页 ↩</button>
    </div>

    <div class="footer-note">
      🐾 找不到路的时候，就跟随小猫咪的脚印吧～
    </div>
  </div>

  <script>
    const container = document.getElementById('bubbles');
    for (let i = 0; i < 12; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 30 + 15;
      bubble.style.width = \`\${size}px\`;
      bubble.style.height = \`\${size}px\`;
      bubble.style.left = \`\${Math.random() * 100}%\`;
      bubble.style.animationDelay = \`\${Math.random() * 8}s\`;
      bubble.style.animationDuration = \`\${Math.random() * 6 + 6}s\`;
      container.appendChild(bubble);
    }

    document.addEventListener('click', function(e) {
      const heart = document.createElement('div');
      heart.innerHTML = '💖';
      heart.style.position = 'fixed';
      heart.style.left = \`\${e.clientX - 10}px\`;
      heart.style.top = \`\${e.clientY - 10}px\`;
      heart.style.fontSize = '20px';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9999';
      heart.style.transition = 'all 1s ease-out';
      document.body.appendChild(heart);

      requestAnimationFrame(() => {
        heart.style.transform = 'translateY(-50px) scale(1.5)';
        heart.style.opacity = '0';
      });

      setTimeout(() => heart.remove(), 1000);
    });
  </script>
</body>
</html>
`;
}

async function build() {
  console.log('🌸 开始生成 Moe 风格 404 页面...');
  await ensureDirectoryExists(OUTPUT_DIR);
  const base64Image = await getCompressedBase64Image(INPUT_IMAGE_PATH);
  const htmlContent = generateMoeHtml(base64Image);

  await fs.writeFile(OUTPUT_HTML_PATH, htmlContent, 'utf-8');
  console.log(`✨ 成功生成 404 页面 -> ${OUTPUT_HTML_PATH}`);
}

build().catch(err => {
  console.error('❌ 生成失败:', err);
  process.exit(1);
});
