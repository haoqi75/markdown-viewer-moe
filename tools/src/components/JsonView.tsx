import React, { useState, useEffect } from 'react';
import { Copy, Check, Info, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { ValidationResult } from '../types';

interface JsonViewProps {
  config: Record<string, any>;
  onChange: (updatedConfig: Record<string, any>) => void;
  onValidationChange?: (validation: ValidationResult) => void;
}

export const JsonView: React.FC<JsonViewProps> = ({ config, onChange, onValidationChange }) => {
  const [localText, setLocalText] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [copied, setCopied] = useState<boolean>(false);

  // Sync from prop config
  useEffect(() => {
    try {
      const formatted = JSON.stringify(config, null, 2);
      // Only set local text if it's currently valid or empty, to avoid overwriting user typing
      if (validation.isValid) {
        setLocalText(formatted);
      }
    } catch (e) {
      // Do nothing
    }
  }, [config]);

  const handleTextChange = (text: string) => {
    setLocalText(text);

    if (!text.trim()) {
      const emptyResult = { isValid: false, error: 'JSON 内容不能为空。' };
      setValidation(emptyResult);
      if (onValidationChange) onValidationChange(emptyResult);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('顶层结构必须是一个 JSON 对象 ( { ... } )。');
      }
      
      const successResult = { isValid: true };
      setValidation(successResult);
      if (onValidationChange) onValidationChange(successResult);
      onChange(parsed);
    } catch (err: any) {
      // Extract line info if possible
      let errorMessage = err.message || 'JSON 语法错误';
      let errorLine: number | undefined;

      const lineMatch = errorMessage.match(/at position (\d+)/);
      if (lineMatch) {
        const position = parseInt(lineMatch[1], 10);
        const prefix = text.substring(0, position);
        errorLine = prefix.split('\n').length;
        errorMessage = `${errorMessage.replace(/at position \d+/, '')} (在第 ${errorLine} 行附近)`;
      }

      const failResult = { isValid: false, error: errorMessage, line: errorLine };
      setValidation(failResult);
      if (onValidationChange) onValidationChange(failResult);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(localText);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalText(formatted);
      setValidation({ isValid: true });
      if (onValidationChange) onValidationChange({ isValid: true });
      onChange(parsed);
    } catch (e: any) {
      // Cannot format invalid JSON
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(localText);
      const minified = JSON.stringify(parsed);
      setLocalText(minified);
      setValidation({ isValid: true });
      if (onValidationChange) onValidationChange({ isValid: true });
      onChange(parsed);
    } catch (e: any) {
      // Cannot minify invalid JSON
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-gray-100 bg-gray-950 shadow-sm overflow-hidden dark:border-gray-800">
      {/* Editor Menu Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/60 px-4 py-2.5">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="pl-2 font-mono text-xs font-semibold text-gray-400">config.json</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-format-json"
            type="button"
            onClick={handleFormat}
            disabled={!validation.isValid}
            className="flex items-center rounded-md bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            美化格式
          </button>
          <button
            id="btn-minify-json"
            type="button"
            onClick={handleMinify}
            disabled={!validation.isValid}
            className="flex items-center rounded-md bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            压缩
          </button>
          <button
            id="btn-copy-json"
            type="button"
            onClick={handleCopy}
            className="flex items-center rounded-md bg-pink-500 px-3 py-1 text-xs font-bold text-white hover:bg-pink-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                复制
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Textarea input code container */}
      <div className="flex-1 relative flex bg-[#1e1319]">
        {/* Line numbers dummy (Simple decorative representation) */}
        <div className="w-12 border-r border-gray-800/60 bg-gray-900/20 py-4 select-none text-right pr-3 font-mono text-xs text-gray-500">
          {Array.from({ length: localText.split('\n').length || 1 }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Input */}
        <textarea
          id="textarea-json-code"
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-sm leading-6 text-pink-300 focus:outline-none focus:ring-0 selection:bg-pink-500/30 overflow-y-auto"
        />
      </div>

      {/* Validation Banner Footer */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-t border-gray-800 text-xs ${
        validation.isValid 
          ? 'bg-green-950/20 text-green-400' 
          : 'bg-red-950/20 text-red-400'
      }`}>
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 shrink-0" />
          <span className="font-semibold">
            {validation.isValid ? '✓ JSON 格式检验：合格有效' : `✗ 格式错误：${validation.error}`}
          </span>
        </div>
        {!validation.isValid && (
          <span className="font-mono bg-red-900/30 px-1.5 py-0.5 rounded text-2xs uppercase">
            格式错误
          </span>
        )}
      </div>
    </div>
  );
};
