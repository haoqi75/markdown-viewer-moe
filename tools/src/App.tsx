import React, { useState, useRef } from 'react';
import { templates } from './templates';
import { ConfigTemplate, ValidationResult } from './types';
import { FormGenerator } from './components/FormGenerator';
import { JsonView } from './components/JsonView';
import { TemplateSelector } from './components/TemplateSelector';
import { 
  FileJson, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Eye, 
  Code, 
  Wrench,
  Sun,
  Moon,
  Github,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Link,
  ExternalLink,
  Globe
} from 'lucide-react';

const extractJsonFromHtml = (htmlContent: string): { json: Record<string, any> | null; error: string | null } => {
  // We look for a <script> tag with id="release-config"
  const match = htmlContent.match(/<script\s+[^>]*id=["']release-config["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) {
    return { json: null, error: '未在 HTML 中找到 id="release-config" 的 <script> 标签。' };
  }
  
  const jsonText = match[1].trim();
  try {
    const json = JSON.parse(jsonText);
    return { json, error: null };
  } catch (err: any) {
    return { json: null, error: `解析 script 中的 JSON 失败：${err.message}` };
  }
};

const injectJsonToHtml = (htmlContent: string, json: Record<string, any>): string => {
  const jsonString = JSON.stringify(json, null, 2);
  // Replace the content inside the <script id="release-config">...</script>
  const regex = /(<script\s+[^>]*id=["']release-config["'][^>]*>)([\s\S]*?)(<\/script>)/i;
  if (regex.test(htmlContent)) {
    return htmlContent.replace(regex, `$1\n${jsonString}\n$3`);
  }
  return htmlContent;
};

const DEFAULT_RELEASE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown 预览发布版</title>
  <script id="release-config" type="application/json">
{
  "defaultUrl": "https://your-default-api.com/raw/index.md",
  "aliases": {
    "test": "https://another-api.com/raw/rypa",
    "docs": "https://docs.example.com/readme.md"
  }
}
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
  <div class="max-w-4xl mx-auto w-full p-6 my-10 bg-white rounded-3xl shadow-xl border border-slate-100 flex-1 flex flex-col">
    <div class="flex items-center space-x-3 pb-6 border-b border-slate-100 mb-6">
      <div class="p-2.5 bg-pink-500 rounded-2xl text-white">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800">📄 Markdown 预览发布版</h1>
        <p class="text-xs text-slate-500">Standalone Release Document Viewer</p>
      </div>
    </div>
    
    <div class="flex-1">
      <div class="p-4 bg-pink-50/50 border border-pink-100/60 rounded-2xl text-sm mb-6 text-[#6e4e59]">
        ✨ 这是一个由 <strong>萌·配置文件生成器</strong> 打包输出的独立发布版 HTML。配置已直接注入在页面头部的 <code class="bg-white/80 px-1 py-0.5 rounded text-pink-600 font-mono text-2xs">&lt;script id="release-config"&gt;</code> 中。
      </div>
      
      <h2 class="text-sm font-bold text-slate-700 mb-3">📍 内置配置参数 (Parsed Config)</h2>
      <pre id="config-display" class="bg-slate-900 text-slate-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto shadow-inner leading-relaxed">加载中...</pre>
    </div>
  </div>

  <script>
    try {
      const configText = document.getElementById('release-config').textContent;
      const config = JSON.parse(configText);
      document.getElementById('config-display').textContent = JSON.stringify(config, null, 2);
    } catch (e) {
      document.getElementById('config-display').textContent = 'Error parsing config: ' + e.message;
    }
  </script>
</body>
</html>`;

const APP_VERSION = "__APP_VERSION__".startsWith("__") ? "1.4.3" : "__APP_VERSION__";

export default function App() {
  const [config, setConfig] = useState<Record<string, any>>(templates[0].config);
  const [activeTemplate, setActiveTemplate] = useState<ConfigTemplate>(templates[0]);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HTML file upload state
  const [uploadedHtmlContent, setUploadedHtmlContent] = useState<string | null>(null);
  const [uploadedHtmlName, setUploadedHtmlName] = useState<string>("index.release.html");
  const htmlInputRef = useRef<HTMLInputElement>(null);

  // Moe Mascot state
  const [mascotMessage, setMascotMessage] = useState<string>("你好呀！我是你的配置文件助手「小萌」～ 让我们一起轻松配置 config.json 吧！🌸");
  const [mascotExpression, setMascotExpression] = useState<'idle' | 'happy' | 'sad' | 'wink' | 'excited'>('idle');

  // Base64 tool states
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');

  // Markdown Link Generator states (v1.4.3)
  const [base64ToolMode, setBase64ToolMode] = useState<'link' | 'text'>('link');
  const [markdownUrl, setMarkdownUrl] = useState<string>('');
  const [prefixPreset, setPrefixPreset] = useState<'kg' | 'mt' | 'custom'>('kg');
  const [customPrefix, setCustomPrefix] = useState<string>('http://127.0.0.1:8520/');
  const [generatedMoeUrl, setGeneratedMoeUrl] = useState<string>('');

  const handleGenerateMoeUrl = (urlToUse?: string, presetToUse?: string, customToUse?: string) => {
    const rawUrl = urlToUse !== undefined ? urlToUse : markdownUrl;
    const preset = presetToUse !== undefined ? presetToUse : prefixPreset;
    const custom = customToUse !== undefined ? customToUse : customPrefix;

    if (!rawUrl.trim()) {
      showToast('请输入 Markdown 原始 Raw 链接哦！', 'info');
      setMascotMessage('小萌需要先有 Markdown 原始链接，才能帮您合成为加密链接呀！🌸');
      setMascotExpression('wink');
      return;
    }

    try {
      // Safe base64 encoding supporting UTF-8
      const encoded = btoa(encodeURIComponent(rawUrl.trim()).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));

      let prefix = 'https://moe520.haoqi75.os.kg/';
      if (preset === 'mt') {
        prefix = 'https://moe520.haoqi75.cn.mt/';
      } else if (preset === 'custom') {
        prefix = custom.trim();
      }

      // Ensure prefix ends with / if it doesn't have query params
      if (prefix && !prefix.endsWith('/') && !prefix.includes('?')) {
        prefix += '/';
      }

      const finalUrl = `${prefix}?md=${encoded}`;
      setGeneratedMoeUrl(finalUrl);
      showToast('链接合成成功！', 'success');
      setMascotMessage('太棒啦！小萌已经成功帮您合成了 Markdown Viewer 的加密加载链接！✨ 直接点击可以预览或复制哦！🌸');
      setMascotExpression('excited');
    } catch (err: any) {
      showToast(`生成失败: ${err.message}`, 'error');
      setMascotMessage('唔，生成链接时出错了，请检查输入链接是否正确～🤕');
      setMascotExpression('sad');
    }
  };

  const handleCopyMoeUrl = () => {
    if (!generatedMoeUrl) {
      showToast('没有可复制的链接哦！', 'info');
      return;
    }
    navigator.clipboard.writeText(generatedMoeUrl);
    showToast('链接已成功复制到剪贴板！', 'success');
    setMascotMessage('已经成功帮您复制好完整链接啦，快去粘贴或分享吧！🌸');
    setMascotExpression('happy');
  };

  const handleClearMoeUrl = () => {
    setMarkdownUrl('');
    setGeneratedMoeUrl('');
    showToast('已清空链接生成器！', 'success');
  };

  const handleBase64Encode = () => {
    if (!base64Input) {
      showToast('请输入需要编码的文本哦！', 'info');
      setMascotMessage('小萌需要先有文本才能帮您加密成 Base64 呀！🌸');
      setMascotExpression('wink');
      return;
    }
    try {
      const encoded = btoa(encodeURIComponent(base64Input).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      setBase64Output(encoded);
      showToast('编码成功！', 'success');
      setMascotMessage('太棒啦！小萌已经成功帮您把文本加密成 Base64 字符串啦！🔐');
      setMascotExpression('happy');
    } catch (err: any) {
      showToast(`编码失败: ${err.message}`, 'error');
      setMascotMessage('呜呜，编码好像出错了，请检查输入是否正确～');
      setMascotExpression('sad');
    }
  };

  const handleBase64Decode = () => {
    if (!base64Input) {
      showToast('请输入需要解码的 Base64 文本哦！', 'info');
      setMascotMessage('先输入需要解密的 Base64 字符串吧，小萌在这里等着哦！🌸');
      setMascotExpression('wink');
      return;
    }
    try {
      const decoded = decodeURIComponent(Array.prototype.map.call(atob(base64Input.trim()), (c: any) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      setBase64Output(decoded);
      showToast('解码成功！', 'success');
      setMascotMessage('解密成功！小萌已经把神奇的 Base64 还原成普通文本啦！🔓');
      setMascotExpression('excited');
    } catch (err: any) {
      showToast(`解码失败，可能不是合法的 Base64 格式！`, 'error');
      setMascotMessage('唔... 这段文本好像不是标准的 Base64 格式，小萌解不开呢... 🤕');
      setMascotExpression('sad');
    }
  };

  const handleCopyBase64Result = () => {
    if (!base64Output) {
      showToast('没有可复制的结果哦！', 'info');
      return;
    }
    navigator.clipboard.writeText(base64Output);
    showToast('结果已成功复制到剪贴板！', 'success');
    setMascotMessage('已经成功帮您复制到剪贴板啦，快去粘贴使用吧！✨');
    setMascotExpression('happy');
  };

  const handleClearBase64 = () => {
    setBase64Input('');
    setBase64Output('');
    showToast('已清空输入和输出！', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTemplateSelect = (tpl: ConfigTemplate) => {
    setConfig(tpl.config);
    setActiveTemplate(tpl);
    showToast(`成功载入模板：${tpl.name}`, 'success');
    setMascotMessage(`成功载入「${tpl.name}」模板啦！这个配置非常实用呢！✨`);
    setMascotExpression('happy');
  };

  const handleConfigChange = (updated: Record<string, any>) => {
    setConfig(updated);
    if (validation.isValid) {
      setMascotMessage("哇！你更新了配置参数，小萌已经帮你自动存好草稿啦～📝");
      setMascotExpression('wink');
    }
  };

  const handleValidationChange = (res: ValidationResult) => {
    setValidation(res);
    if (res.isValid) {
      setMascotMessage("好厉害！JSON 语法非常完美，小萌为你点赞！💖");
      setMascotExpression('happy');
    } else {
      setMascotMessage(`呜哇……JSON 语法好像有一点点小感冒：${res.error}。别着急，快帮它治治吧～🧸`);
      setMascotExpression('sad');
    }
  };

  // Import JSON File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('导入的文件顶层必须是一个 JSON 对象 ( { ... } )。');
        }
        
        setConfig(parsed);
        // Reset active template if it's custom
        const matchedTpl = templates.find(t => JSON.stringify(t.config) === JSON.stringify(parsed));
        if (matchedTpl) {
          setActiveTemplate(matchedTpl);
        } else {
          setActiveTemplate({
            id: 'custom',
            name: '自定义导入配置',
            description: '从外部 JSON 文件载入的自定义参数列表。',
            icon: 'FileJson',
            config: parsed
          });
        }
        setValidation({ isValid: true });
        showToast('配置文件导入成功！', 'success');
        setMascotMessage("哇！新的配置文件导入成功啦！小萌立刻为你生成了可视化编辑表单～🌸");
        setMascotExpression('excited');
      } catch (err: any) {
        showToast(`导入失败: ${err.message || 'JSON 格式解析错误'}`, 'error');
        setMascotMessage("呜呜……这个 JSON 文件结构好像坏掉了，导入失败了……💧");
        setMascotExpression('sad');
      }
    };
    reader.readAsText(file);
    // Reset file input target value
    e.target.value = '';
  };

  // Import HTML File and extract script JSON config
  const handleHtmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const htmlText = event.target?.result as string;
        const { json, error } = extractJsonFromHtml(htmlText);
        
        if (error) {
          showToast(error, 'error');
          setMascotMessage(`呜呜……解析 HTML 时出错了：${error}，请检查文件结构哦！💔`);
          setMascotExpression('sad');
          return;
        }

        if (json) {
          setUploadedHtmlContent(htmlText);
          setUploadedHtmlName(file.name);
          setConfig(json);
          
          // Check if matches an existing template
          const matchedTpl = templates.find(t => JSON.stringify(t.config) === JSON.stringify(json));
          if (matchedTpl) {
            setActiveTemplate(matchedTpl);
          } else {
            setActiveTemplate({
              id: 'html_release_config',
              name: `📦 发布版 HTML: ${file.name}`,
              description: `正在编辑从 ${file.name} 中提取的 release-config JSON 参数。`,
              icon: 'Layers',
              config: json
            });
          }
          
          setValidation({ isValid: true });
          showToast(`成功载入 ${file.name} 并提取配置！`, 'success');
          setMascotMessage(`好耶！成功从「${file.name}」中读取并提取了 release-config 配置，已经为您加载到下方的可视化编辑区啦！✨`);
          setMascotExpression('excited');
        }
      } catch (err: any) {
        showToast(`加载 HTML 失败: ${err.message}`, 'error');
        setMascotMessage("呜呜……加载 HTML 文件时出现了未知错误……💧");
        setMascotExpression('sad');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Pack edited config back and download index.release.html
  const handleDownloadHtml = () => {
    if (!uploadedHtmlContent) {
      showToast('⚠️ 下载失败：必须先上传 index.release.html 文件后才可以进行打包下载！', 'error');
      setMascotMessage("哎呀！你还没有上传 index.release.html 呢～ 必须先上传已有的 HTML 文件，小萌才能帮你把新配置打包进去并提供下载哦！🌸");
      setMascotExpression('sad');
      return;
    }
    if (!validation.isValid) {
      showToast('当前 JSON 格式存在语法错误，请修正后再导出 HTML！', 'error');
      setMascotMessage("语法校验还没通过呢，先去检查一下红色的语法错误提示吧！🧸");
      setMascotExpression('sad');
      return;
    }

    try {
      const updatedHtml = injectJsonToHtml(uploadedHtmlContent, config);
      const blob = new Blob([updatedHtml], { type: 'text/html;charset=utf-8' });
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
      downloadAnchor.setAttribute("download", uploadedHtmlName || "index.release.html");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      const fileName = uploadedHtmlName || "index.release.html";
      showToast(`打包完成，${fileName} 下载已开始！`, 'success');
      setMascotMessage(`太棒啦！新的配置已经成功打包写入「${fileName}」，下载已开始，快去部署上线看看吧！🚀`);
      setMascotExpression('excited');
    } catch (err: any) {
      showToast(`打包导出 HTML 失败: ${err.message}`, 'error');
    }
  };

  // Download JSON File
  const handleDownloadJson = () => {
    if (!validation.isValid) {
      showToast('当前 JSON 格式存在语法错误，请修正后再进行下载！', 'error');
      setMascotMessage("语法检验还没通过呢，小萌暂时不能帮你下载哦～ 检查一下红色的错误提示吧！💊");
      setMascotExpression('sad');
      return;
    }

    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "config.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('config.json 下载已开始！', 'success');
      setMascotMessage("config.json 已经成功保存啦！快把它放到你的萌系预览器项目下吧！🚀");
      setMascotExpression('excited');
    } catch (e) {
      showToast('导出 JSON 文件失败，请重试。', 'error');
    }
  };

  // Download stand-alone tools.html directly from browser
  const handleGenerateStandaloneHtml = () => {
    try {
      // Standalone template generator with CDN dependencies (React, Tailwind, Lucide)
      // Injecting the templates, current state config, and interactive form builder
      const standaloneHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>配置文件简易编辑器 (config.json Editor)</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React and ReactDOM CDNs -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    /* Custom fine-tunings for form elements and transitions */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
    }
  </style>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontSize: {
            '2xs': '0.65rem',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50 text-gray-900 transition-colors duration-200 custom-scrollbar">
  <div id="root"></div>

  <script>
    // Embedded template configurations
    const templates = ${JSON.stringify(templates, null, 2)};
    const initialConfig = ${JSON.stringify(config, null, 2)};

    const { useState, useEffect, useRef } = React;

    // Helper functions for reading/writing nested fields
    const getValueByPath = (obj, path) => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
      }
      return current;
    };

    const setValueByPath = (obj, path, value) => {
      const newObj = JSON.parse(JSON.stringify(obj));
      const parts = path.split('.');
      let current = newObj;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = value;
        } else {
          current[part] = current[part] ? JSON.parse(JSON.stringify(current[part])) : {};
          current = current[part];
        }
      }
      return newObj;
    };

    // Auto-infer visual schema from arbitrary JSON
    const inferSchema = (json) => {
      const groups = [];
      const generalFields = [];
      
      Object.keys(json).forEach((key) => {
        const value = json[key];
        if (value === null || value === undefined) return;
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nestedFields = [];
          Object.keys(value).forEach((subKey) => {
            const subValue = value[subKey];
            const fullPath = key + '.' + subKey;
            
            if (typeof subValue === 'boolean') {
              nestedFields.push({ key: fullPath, label: subKey, type: 'boolean' });
            } else if (typeof subValue === 'number') {
              nestedFields.push({ key: fullPath, label: subKey, type: 'number' });
            } else if (typeof subValue === 'string') {
              if (subValue.startsWith('#') && (subValue.length === 4 || subValue.length === 7)) {
                nestedFields.push({ key: fullPath, label: subKey, type: 'color' });
              } else {
                nestedFields.push({ key: fullPath, label: subKey, type: 'string' });
              }
            } else if (Array.isArray(subValue)) {
              if (subValue.every(item => typeof item === 'string' || typeof item === 'number')) {
                nestedFields.push({ key: fullPath, label: subKey, type: 'array_string' });
              } else if (subValue.every(item => typeof item === 'object')) {
                nestedFields.push({ key: fullPath, label: subKey, type: 'array_object' });
              }
            }
          });
          
          if (nestedFields.length > 0) {
            groups.push({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              description: '配置 ' + key + ' 下的子项参数',
              fields: nestedFields
            });
          }
        } else if (Array.isArray(value)) {
          if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
            generalFields.push({ key, label: key, type: 'array_string' });
          } else if (value.every(item => typeof item === 'object')) {
            generalFields.push({ key, label: key, type: 'array_object' });
          }
        } else {
          if (typeof value === 'boolean') {
            generalFields.push({ key, label: key, type: 'boolean' });
          } else if (typeof value === 'number') {
            generalFields.push({ key, label: key, type: 'number' });
          } else if (typeof value === 'string') {
            if (value.startsWith('#') && (value.length === 4 || value.length === 7)) {
              generalFields.push({ key, label: key, type: 'color' });
            } else if (value.length > 100) {
              generalFields.push({ key, label: key, type: 'textarea' });
            } else {
              generalFields.push({ key, label: key, type: 'string' });
            }
          }
        }
      });
      
      if (generalFields.length > 0) {
        groups.unshift({
          name: '常规设置 (General)',
          description: '全局或首要通用参数配置组',
          fields: generalFields
        });
      }
      
      return groups;
    };

    // React Application Root Component
    function App() {
      const [config, setConfig] = useState(initialConfig);
      const [activeTplId, setActiveTplId] = useState(templates[0].id);
      const [activeTab, setActiveTab] = useState(0);
      const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'code'
      const [localCode, setLocalCode] = useState('');
      const [validation, setValidation] = useState({ isValid: true });
      const [showHelp, setShowHelp] = useState({});
      const [isDarkMode, setIsDarkMode] = useState(false);
      const [toast, setToast] = useState(null);
      const [editingArrayPath, setEditingArrayPath] = useState(null);
      const [newItemObject, setNewItemObject] = useState({});
      const [expandedArrayItems, setExpandedArrayItems] = useState({});
      const fileInputRef = useRef(null);

      // Icon names mapping helper for standalone rendering
      useEffect(() => {
        lucide.createIcons();
      }, [viewMode, activeTab, config, editingArrayPath, isDarkMode, toast]);

      useEffect(() => {
        setLocalCode(JSON.stringify(config, null, 2));
      }, [config]);

      const triggerToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
      };

      const handleTemplateChange = (tpl) => {
        setConfig(tpl.config);
        setActiveTplId(tpl.id);
        triggerToast('已载入：' + tpl.name);
      };

      const handleFieldChange = (key, val) => {
        const updated = setValueByPath(config, key, val);
        setConfig(updated);
      };

      const handleCodeChange = (text) => {
        setLocalCode(text);
        if (!text.trim()) {
          setValidation({ isValid: false, error: '内容不能为空。' });
          return;
        }
        try {
          const parsed = JSON.parse(text);
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('顶层必须是一个 JSON 对象。');
          }
          setValidation({ isValid: true });
          setConfig(parsed);
        } catch (e) {
          let msg = e.message;
          const posMatch = msg.match(/at position (\\d+)/);
          if (posMatch) {
            const pos = parseInt(posMatch[1], 10);
            const prefix = text.substring(0, pos);
            const line = prefix.split('\\n').length;
            msg = msg.replace(/at position \\d+/, '') + ' (第 ' + line + ' 行附近)';
          }
          setValidation({ isValid: false, error: msg });
        }
      };

      const handleFormat = () => {
        try {
          const parsed = JSON.parse(localCode);
          setLocalCode(JSON.stringify(parsed, null, 2));
          setValidation({ isValid: true });
        } catch(e) {}
      };

      const handleMinify = () => {
        try {
          const parsed = JSON.parse(localCode);
          setLocalCode(JSON.stringify(parsed));
          setValidation({ isValid: true });
        } catch(e) {}
      };

      const handleDownload = () => {
        if (!validation.isValid) {
          triggerToast('当前格式错误，请修正后重试！', 'error');
          return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "config.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        triggerToast('文件 config.json 已开始下载');
      };

      const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const parsed = JSON.parse(ev.target.result);
            if (typeof parsed !== 'object' || parsed === null) {
              throw new Error('顶层必须是对象。');
            }
            setConfig(parsed);
            setActiveTplId('custom');
            setValidation({ isValid: true });
            triggerToast('自定义 JSON 配置文件载入成功！');
          } catch(err) {
            triggerToast('导入失败：' + err.message, 'error');
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      };

      // Extract current active schema
      const currentTpl = templates.find(t => t.id === activeTplId);
      const activeSchema = (currentTpl && currentTpl.schema) ? currentTpl.schema : inferSchema(config);

      return (
        React.createElement("div", { className: isDarkMode ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen' },
          React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-8" },
            
            // Toast Notification
            toast && React.createElement("div", { className: "fixed top-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-xl text-white transition-all transform animate-bounce " + (toast.type === 'error' ? 'bg-red-500' : 'bg-indigo-600') },
              React.createElement("span", { className: "text-sm font-semibold" }, toast.message)
            ),

            // Header Banner
            React.createElement("header", { className: "flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 mb-8 " + (isDarkMode ? 'border-gray-800' : 'border-gray-200') },
              React.createElement("div", { className: "flex items-center space-x-3" },
                React.createElement("div", { className: "p-3 bg-indigo-600 rounded-2xl text-white shadow-md" },
                  React.createElement("i", { "data-lucide": "wrench", className: "h-6 w-6" })
                ),
                React.createElement("div", null,
                  React.createElement("h1", { className: "text-xl font-bold tracking-tight" }, "小白配置文件生成器 (Config Box)"),
                  React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5" }, "零代码基础的可视化 json 交互编辑，支持导入、导出与校验。")
                )
              ),
              React.createElement("div", { className: "flex items-center space-x-3 mt-4 md:mt-0" },
                React.createElement("button", { 
                  onClick: () => setIsDarkMode(!isDarkMode),
                  className: "p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                },
                  React.createElement("i", { "data-lucide": isDarkMode ? "sun" : "moon", className: "h-5 w-5" })
                ),
                React.createElement("button", { 
                  onClick: () => fileInputRef.current.click(),
                  className: "flex items-center space-x-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                },
                  React.createElement("i", { "data-lucide": "upload", className: "h-4 w-4 mr-1.5" }),
                  "导入 JSON"
                ),
                React.createElement("input", { 
                  type: "file", 
                  ref: fileInputRef, 
                  onChange: handleImport, 
                  accept: ".json", 
                  className: "hidden" 
                }),
                React.createElement("button", { 
                  onClick: handleDownload,
                  className: "flex items-center space-x-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                },
                  React.createElement("i", { "data-lucide": "download", className: "h-4 w-4 mr-1.5" }),
                  "保存 config.json"
                )
              )
            ),

            // Predefined Template selector section
            React.createElement("div", { className: "mb-8" },
              React.createElement("div", { className: "flex items-center space-x-2 mb-4" },
                React.createElement("i", { "data-lucide": "layers", className: "h-4.5 w-4.5 text-indigo-500" }),
                React.createElement("h2", { className: "text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400" }, "请选择一个基础模板开始")
              ),
              React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                templates.map(tpl => {
                  const isSel = activeTplId === tpl.id;
                  return React.createElement("button", {
                    key: tpl.id,
                    onClick: () => handleTemplateChange(tpl),
                    className: "text-left p-5 rounded-2xl border transition-all cursor-pointer " + (isSel ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-indigo-200')
                  },
                    React.createElement("div", { className: "flex items-start space-x-3.5" },
                      React.createElement("div", { className: "p-2 rounded-xl " + (isSel ? 'bg-indigo-100 dark:bg-indigo-950' : 'bg-gray-100 dark:bg-gray-900') },
                        React.createElement("i", { "data-lucide": tpl.icon === 'Globe' ? 'globe' : tpl.icon === 'Server' ? 'server' : 'gamepad-2', className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" })
                      ),
                      React.createElement("div", null,
                        React.createElement("h4", { className: "text-sm font-bold text-gray-900 dark:text-white" }, tpl.name),
                        React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" }, tpl.description)
                      )
                    )
                  )
                })
              )
            ),

            // Tab bar View toggle mode (Visual Form vs Raw Code Editor)
            React.createElement("div", { className: "flex border-b border-gray-200 dark:border-gray-800 mb-6" },
              React.createElement("button", { 
                onClick: () => setViewMode('visual'),
                className: "flex items-center px-5 py-3 border-b-2 text-sm font-semibold transition-all " + (viewMode === 'visual' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white')
              },
                React.createElement("i", { "data-lucide": "eye", className: "h-4 w-4 mr-2" }),
                "可视化小白模式 (表单填写)"
              ),
              React.createElement("button", { 
                onClick: () => setViewMode('code'),
                className: "flex items-center px-5 py-3 border-b-2 text-sm font-semibold transition-all " + (viewMode === 'code' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white')
              },
                React.createElement("i", { "data-lucide": "code", className: "h-4 w-4 mr-2" }),
                "源码校验模式 (代码编辑)"
              )
            ),

            // Main Workspace render
            viewMode === 'visual' ? (
              // Visual Form Builder Workspace
              React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-64 shrink-0" },
                  React.createElement("div", { className: "space-y-1 rounded-xl bg-gray-50 dark:bg-gray-900/40 p-2 border border-gray-100 dark:border-gray-800" },
                    activeSchema.map((g, idx) => 
                      React.createElement("button", {
                        key: g.name,
                        onClick: () => setActiveTab(idx),
                        className: "flex w-full items-center px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-all " + (activeTab === idx ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')
                      },
                        React.createElement("i", { "data-lucide": "sliders", className: "h-4 w-4 mr-2.5 text-gray-400" }),
                        g.name
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "flex-1 rounded-2xl border bg-white dark:bg-gray-950 p-6 shadow-xs border-gray-150 dark:border-gray-800" },
                  activeSchema[activeTab] && React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "border-b pb-4 border-gray-100 dark:border-gray-800" },
                      React.createElement("h3", { className: "text-base font-bold text-gray-900 dark:text-white" }, activeSchema[activeTab].name),
                      activeSchema[activeTab].description && React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, activeSchema[activeTab].description)
                    ),
                    React.createElement("div", { className: "space-y-5" },
                      activeSchema[activeTab].fields.map(field => {
                        const val = getValueByPath(config, field.key);
                        return React.createElement("div", { key: field.key, className: "space-y-2" },
                          React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("label", { className: "block text-sm font-bold text-gray-700 dark:text-gray-300" }, 
                              field.label,
                              React.createElement("span", { className: "ml-1.5 font-mono text-2xs text-gray-400 font-normal" }, "(" + field.key + ")")
                            ),
                            field.description && React.createElement("button", {
                              onClick: () => setShowHelp(prev => ({ ...prev, [field.key]: !prev[field.key] })),
                              className: "text-gray-400 hover:text-indigo-600"
                            },
                              React.createElement("i", { "data-lucide": "help-circle", className: "h-4 w-4" })
                            )
                          ),
                          field.description && showHelp[field.key] && React.createElement("div", { className: "text-xs p-2.5 rounded-lg bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-start" },
                            React.createElement("i", { "data-lucide": "info", className: "h-4.5 w-4.5 mr-1.5 shrink-0" }),
                            React.createElement("span", null, field.description)
                          ),
                          React.createElement("div", { className: "mt-1" },
                            field.type === 'boolean' ? (
                              React.createElement("div", { className: "flex items-center" },
                                React.createElement("button", {
                                  onClick: () => handleFieldChange(field.key, !val),
                                  className: "relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors " + (val ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')
                                },
                                  React.createElement("span", { className: "inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 " + (val ? 'translate-x-5' : 'translate-x-0') })
                                ),
                                React.createElement("span", { className: "ml-3 text-sm text-gray-400" }, val ? '开启 (True)' : '关闭 (False)')
                              )
                            ) : field.type === 'number' ? (
                              React.createElement("div", { className: "flex items-center space-x-4" },
                                React.createElement("input", {
                                  type: "number",
                                  value: val ?? '',
                                  onChange: (e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0),
                                  className: "w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                                }),
                                field.min !== undefined && field.max !== undefined && React.createElement("input", {
                                  type: "range",
                                  min: field.min,
                                  max: field.max,
                                  step: field.step || 1,
                                  value: val ?? field.min,
                                  onChange: (e) => handleFieldChange(field.key, parseFloat(e.target.value)),
                                  className: "w-full cursor-pointer h-2 bg-gray-200 rounded-lg dark:bg-gray-700 accent-indigo-600"
                                })
                              )
                            ) : field.type === 'color' ? (
                              React.createElement("div", { className: "flex items-center space-x-3" },
                                React.createElement("div", { className: "h-9 w-9 rounded-full border overflow-hidden relative shadow-sm" },
                                  React.createElement("input", {
                                    type: "color",
                                    value: val || '#000000',
                                    onChange: (e) => handleFieldChange(field.key, e.target.value),
                                    className: "absolute -inset-1 h-14 w-14 cursor-pointer p-0 border-0"
                                  })
                                ),
                                React.createElement("input", {
                                  type: "text",
                                  value: val || '',
                                  onChange: (e) => handleFieldChange(field.key, e.target.value),
                                  className: "w-28 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm uppercase"
                                })
                              )
                            ) : field.type === 'select' ? (
                              React.createElement("select", {
                                value: val || '',
                                onChange: (e) => handleFieldChange(field.key, e.target.value),
                                className: "w-full max-w-xs rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                              },
                                (field.options || []).map(opt => React.createElement("option", { key: opt, value: opt }, opt))
                              )
                            ) : field.type === 'textarea' ? (
                              React.createElement("textarea", {
                                rows: 3,
                                value: val || '',
                                onChange: (e) => handleFieldChange(field.key, e.target.value),
                                className: "w-full rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                              })
                            ) : field.type === 'array_string' ? (
                              React.createElement("div", { className: "space-y-2" },
                                React.createElement("div", { className: "flex flex-wrap gap-2" },
                                  (val || []).map((item, tagIdx) => React.createElement("span", { key: tagIdx, className: "inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-700/10 dark:bg-indigo-950/40 dark:text-indigo-300" },
                                    item,
                                    React.createElement("button", {
                                      onClick: () => {
                                        const nextTag = (val || []).filter((_, i) => i !== tagIdx);
                                        handleFieldChange(field.key, nextTag);
                                      },
                                      className: "ml-1.5 text-indigo-400 hover:text-indigo-900"
                                    }, "×")
                                  )),
                                  (val || []).length === 0 && React.createElement("span", { className: "text-xs text-gray-400 italic" }, "空列表")
                                ),
                                React.createElement("div", { className: "flex max-w-sm space-x-2" },
                                  React.createElement("input", {
                                    type: "text",
                                    placeholder: "按回车添加项...",
                                    onKeyDown: (e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (e.currentTarget.value.trim()) {
                                          handleFieldChange(field.key, [...(val || []), e.currentTarget.value.trim()]);
                                          e.currentTarget.value = '';
                                        }
                                      }
                                    },
                                    className: "flex-1 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                                  })
                                )
                              )
                            ) : field.type === 'array_object' ? (
                              React.createElement("div", { className: "rounded-xl border p-4 bg-gray-50/50 dark:bg-gray-900/30 dark:border-gray-800" },
                                React.createElement("div", { className: "flex justify-between items-center" },
                                  React.createElement("span", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300" }, "共计 " + (val || []).length + " 个子项目"),
                                  React.createElement("button", {
                                    onClick: () => setExpandedArrayItems(prev => ({ ...prev, [field.key]: !prev[field.key] })),
                                    className: "text-xs font-medium text-indigo-600 flex items-center"
                                  }, 
                                    expandedArrayItems[field.key] ? '折叠列表' : '展开列表',
                                    React.createElement("i", { "data-lucide": expandedArrayItems[field.key] ? "chevron-down" : "chevron-right", className: "h-3.5 w-3.5 ml-1" })
                                  )
                                ),
                                expandedArrayItems[field.key] && React.createElement("div", { className: "mt-3 space-y-3" },
                                  (val || []).map((item, idx) => React.createElement("div", { key: idx, className: "p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700" },
                                    React.createElement("div", { className: "flex justify-between items-center border-b pb-2 mb-2 border-gray-150 dark:border-gray-700" },
                                      React.createElement("span", { className: "text-xs font-bold text-gray-500" }, "子项 #" + (idx + 1)),
                                      React.createElement("button", {
                                        onClick: () => {
                                          const next = (val || []).filter((_, i) => i !== idx);
                                          handleFieldChange(field.key, next);
                                        },
                                        className: "text-gray-400 hover:text-red-500"
                                      }, 
                                        React.createElement("i", { "data-lucide": "trash-2", className: "h-4 w-4" })
                                      )
                                    ),
                                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                                      Object.keys(item).map(itemK => React.createElement("div", { key: itemK },
                                        React.createElement("label", { className: "text-xs text-gray-500 block" }, itemK),
                                        typeof item[itemK] === 'boolean' ? React.createElement("button", {
                                          onClick: () => {
                                            const nextItem = { ...item, [itemK]: !item[itemK] };
                                            const nextList = [...val];
                                            nextList[idx] = nextItem;
                                            handleFieldChange(field.key, nextList);
                                          },
                                          className: "relative inline-flex h-5 w-10 rounded-full " + (item[itemK] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')
                                        }, React.createElement("span", { className: "h-4 w-4 transform rounded-full bg-white transition duration-200 " + (item[itemK] ? 'translate-x-5' : 'translate-x-0') }))
                                        : React.createElement("input", {
                                          type: typeof item[itemK] === 'number' ? 'number' : 'text',
                                          value: item[itemK],
                                          onChange: (e) => {
                                            const v = typeof item[itemK] === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                                            const nextItem = { ...item, [itemK]: v };
                                            const nextList = [...val];
                                            nextList[idx] = nextItem;
                                            handleFieldChange(field.key, nextList);
                                          },
                                          className: "w-full rounded-md border p-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600"
                                        })
                                      ))
                                    )
                                  )),
                                  React.createElement("button", {
                                    onClick: () => {
                                      const sample = (val && val.length > 0) ? val[0] : { name: '', value: '' };
                                      const defaults = {};
                                      Object.keys(sample).forEach(k => {
                                        defaults[k] = typeof sample[k] === 'boolean' ? false : typeof sample[k] === 'number' ? 0 : '';
                                      });
                                      setNewItemObject(defaults);
                                      setEditingArrayPath(field.key);
                                    },
                                    className: "w-full mt-2 py-1.5 border border-dashed rounded-lg text-xs font-semibold bg-indigo-50/20 text-indigo-600 dark:bg-indigo-950/10 flex justify-center items-center"
                                  },
                                    React.createElement("i", { "data-lucide": "plus", className: "h-3.5 w-3.5 mr-1" }),
                                    "新增一行项记录"
                                  )
                                )
                              )
                            ) : React.createElement("input", {
                              type: "text",
                              value: val || '',
                              onChange: (e) => handleFieldChange(field.key, e.target.value),
                              className: "w-full rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                            })
                          )
                        );
                      })
                    )
                  )
                )
              )
            ) : (
              // Raw Code Editor Workspace
              React.createElement("div", { className: "flex flex-col h-[550px] bg-gray-950 rounded-2xl border dark:border-gray-800 overflow-hidden" },
                React.createElement("div", { className: "flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800" },
                  React.createElement("span", { className: "font-mono text-xs text-gray-400" }, "config.json"),
                  React.createElement("div", { className: "flex space-x-2" },
                    React.createElement("button", { onClick: handleFormat, disabled: !validation.isValid, className: "px-2 py-1 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40" }, "美化格式"),
                    React.createElement("button", { onClick: handleMinify, disabled: !validation.isValid, className: "px-2 py-1 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40" }, "压缩"),
                    React.createElement("button", { 
                      onClick: () => {
                        navigator.clipboard.writeText(localCode);
                        triggerToast('复制成功');
                      },
                      className: "px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500" 
                    }, "复制")
                  )
                ),
                React.createElement("div", { className: "flex-1 flex" },
                  React.createElement("textarea", {
                    value: localCode,
                    onChange: (e) => handleCodeChange(e.target.value),
                    spellCheck: false,
                    className: "flex-1 resize-none bg-transparent text-indigo-300 font-mono text-sm p-4 focus:outline-none overflow-y-auto"
                  })
                ),
                React.createElement("div", { className: "p-2.5 bg-gray-900 text-xs border-t border-gray-800 flex items-center " + (validation.isValid ? 'text-green-400' : 'text-red-400') },
                  React.createElement("i", { "data-lucide": "info", className: "h-4 w-4 mr-1.5" }),
                  React.createElement("span", null, validation.isValid ? '✓ JSON 语法校验：合格有效' : '✗ 格式错误：' + validation.error)
                )
              )
            ),

            // Modal array object editor overlay
            editingArrayPath && React.createElement("div", { className: "fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs" },
              React.createElement("div", { className: "bg-white dark:bg-gray-950 rounded-2xl border p-6 w-full max-w-sm" },
                React.createElement("h4", { className: "text-sm font-bold mb-4" }, "新增一行项记录"),
                React.createElement("div", { className: "space-y-3" },
                  Object.keys(newItemObject).map(k => React.createElement("div", { key: k },
                    React.createElement("label", { className: "text-xs font-bold capitalize block text-gray-500 mb-1" }, k),
                    typeof newItemObject[k] === 'boolean' ? React.createElement("button", {
                      onClick: () => setNewItemObject(prev => ({ ...prev, [k]: !prev[k] })),
                      className: "relative inline-flex h-5 w-10 rounded-full " + (newItemObject[k] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700')
                    }, React.createElement("span", { className: "h-4 w-4 transform rounded-full bg-white transition duration-200 " + (newItemObject[k] ? 'translate-x-5' : 'translate-x-0') }))
                    : React.createElement("input", {
                      type: typeof newItemObject[k] === 'number' ? 'number' : 'text',
                      value: newItemObject[k],
                      onChange: (e) => {
                        const v = typeof newItemObject[k] === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                        setNewItemObject(prev => ({ ...prev, [k]: v }));
                      },
                      className: "w-full rounded-md border p-1.5 text-xs bg-white dark:bg-gray-800 dark:border-gray-600"
                    })
                  ))
                ),
                React.createElement("div", { className: "flex justify-end space-x-2 mt-4 pt-4 border-t" },
                  React.createElement("button", { onClick: () => setEditingArrayPath(null), className: "px-3 py-1.5 text-xs font-semibold rounded border hover:bg-gray-50" }, "取消"),
                  React.createElement("button", { 
                    onClick: () => {
                      const next = [...(getValueByPath(config, editingArrayPath) || []), newItemObject];
                      handleFieldChange(editingArrayPath, next);
                      setEditingArrayPath(null);
                    },
                    className: "px-4 py-1.5 text-xs font-semibold rounded bg-indigo-600 text-white" 
                  }, "添加记录")
                )
              )
            )

          )
        )
      );
    }

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App));
  </script>
</body>
</html>`;

      const blob = new Blob([standaloneHtmlContent], { type: 'text/html;charset=utf-8' });
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
      downloadAnchor.setAttribute("download", "tools.html");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('极简离线版 tools.html 已成功生成并下载！', 'success');
      setMascotMessage("哇塞！极简离线版 tools.html 已经打包成功啦！放进包包里带走吧～🎀");
      setMascotExpression('excited');
    } catch (e) {
      showToast('打包极简单页面 HTML 失败。', 'error');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-[#180d14] text-[#ffe3ec]' : 'bg-[#fff5f6] text-[#4a353d]'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Toast Alert Banner */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-xl text-white transition-all transform animate-bounce duration-300 ${
            toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-pink-500'
          }`}>
            <span className="text-sm font-bold">🌸 {toast.message}</span>
          </div>
        )}

        {/* Top Header Section */}
        <header className={`flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 mb-8 ${isDarkMode ? 'border-pink-950/20' : 'border-pink-100'}`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg shadow-pink-500/20">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-pink-600 dark:text-pink-400">
                🎀 萌·配置文件生成器 (Config Box)
              </h1>
              <p className="text-xs text-[#6e4e59] dark:text-[#ccb3bc] mt-1.5 font-bold flex items-center">
                <span>零代码基础的可视化 JSON 交互编辑，支持导入、美化、校验与下载 🌸</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            {/* Dark mode toggle */}
            <button
              id="btn-toggle-theme"
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl border border-pink-100 bg-white/80 hover:bg-pink-50 dark:border-pink-950/30 dark:bg-[#251620] dark:hover:bg-pink-950/10 transition-colors shadow-xs"
              title="切换亮色/暗色主题"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> : <Moon className="h-5 w-5 text-pink-500" />}
            </button>

            {/* Import file upload button */}
            <button
              id="btn-import-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl border border-pink-100 bg-white/80 hover:bg-pink-50 text-[#6e4e59] dark:border-pink-950/30 dark:bg-[#251620] dark:text-pink-200 dark:hover:bg-pink-950/20 transition-all shadow-xs cursor-pointer"
            >
              <Upload className="h-4 w-4 shrink-0 text-pink-500" />
              <span>导入 JSON</span>
            </button>
            <input
              id="input-file-hidden"
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />

            {/* Export JSON download button */}
            <button
              id="btn-download-json"
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold rounded-2xl bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-md shadow-pink-500/25 cursor-pointer"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>保存 config.json</span>
            </button>
          </div>
        </header>

        {/* Interactive Chibi Mascot Speech Bubble Banner */}
        <div className="bg-white/90 dark:bg-[#251620]/90 border-2 border-pink-100 dark:border-pink-900/30 rounded-3xl p-5 mb-8 shadow-xl shadow-pink-100/20 dark:shadow-none flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 relative overflow-hidden transition-all duration-300">
          <div className="absolute right-3 top-3 opacity-15 dark:opacity-10 text-pink-500 select-none pointer-events-none">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>
          {/* Chibi Mascot Image */}
          <div className="shrink-0 relative">
            <div className={`w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-950/40 p-1 border-2 border-pink-200 dark:border-pink-800/30 overflow-hidden flex items-center justify-center transition-all duration-300 ${
              mascotExpression === 'happy'
                ? 'animate-bounce [animation-duration:0.6s] scale-105'
                : mascotExpression === 'excited'
                ? 'animate-bounce [animation-duration:0.4s] rotate-6 scale-110'
                : mascotExpression === 'sad'
                ? 'animate-pulse opacity-85 translate-y-1 rotate-[-4deg]'
                : mascotExpression === 'wink'
                ? 'scale-105 rotate-3'
                : 'hover:scale-105 hover:rotate-2'
            }`}>
              <img 
                src="/icon.png" 
                alt="小萌 Mascot" 
                className="w-full h-full object-contain rounded-full select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-3xs px-2 py-0.5 rounded-full font-black shadow-xs select-none">小萌</span>
          </div>

          {/* Speech bubble */}
          <div className="flex-1 relative bg-pink-50/40 dark:bg-pink-950/10 border border-pink-100/40 dark:border-pink-900/10 rounded-2xl p-4.5">
            <div className="absolute left-4 -top-2 md:-left-2 md:top-7 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-pink-100/40 dark:border-b-pink-900/10 md:rotate-270" />
            <p className="text-sm font-bold text-[#4a353d] dark:text-[#ffe3ec] leading-relaxed">
              {mascotMessage}
            </p>
          </div>
        </div>
        
        {/* index.release.html Release Injector Tools */}
        {activeTemplate.id === 'markdown_moe' ? (
          <div className="bg-gray-50/55 dark:bg-[#1a0f16]/60 border border-gray-200/50 dark:border-pink-950/20 rounded-3xl p-6 mb-8 shadow-inner transition-all animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 opacity-65">
                <div className="p-2.5 bg-gray-200 dark:bg-gray-800 rounded-2xl shrink-0 text-gray-400 dark:text-gray-500">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    📦 index.release.html 预发布端配置工具
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-medium max-w-2xl leading-relaxed">
                    当前选中的是 <strong>完整版（萌·Markdown 预览器）</strong>。此版本使用独立的 <code className="bg-gray-100 dark:bg-gray-950 px-1 py-0.5 rounded text-gray-500 font-mono text-2xs">config.json</code>，不支持将配置内嵌打包到 HTML。
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const basicTpl = templates.find(t => t.id === 'markdown_basic');
                    if (basicTpl) handleTemplateSelect(basicTpl);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 dark:border-pink-800 dark:bg-[#251620] dark:text-pink-300 dark:hover:bg-pink-950/20 transition-all cursor-pointer shadow-xs"
                >
                  切换到基础发布模板
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-pink-50/40 to-white dark:from-[#2e1927]/40 dark:to-[#251620]/95 border-2 border-pink-100/70 dark:border-pink-900/40 rounded-3xl p-6 mb-8 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 bg-pink-100 dark:bg-pink-950/80 rounded-2xl shrink-0 text-pink-500">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#4a353d] dark:text-white flex items-center gap-1.5">
                    📦 index.release.html 预发布端配置工具 (v{APP_VERSION})
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300 font-medium max-w-2xl leading-relaxed">
                    必须先在右侧上传您现有的 <code className="bg-pink-100/40 dark:bg-pink-950/40 px-1 py-0.5 rounded text-pink-600 font-mono text-2xs">index.release.html</code> 文件，系统自动提取其中 <code className="bg-pink-100/40 dark:bg-pink-950/40 px-1 py-0.5 rounded text-pink-600 font-mono text-2xs">id="release-config"</code> 的 JSON 后方能允许重新打包下载。
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  id="btn-upload-html"
                  type="button"
                  onClick={() => htmlInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl border border-pink-200 bg-white hover:bg-pink-50 text-pink-600 dark:border-pink-800 dark:bg-[#251620] dark:text-pink-300 dark:hover:bg-pink-950/20 transition-all shadow-xs cursor-pointer"
                >
                  <Upload className="h-4 w-4 shrink-0 text-pink-500" />
                  <span>上传 index.release.html</span>
                </button>
                <input
                  id="input-html-hidden"
                  type="file"
                  ref={htmlInputRef}
                  onChange={handleHtmlImport}
                  accept=".html"
                  className="hidden"
                />

                <button
                  id="btn-download-html"
                  type="button"
                  onClick={handleDownloadHtml}
                  disabled={!uploadedHtmlContent}
                  className={`flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-md ${
                    uploadedHtmlContent 
                      ? "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>打包并下载 index.release.html</span>
                </button>
              </div>
            </div>

            {/* Uploaded HTML status indicator */}
            {uploadedHtmlContent ? (
              <div className="mt-4 flex items-center space-x-2 p-3.5 rounded-2xl bg-green-50/50 border border-green-100 dark:bg-green-950/10 dark:border-green-900/20 text-xs text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 shrink-0 text-green-500 animate-pulse" />
                <div className="font-bold flex flex-wrap gap-x-2 gap-y-1">
                  <span>已成功载入 HTML 模板：</span>
                  <span className="font-mono text-green-600 dark:text-green-400 bg-green-100/30 px-1.5 py-0.5 rounded">{uploadedHtmlName}</span>
                  <span>，修改后的配置 JSON 将打包注入其中并开放下载。</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center space-x-2 p-3.5 rounded-2xl bg-amber-50/20 border border-amber-200/20 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
                <span className="font-bold">⚠️ 请先上传 index.release.html 文件，仅上传或修改 config.json 无法下载打包文件。</span>
              </div>
            )}
          </div>
        )}

        {/* Templates Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
              请选择一个基础模板开始配置
            </h2>
          </div>
          <TemplateSelector 
            templates={templates} 
            onSelect={handleTemplateSelect} 
            activeId={activeTemplate.id} 
          />
        </div>

        {/* Tab Switch View Mode */}
        <div className="flex border-b border-pink-100 dark:border-pink-950/20 mb-6">
          <button
            id="btn-tab-visual"
            type="button"
            onClick={() => setViewMode('visual')}
            className={`flex items-center px-6 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
              viewMode === 'visual'
                ? 'border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                : 'border-transparent text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
            }`}
          >
            <Eye className="mr-2 h-4 w-4" />
            可视化表单模式 (适合小白)
          </button>
          <button
            id="btn-tab-code"
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center px-6 py-3 border-b-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
              viewMode === 'code'
                ? 'border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                : 'border-transparent text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
            }`}
          >
            <Code className="mr-2 h-4 w-4" />
            源码高级模式 (代码校验)
          </button>
        </div>

        {/* Core Workspace Main panel */}
        <div className="space-y-4">
          {viewMode === 'visual' ? (
            <FormGenerator 
              config={config} 
              schema={activeTemplate.schema} 
              onChange={handleConfigChange} 
            />
          ) : (
            <JsonView 
              config={config} 
              onChange={handleConfigChange} 
              onValidationChange={handleValidationChange}
            />
          )}
        </div>

        {/* Base64 & Markdown Link Helper Tool */}
        <div className="mt-12 bg-white/95 dark:bg-[#251620]/95 border-2 border-pink-100/50 dark:border-pink-900/30 rounded-3xl p-6 shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-pink-50/50 dark:border-pink-950/20">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-pink-100 dark:bg-pink-950/80 rounded-2xl text-pink-500 shrink-0 animate-bounce-slow">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#4a353d] dark:text-white flex items-center gap-1.5">
                  🔐 Base64 ＆ Markdown 链接助手 (v1.4.3)
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  快速加密转换原始 Markdown 链接防参数乱码，或对配置值进行 Base64 加解密
                </p>
              </div>
            </div>
            
            {/* Cute Tab Buttons */}
            <div className="flex bg-pink-50/50 dark:bg-pink-950/30 p-1 rounded-2xl border border-pink-100/30 dark:border-pink-900/20 shrink-0">
              <button
                type="button"
                onClick={() => setBase64ToolMode('link')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  base64ToolMode === 'link'
                    ? "bg-pink-500 text-white shadow-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-pink-500"
                }`}
              >
                🔗 专属链接生成
              </button>
              <button
                type="button"
                onClick={() => setBase64ToolMode('text')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  base64ToolMode === 'text'
                    ? "bg-pink-500 text-white shadow-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-pink-500"
                }`}
              >
                🔐 通用加解密
              </button>
            </div>
          </div>

          {base64ToolMode === 'link' ? (
            /* Tab 1: Markdown Link Builder */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              {/* Parameter Settings */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[#4a353d] dark:text-gray-300 mb-2 flex justify-between items-center">
                  <span>📝 输入 Markdown 原始 Raw 链接 (Markdown URL)</span>
                  <span className="text-pink-500 font-bold">必填</span>
                </label>
                <textarea
                  value={markdownUrl}
                  onChange={(e) => {
                    setMarkdownUrl(e.target.value);
                    // Live preview / generate support
                    if (e.target.value.trim()) {
                      handleGenerateMoeUrl(e.target.value, prefixPreset, customPrefix);
                    } else {
                      setGeneratedMoeUrl('');
                    }
                  }}
                  placeholder="在此输入或粘贴原始的 Markdown 文件直链，例如：
https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/main/README.md"
                  className="w-full h-24 px-4 py-3 text-xs font-medium rounded-2xl border border-pink-100 dark:border-pink-950/40 bg-pink-50/10 dark:bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden focus:border-pink-400 focus:ring-1 focus:ring-pink-400 resize-none transition-all"
                />

                <div className="mt-4">
                  <label className="text-xs font-bold text-[#4a353d] dark:text-gray-300 mb-2.5 block">
                    🌐 选择载入网关 (Viewer Gateway Prefix)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPrefixPreset('kg');
                        handleGenerateMoeUrl(markdownUrl, 'kg', customPrefix);
                      }}
                      className={`px-3 py-2 text-3xs sm:text-2xs font-bold rounded-xl border text-left transition-all ${
                        prefixPreset === 'kg'
                          ? "border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 dark:border-pink-600"
                          : "border-pink-100/50 dark:border-pink-950/40 hover:bg-pink-50/30 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        <Globe className="h-3 w-3 shrink-0 text-pink-500" />
                        <span>主线路 (.os.kg)</span>
                      </div>
                      <div className="text-4xs text-gray-400 mt-0.5 font-mono truncate">moe520.haoqi75.os.kg</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrefixPreset('mt');
                        handleGenerateMoeUrl(markdownUrl, 'mt', customPrefix);
                      }}
                      className={`px-3 py-2 text-3xs sm:text-2xs font-bold rounded-xl border text-left transition-all ${
                        prefixPreset === 'mt'
                          ? "border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 dark:border-pink-600"
                          : "border-pink-100/50 dark:border-pink-950/40 hover:bg-pink-50/30 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        <Globe className="h-3 w-3 shrink-0 text-pink-500" />
                        <span>备用线路 (.cn.mt)</span>
                      </div>
                      <div className="text-4xs text-gray-400 mt-0.5 font-mono truncate">moe520.haoqi75.cn.mt</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrefixPreset('custom');
                        handleGenerateMoeUrl(markdownUrl, 'custom', customPrefix);
                      }}
                      className={`px-3 py-2 text-3xs sm:text-2xs font-bold rounded-xl border text-left transition-all ${
                        prefixPreset === 'custom'
                          ? "border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 dark:border-pink-600"
                          : "border-pink-100/50 dark:border-pink-950/40 hover:bg-pink-50/30 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3 shrink-0 text-pink-500" />
                        <span>自定义前缀</span>
                      </div>
                      <div className="text-4xs text-gray-400 mt-0.5 font-mono truncate">手动输入特定前缀</div>
                    </button>
                  </div>
                </div>

                {prefixPreset === 'custom' && (
                  <div className="mt-3 animate-fade-in">
                    <input
                      type="text"
                      value={customPrefix}
                      onChange={(e) => {
                        setCustomPrefix(e.target.value);
                        handleGenerateMoeUrl(markdownUrl, 'custom', e.target.value);
                      }}
                      placeholder="请输入前缀，例如 http://localhost:3000/"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-pink-100 dark:border-pink-950/40 bg-transparent text-gray-700 dark:text-gray-200 focus:outline-hidden focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
                    />
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateMoeUrl()}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-bold rounded-2xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>合成加密链接</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMoeUrl}
                    className="p-2.5 text-xs font-bold rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-400 dark:border-gray-800 dark:bg-[#251620]/50 dark:text-gray-500 dark:hover:bg-gray-850 transition-all cursor-pointer"
                    title="清空"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Synthesized Output */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex justify-between items-center">
                  <span>✨ 专属合成链接 (Moe Encrypted Link)</span>
                  {generatedMoeUrl && (
                    <span className="font-mono text-2xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      安全避开 & 和 ?
                    </span>
                  )}
                </label>
                <textarea
                  readOnly
                  value={generatedMoeUrl}
                  placeholder="在左侧输入 Markdown 原始直链后，系统将在此处自动生成对应的专属加密加载链接..."
                  className="w-full h-32 px-4 py-3 text-xs font-mono rounded-2xl border border-pink-100 dark:border-pink-950/40 bg-gray-50/30 dark:bg-gray-900/10 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden resize-none"
                />

                <div className="mt-4 grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={handleCopyMoeUrl}
                    disabled={!generatedMoeUrl}
                    className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-sm ${
                      generatedMoeUrl 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                    <span>复制合成链接</span>
                  </button>

                  {generatedMoeUrl ? (
                    <a
                      href={generatedMoeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>立即打开测试</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>未生成无法打开</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: General Base64 Encrypt/Decrypt */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              {/* Input panel */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex justify-between items-center">
                  <span>📝 输入原文 / 密文 (Input Text)</span>
                  {base64Input && (
                    <span className="font-mono text-2xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {base64Input.length} 字符
                    </span>
                  )}
                </label>
                <textarea
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder="在此处输入待加密的普通文本，或粘贴需要解密的 Base64 字符串..."
                  className="w-full h-32 px-4 py-3 text-xs font-medium rounded-2xl border border-pink-100 dark:border-pink-950/40 bg-pink-50/10 dark:bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden focus:border-pink-400 focus:ring-1 focus:ring-pink-400 resize-none transition-all"
                />
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleBase64Encode}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-bold rounded-2xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-sm cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>加密 (Encode)</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBase64Decode}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 text-xs font-bold rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 dark:border-pink-800 dark:bg-[#251620] dark:text-pink-300 dark:hover:bg-pink-950/20 transition-all shadow-xs cursor-pointer"
                  >
                    <Unlock className="h-3.5 w-3.5 shrink-0 text-pink-500" />
                    <span>解密 (Decode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearBase64}
                    title="清空"
                    className="p-2.5 text-xs font-bold rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-400 dark:border-gray-800 dark:bg-[#251620]/50 dark:text-gray-500 dark:hover:bg-gray-850 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Output panel */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex justify-between items-center">
                  <span>✨ 运算输出结果 (Output Result)</span>
                  {base64Output && (
                    <span className="font-mono text-2xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {base64Output.length} 字符
                    </span>
                  )}
                </label>
                <textarea
                  readOnly
                  value={base64Output}
                  placeholder="运算结果将显示在这里..."
                  className="w-full h-32 px-4 py-3 text-xs font-mono rounded-2xl border border-pink-100 dark:border-pink-950/40 bg-gray-50/30 dark:bg-gray-900/10 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden resize-none"
                />

                <div className="mt-3 flex">
                  <button
                    type="button"
                    onClick={handleCopyBase64Result}
                    disabled={!base64Output}
                    className={`w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-sm ${
                      base64Output 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                    <span>复制结果 (Copy Result)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className={`mt-16 pt-6 border-t text-center text-xs text-[#a3808c] dark:text-[#735862] ${isDarkMode ? 'border-pink-950/20' : 'border-pink-100/50'}`}>
          <p>© 2026 🌸 小白配置文件简易生成编辑器 · 萌化极简版 v{APP_VERSION} 🌸 所有配置均在浏览器本地保存解析，100% 安全隐私。</p>
          <div className="mt-2.5 flex justify-center space-x-3 text-pink-500/60 dark:text-pink-400/40 font-semibold">
            <span>支持格式自动转换</span>
            <span>•</span>
            <span>自动匹配属性类型</span>
            <span>•</span>
            <span>一键保存与下载 config.json</span>
          </div>
          <div className="mt-3.5 flex justify-center">
            <a 
              href="https://github.com/haoqi75/markdown-viewer-moe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-pink-50/50 hover:bg-pink-100 text-pink-600 dark:bg-pink-950/20 dark:hover:bg-pink-900/30 dark:text-pink-400 transition-all text-xs font-bold border border-pink-100/30 dark:border-pink-900/20 cursor-pointer shadow-xs"
            >
              <Github className="h-3.5 w-3.5 shrink-0" />
              <span>GitHub 仓库 (haoqi75)</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
