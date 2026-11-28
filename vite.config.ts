import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import fs, { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as {
  version: string;
};
const imagesDir = path.join(rootDir, 'images');

const imageMimeTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function readmeImagesPlugin(): Plugin {
  return {
    name: 'moe-readme-images',
    configureServer(server) {
      server.middlewares.use('/images', (req, res, next) => {
        const pathname = decodeURIComponent((req.url || '').split('?')[0]);
        const filePath = path.resolve(imagesDir, pathname.replace(/^\/+/, ''));

        if (!filePath.startsWith(`${imagesDir}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          next();
          return;
        }

        res.setHeader('Content-Type', imageMimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      });
    },
    closeBundle() {
      if (fs.existsSync(imagesDir)) {
        fs.cpSync(imagesDir, path.join(rootDir, 'dist', 'server', 'images'), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  root: path.join(rootDir, 'src'),
  publicDir: path.join(rootDir, 'public'),
  base: './',
  plugins: [vue(), readmeImagesPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: path.join(rootDir, 'dist/server'),
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020',
  },
  server: {
    port: 8520,
    host: '0.0.0.0',
  },
});
