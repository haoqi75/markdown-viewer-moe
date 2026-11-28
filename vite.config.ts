import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};

export default defineConfig({
  root: path.join(__dirname, 'src'),
  publicDir: path.join(__dirname, 'public'),
  base: './',
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: path.join(__dirname, 'dist/server'),
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020',
  },
  server: {
    port: 8520,
    host: '0.0.0.0',
  },
});
