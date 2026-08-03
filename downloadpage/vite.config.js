import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from 'fs';
import path from 'path';
import pkg from "./package.json";

export default defineConfig({
    define: {
        __APP_NAME__: JSON.stringify(pkg.name),
        __APP_VERSION__: JSON.stringify(pkg.version)
    },
    plugins: [
        viteSingleFile(),
        {
            name: 'rename-index-html',
            // 在打包完全结束、文件写入磁盘后执行
            closeBundle() {
            const oldPath = path.resolve(__dirname, 'dist/index.html');
            const newPath = path.resolve(__dirname, 'dist/download.html');
        
            if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log('✓ Successfully renamed dist/index.html to dist/download.html');
        }
        }
      }
    ],

    base: "./",
    publicDir: false,

    build: {
        outDir: "dist",

        emptyOutDir: true,

        assetsInlineLimit: 100000000,

        cssCodeSplit: false,

        modulePreload: false,

        target: "es2020",

        minify: "esbuild",

        rollupOptions: {
            input: {
            // 键名 'download' 会决定打包后的文件名变成 download.html
            download: './index.html' 
            },
            output: {
                inlineDynamicImports: true,

                manualChunks: undefined
            }
        }
    }
});