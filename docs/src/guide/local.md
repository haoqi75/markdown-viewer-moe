# 💻 本地部署

## 前置要求

- Node.js 24+（18+ 应该也行）
- pnpm 11.x或者更高（10+ 应该也行）

### 克隆项目
    
```bash
git clone https://github.com/haoqi75/markdown-viewer-moe.git
cd markdown-viewer-moe
```

### 安装依赖

```bash
pnpm install
```

### 开发模式（自动预览 + 热重载）

```bash
pnpm run dev
# 请手动打开 http://localhost:8520

pnpm run dev:tools
# 开发测试Tools
```

### 生产构建

```bash
# 全部构建
pnpm run build
# 代码会生成并放在 dist 文件夹里喔~

# 构建软件
pnpm run build:page
# 代码会生成到 dist/index.html 喔~

# 构建Tools
pnpm run build:tools
# 代码会生成到 dist/tools.html 喔~

# 生成404.html (仅部分服务器)
pnpm run build:404
# 代码会生成到 dist/404.html 喔~
```

### 构建Release版本

```bash
# 全部构建
pnpm run build:release
# 代码会生成并放在 dist 文件夹里喔~
# 运行此代码后会自动生成 dist/files-md5.txt 文件，此文件是验证文件。

# 构建软件
pnpm run build:page-release
# 代码会生成到 dist/index.release.html 喔~

# 构建Tools
pnpm run build:tools-release
# 代码会生成到 dist/tools-vX.X.X.html 喔~
```


### 运行服务器

::: warning
运行前需要运行[生产构建](#生产构建)
:::

```bash
pnpm run start
```