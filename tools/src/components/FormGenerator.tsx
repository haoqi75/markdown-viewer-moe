import React, { useState } from 'react';
import { ConfigGroup, ConfigFieldMetadata } from '../types';
import { 
  Sliders, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';

interface FormGeneratorProps {
  config: Record<string, any>;
  schema?: ConfigGroup[];
  onChange: (updatedConfig: Record<string, any>) => void;
}

// Helper to access nested objects by path (e.g., "theme.primaryColor")
export const getValueByPath = (obj: any, path: string): any => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

// Helper to set nested objects by path
export const setValueByPath = (obj: any, path: string, value: any): any => {
  const newObj = { ...obj };
  const parts = path.split('.');
  let current = newObj;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      current[part] = value;
    } else {
      current[part] = current[part] ? { ...current[part] } : {};
      current = current[part];
    }
  }
  return newObj;
};

// Auto-infer schema from JSON if none is provided
export const inferSchema = (json: Record<string, any>): ConfigGroup[] => {
  const groups: ConfigGroup[] = [];
  const generalFields: ConfigFieldMetadata[] = [];
  
  // Categorize keys
  Object.keys(json).forEach((key) => {
    const value = json[key];
    
    if (value === null || value === undefined) {
      return;
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // It's a nested object - create a group for it!
      const nestedFields: ConfigFieldMetadata[] = [];
      Object.keys(value).forEach((subKey) => {
        const subValue = value[subKey];
        const fullPath = `${key}.${subKey}`;
        
        if (typeof subValue === 'boolean') {
          nestedFields.push({ key: fullPath, label: subKey, type: 'boolean' });
        } else if (typeof subValue === 'number') {
          nestedFields.push({ key: fullPath, label: subKey, type: 'number' });
        } else if (typeof subValue === 'string') {
          // Check if color
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
          description: `配置 ${key} 下的子项参数`,
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
      // Primitives
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

export const FormGenerator: React.FC<FormGeneratorProps> = ({ config, schema, onChange }) => {
  const activeSchema = schema || inferSchema(config);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<Record<string, boolean>>({});
  
  // Array Object state
  const [editingArrayPath, setEditingArrayPath] = useState<string | null>(null);
  const [newItemObject, setNewItemObject] = useState<Record<string, any>>({});
  const [expandedArrayItems, setExpandedArrayItems] = useState<Record<string, boolean>>({});

  // Object key-value temporary states
  const [newKeyInputs, setNewKeyInputs] = useState<Record<string, string>>({});
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});

  const toggleHelp = (key: string) => {
    setShowHelp(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFieldChange = (key: string, val: any) => {
    const updated = setValueByPath(config, key, val);
    onChange(updated);
  };

  const handleArrayStringAdd = (key: string, newItem: string) => {
    if (!newItem.trim()) return;
    const currentList = getValueByPath(config, key) || [];
    const updatedList = [...currentList, newItem.trim()];
    handleFieldChange(key, updatedList);
  };

  const handleArrayStringRemove = (key: string, index: number) => {
    const currentList = getValueByPath(config, key) || [];
    const updatedList = currentList.filter((_: any, i: number) => i !== index);
    handleFieldChange(key, updatedList);
  };

  // Render a field input
  const renderFieldInput = (field: ConfigFieldMetadata) => {
    const value = getValueByPath(config, field.key);
    
    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <button
              id={`btn-bool-${field.key}`}
              type="button"
              onClick={() => handleFieldChange(field.key, !value)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${
                value ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 font-bold">
              {value ? '🌸 开启 (True)' : '🧸 关闭 (False)'}
            </span>
          </div>
        );

      case 'number':
        const min = field.min ?? 0;
        const max = field.max ?? 100;
        const step = field.step ?? 1;
        return (
          <div className="flex items-center space-x-4">
            <input
              id={`input-number-${field.key}`}
              type="number"
              value={value ?? ''}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              className="w-24 rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm font-bold text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white"
            />
            {field.min !== undefined && field.max !== undefined && (
              <input
                id={`slider-number-${field.key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value ?? min}
                onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-pink-100/40 dark:bg-pink-950/30 accent-pink-500"
              />
            )}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-pink-100 dark:border-pink-900/40 shadow-sm">
              <input
                id={`picker-color-${field.key}`}
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="absolute -inset-1 h-14 w-14 cursor-pointer border-0 p-0"
              />
            </div>
            <input
              id={`input-color-${field.key}`}
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-28 rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm uppercase text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white font-mono"
            />
          </div>
        );

      case 'select':
        return (
          <select
            id={`select-${field.key}`}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full max-w-xs rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white"
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={`textarea-${field.key}`}
            rows={3}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-xl border border-pink-100 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white"
          />
        );

      case 'array_string':
        const list = value || [];
        return (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {list.map((item: string, idx: number) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700 ring-1 ring-inset ring-pink-700/10 dark:bg-pink-950/30 dark:text-pink-300 dark:ring-pink-500/20 shadow-xs"
                >
                  {item}
                  <button
                    id={`btn-del-tag-${field.key}-${idx}`}
                    type="button"
                    onClick={() => handleArrayStringRemove(field.key, idx)}
                    className="ml-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-pink-400 hover:bg-pink-200 hover:text-pink-900 dark:hover:bg-pink-900 font-bold transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              {list.length === 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">空列表</span>
              )}
            </div>
            <div className="flex max-w-sm space-x-2">
              <input
                id={`input-tag-${field.key}`}
                type="text"
                placeholder="输入后回车添加..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayStringAdd(field.key, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="flex-1 rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white"
              />
              <button
                id={`btn-add-tag-${field.key}`}
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleArrayStringAdd(field.key, input.value);
                  input.value = '';
                }}
                className="rounded-xl bg-pink-50 px-4 py-2 text-xs font-bold text-pink-600 hover:bg-pink-100 dark:bg-pink-950/60 dark:text-pink-400 dark:hover:bg-pink-950/80 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        );

      case 'array_object':
        const objList = value || [];
        const isExpanded = expandedArrayItems[field.key];
        return (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  共计 {objList.length} 个子项列表
                </span>
              </div>
              <button
                id={`btn-toggle-expand-${field.key}`}
                type="button"
                onClick={() => setExpandedArrayItems(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {isExpanded ? '折叠列表' : '展开列表'}
                {isExpanded ? <ChevronDown className="ml-1 h-3.5 w-3.5" /> : <ChevronRight className="ml-1 h-3.5 w-3.5" />}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                {objList.map((item: Record<string, any>, idx: number) => (
                  <div 
                    key={idx}
                    className="flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-700/50">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        子项 #{idx + 1}
                      </span>
                      <button
                        id={`btn-del-obj-item-${field.key}-${idx}`}
                        type="button"
                        onClick={() => {
                          const updated = objList.filter((_: any, i: number) => i !== idx);
                          handleFieldChange(field.key, updated);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="删除该项目"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Render field inputs for each key of this item */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.keys(item).map((itemKey) => {
                        const subVal = item[itemKey];
                        const itemValType = typeof subVal;
                        return (
                          <div key={itemKey} className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">{itemKey}</label>
                            {itemValType === 'boolean' ? (
                              <div className="flex items-center h-8">
                                <button
                                  id={`btn-bool-sub-${field.key}-${idx}-${itemKey}`}
                                  type="button"
                                  onClick={() => {
                                    const updatedItem = { ...item, [itemKey]: !subVal };
                                    const updatedList = [...objList];
                                    updatedList[idx] = updatedItem;
                                    handleFieldChange(field.key, updatedList);
                                  }}
                                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    subVal ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                                  }`}
                                >
                                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    subVal ? 'translate-x-5' : 'translate-x-0'
                                  }`} />
                                </button>
                              </div>
                            ) : itemValType === 'number' ? (
                              <input
                                id={`input-num-sub-${field.key}-${idx}-${itemKey}`}
                                type="number"
                                value={subVal ?? ''}
                                onChange={(e) => {
                                  const updatedItem = { ...item, [itemKey]: parseFloat(e.target.value) || 0 };
                                  const updatedList = [...objList];
                                  updatedList[idx] = updatedItem;
                                  handleFieldChange(field.key, updatedList);
                                }}
                                className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              />
                            ) : (
                              <input
                                id={`input-str-sub-${field.key}-${idx}-${itemKey}`}
                                type="text"
                                value={subVal ?? ''}
                                onChange={(e) => {
                                  const updatedItem = { ...item, [itemKey]: e.target.value };
                                  const updatedList = [...objList];
                                  updatedList[idx] = updatedItem;
                                  handleFieldChange(field.key, updatedList);
                                }}
                                className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Add new item input */}
                <div className="border-t border-dashed border-gray-200 pt-3 dark:border-gray-700">
                  <button
                    id={`btn-add-item-modal-${field.key}`}
                    type="button"
                    onClick={() => {
                      // Get typical keys from current list, or provide default keys
                      const sampleKeys = objList.length > 0 ? Object.keys(objList[0]) : ['name', 'value'];
                      const defaults: Record<string, any> = {};
                      sampleKeys.forEach(k => {
                        const sampleVal = objList.length > 0 ? objList[0][k] : '';
                        defaults[k] = typeof sampleVal === 'boolean' ? false : typeof sampleVal === 'number' ? 0 : '';
                      });
                      setNewItemObject(defaults);
                      setEditingArrayPath(field.key);
                    }}
                    className="flex w-full items-center justify-center rounded-lg border border-dashed border-indigo-300 bg-indigo-50/20 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-950/10 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    新增一行项记录
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'object': {
        const dictionary = value || {};
        const entries = Object.entries(dictionary);
        const newKey = newKeyInputs[field.key] || '';
        const newVal = newValueInputs[field.key] || '';

        const handleAddPair = () => {
          if (!newKey.trim()) {
            return;
          }
          const updatedDict = {
            ...dictionary,
            [newKey.trim()]: newVal.trim()
          };
          handleFieldChange(field.key, updatedDict);
          // clear inputs for this field
          setNewKeyInputs(prev => ({ ...prev, [field.key]: '' }));
          setNewValueInputs(prev => ({ ...prev, [field.key]: '' }));
        };

        const handleRemoveKey = (k: string) => {
          const updatedDict = { ...dictionary };
          delete updatedDict[k];
          handleFieldChange(field.key, updatedDict);
        };

        const handleRenameKey = (oldKey: string, newKeyName: string) => {
          if (oldKey === newKeyName) return;
          if (newKeyName !== '' && Object.prototype.hasOwnProperty.call(dictionary, newKeyName) && newKeyName !== oldKey) {
            return;
          }
          const updatedDict: Record<string, any> = {};
          for (const [k, v] of Object.entries(dictionary)) {
            if (k === oldKey) {
              updatedDict[newKeyName] = v;
            } else {
              updatedDict[k] = v;
            }
          }
          handleFieldChange(field.key, updatedDict);
        };

        const handleUpdateValue = (k: string, v: string) => {
          const updatedDict = {
            ...dictionary,
            [k]: v
          };
          handleFieldChange(field.key, updatedDict);
        };

        return (
          <div className="space-y-3 p-4 rounded-2xl border border-pink-100/60 dark:border-pink-900/20 bg-pink-50/10 dark:bg-transparent">
            {entries.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                <div className="flex text-3xs font-bold text-gray-400 dark:text-gray-500 px-1 mb-1 justify-between">
                  <span>✏️ 别名 Key (可直接修改)</span>
                  <span className="pr-12">🔗 Markdown 原始直链</span>
                </div>
                {entries.map(([k, v], idx) => (
                  <div key={`${field.key}_${idx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={k}
                      onChange={(e) => handleRenameKey(k, e.target.value)}
                      className="w-1/3 sm:w-1/4 rounded-xl border border-pink-200/80 bg-pink-100/30 px-3 py-1.5 text-xs font-mono font-bold text-pink-700 focus:border-pink-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-pink-400 dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-pink-300 dark:focus:bg-gray-800 shrink-0"
                      placeholder="别名 Key"
                      title="可以直接编辑修改别名 Key"
                    />
                    <input
                      type="text"
                      value={String(v)}
                      onChange={(e) => handleUpdateValue(k, e.target.value)}
                      className="flex-1 rounded-xl border border-pink-100 bg-white px-3.5 py-1.5 text-xs text-[#4a353d] focus:border-pink-400 focus:outline-hidden focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white font-mono"
                      placeholder="对应的直链地址..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveKey(k)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="删除该别名"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500 italic pb-1">暂无任何别名映射记录，请在下方添加</div>
            )}

            {/* Addition Form */}
            <div className="flex flex-col sm:flex-row gap-2 border-t border-dashed border-pink-100/50 dark:border-pink-950/20 pt-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKeyInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="新别名 (如 page)"
                className="w-full sm:w-1/3 rounded-xl border border-pink-100 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white font-mono"
              />
              <input
                type="text"
                value={newVal}
                onChange={(e) => setNewValueInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="Markdown 原始文件直链 (https://...)"
                className="flex-1 rounded-xl border border-pink-100 bg-white px-3.5 py-1.5 text-xs text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 dark:border-pink-900/40 dark:bg-gray-800 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPair();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddPair}
                className="flex items-center justify-center space-x-1 px-4 py-1.5 text-xs font-bold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>添加别名</span>
              </button>
            </div>
          </div>
        );
      }

      default:
        return (
          <input
            id={`input-default-${field.key}`}
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Category Tabs (Left on wide screens, top on small) */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="space-y-1 rounded-2xl bg-pink-50/20 p-2 dark:bg-pink-950/5 border border-pink-100/30 dark:border-pink-900/10">
          {activeSchema.map((group, idx) => (
            <button
              id={`tab-btn-${idx}`}
              key={group.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex w-full items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-150 ${
                activeTab === idx
                  ? 'bg-white text-pink-600 shadow-sm shadow-pink-100/30 dark:bg-gray-800 dark:text-pink-400'
                  : 'text-gray-600 hover:bg-pink-50/50 hover:text-pink-600 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center text-left truncate">
                <Sliders className={`mr-2.5 h-4 w-4 shrink-0 ${activeTab === idx ? 'text-pink-500 dark:text-pink-400' : 'text-gray-400'}`} />
                {group.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Fields Form Area */}
      <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {activeSchema[activeTab] && (
          <div className="space-y-6">
            {/* Tab Header Description */}
            <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {activeSchema[activeTab].name}
              </h3>
              {activeSchema[activeTab].description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {activeSchema[activeTab].description}
                </p>
              )}
            </div>

            {/* Render Form Fields */}
            <div className="space-y-5">
              {activeSchema[activeTab].fields.map((field) => (
                <div 
                  key={field.key} 
                  className="space-y-2 rounded-xl border border-transparent hover:border-gray-50 dark:hover:border-gray-900/40 p-1"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      {field.label}
                      <span className="ml-1.5 font-mono text-2xs text-gray-400 dark:text-gray-500 font-normal">
                        ({field.key})
                      </span>
                    </label>

                    {/* Quick Help Icon */}
                    {field.description && (
                      <button
                        id={`btn-help-${field.key}`}
                        type="button"
                        onClick={() => toggleHelp(field.key)}
                        className="text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                        title="查看帮助说明"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Help Box if enabled */}
                  {field.description && showHelp[field.key] && (
                    <div className="flex items-start space-x-2 rounded-xl bg-pink-50/40 px-3.5 py-2.5 text-xs text-pink-700 dark:bg-pink-950/10 dark:text-pink-300 border border-pink-100/30 dark:border-pink-900/10">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-500" />
                      <span>{field.description}</span>
                    </div>
                  )}

                  {/* Input container */}
                  <div className="mt-1.5">
                    {renderFieldInput(field)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Array Object Addition Modal dialog overlay */}
      {editingArrayPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              新增行项项目 ({editingArrayPath})
            </h4>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {Object.keys(newItemObject).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                    {key}
                  </label>
                  {typeof newItemObject[key] === 'boolean' ? (
                    <div className="flex items-center h-9">
                      <button
                        id={`btn-new-item-bool-${key}`}
                        type="button"
                        onClick={() => setNewItemObject(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          newItemObject[key] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          newItemObject[key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ) : typeof newItemObject[key] === 'number' ? (
                    <input
                      id={`input-new-item-num-${key}`}
                      type="number"
                      value={newItemObject[key]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setNewItemObject(prev => ({ ...prev, [key]: val }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    <input
                      id={`input-new-item-str-${key}`}
                      type="text"
                      value={newItemObject[key]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewItemObject(prev => ({ ...prev, [key]: val }));
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                id="btn-cancel-new-item"
                type="button"
                onClick={() => setEditingArrayPath(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                取消
              </button>
              <button
                id="btn-confirm-new-item"
                type="button"
                onClick={() => {
                  const currentList = getValueByPath(config, editingArrayPath) || [];
                  const updatedList = [...currentList, newItemObject];
                  handleFieldChange(editingArrayPath, updatedList);
                  setEditingArrayPath(null);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
              >
                添加记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
