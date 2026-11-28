import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as {
  version: string;
};

export default defineConfig({
  root: path.join(rootDir, 'src'),
  publicDir: path.join(rootDir, 'public'),
  base: './',
  plugins: [vue()],
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
