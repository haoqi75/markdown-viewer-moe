import React from 'react';
import { ConfigTemplate } from '../types';
import { Globe, Server, Gamepad2, Settings, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  templates: ConfigTemplate[];
  onSelect: (template: ConfigTemplate) => void;
  activeId?: string;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="h-5 w-5 text-pink-500 dark:text-pink-400 animate-pulse" />;
    case 'Globe':
      return <Globe className="h-5 w-5 text-pink-500 dark:text-pink-400" />;
    case 'Server':
      return <Server className="h-5 w-5 text-[#ff477e] dark:text-[#ff7096]" />;
    case 'Gamepad2':
      return <Gamepad2 className="h-5 w-5 text-[#ff85a2] dark:text-[#f8ad9d]" />;
    default:
      return <Settings className="h-5 w-5 text-pink-400 dark:text-pink-500" />;
  }
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect, activeId }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((tpl) => {
        const isActive = tpl.id === activeId;
        return (
          <button
            id={`tpl-card-${tpl.id}`}
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl)}
            className={`group text-left p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
              isActive
                ? 'border-pink-400 bg-pink-50/25 ring-2 ring-pink-500/20 dark:border-pink-500/50 dark:bg-pink-950/10'
                : 'border-pink-100/50 bg-white/80 hover:border-pink-200 hover:bg-pink-50/20 dark:border-pink-950/20 dark:bg-gray-950 dark:hover:border-pink-900/40'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                isActive 
                  ? 'bg-pink-100 dark:bg-pink-950/80' 
                  : 'bg-pink-50/30 group-hover:bg-pink-50 dark:bg-pink-950/10 dark:group-hover:bg-pink-950/40'
              }`}>
                {getIcon(tpl.icon)}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#4a353d] group-hover:text-pink-500 dark:text-white dark:group-hover:text-pink-400 transition-colors">
                  {tpl.name}
                </h4>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-300 font-medium">
                  {tpl.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
