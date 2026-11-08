# 🌐 使用

::: warning
请确保你的Markdown可以被浏览器访问，Markdown纯文本（Raw），并服务器拥有CORS配置正确，否则无法加载。
:::

### 上传或打开html文件

这是一个单独的**html**文件，可以直接打开或者上传到
- GitHub Pages
- Codeberg Pages
- Cloudflare Pages
- Edgeone Pages
- Google Firebase Hosting
- Netlify
- Vercel
- 任何html服务器

---

### 使用方式

- 方法1：通过编辑 `config.json` 里的 `"defaultUrl"` 和 `"aliases"`（[见配置说明](/config/index#配置说明)）然后重新构建（[见本地部署](/guide/local)）。
- 方法2：下载[Release](/guide/release)文件。按照步骤编辑。
- 方法3：在地址栏提供参数，在地址栏写`?md=<base64 url>`即可访问到Markdown文件。

---

### 地址参数

- `?p=`：别名，在[配置文件](/config/index)或 [Release](/guide/release) 头部编辑别名，别名编辑好后，可以按照这个方式访问：
  ```
  http://127.0.0.1:8520/?p=page
  ```
  或者：
  ```
  https://moe520.haoqi75.os.kg/?p=page
  ```
- `?md=`：加载其他Markdown地址，使用Base64加密地址，按照以下方式访问：
  ```
  http://127.0.0.1:8520/?md=aHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0Lm1kCg==
  ```
  或者：
  ```
  https://moe520.haoqi75.os.kg/?md=aHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0Lm1kCg==
  ```

>[!TIP]
>加密base64可以使用 `btoa('https://...')` 在浏览器控制台编码。或者在终端输入 `echo "https://..." | base64` 也可以获取base64加密。
>从tools v1.4.0 后可以使用它加密。具体使用访问[简单编辑 config.json 工具](/config/editor)。