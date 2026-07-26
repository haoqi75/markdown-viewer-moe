import React from 'react';
import { ConfigTemplate } from '../types';
import { Globe, Server, Gamepad2, Settings, Sparkles } from 'lucide-react';

interface ThemePalette {
  name: string;
  metaColor: string;
  lightBg: string;
  darkBg: string;
  lightText: string;
  darkText: string;
  primaryAccent: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  badgeBg: string;
  shadow: string;
}

interface TemplateSelectorProps {
  templates: ConfigTemplate[];
  onSelect: (template: ConfigTemplate) => void;
  activeId?: string;
  activePalette?: ThemePalette;
}

const getIcon = (iconName: string, activePalette?: ThemePalette) => {
  const style = activePalette ? { color: activePalette.primaryAccent } : {};
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="h-5 w-5 animate-pulse" style={style} />;
    case 'Globe':
      return <Globe className="h-5 w-5" style={style} />;
    case 'Server':
      return <Server className="h-5 w-5" style={style} />;
    case 'Gamepad2':
      return <Gamepad2 className="h-5 w-5" style={style} />;
    default:
      return <Settings className="h-5 w-5" style={style} />;
  }
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect, activeId, activePalette }) => {
  const accentColor = activePalette?.primaryAccent || '#ec4899';
  const lightBgColor = activePalette?.primaryLight || '#fff0f3';

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
            className="group text-left p-5 rounded-3xl border transition-all duration-300 cursor-pointer shadow-2xs"
            style={{
              borderColor: isActive ? accentColor : 'rgba(244, 114, 182, 0.2)',
              backgroundColor: isActive ? (activePalette?.primaryLight + '50' || 'rgba(255,240,243,0.5)') : 'rgba(255,255,255,0.8)',
              boxShadow: isActive ? `0 0 0 2px ${accentColor}30, 0 4px 12px ${activePalette?.shadow || 'rgba(0,0,0,0.05)'}` : 'none'
            }}
          >
            <div className="flex items-start space-x-3.5">
              <div 
                className="p-2.5 rounded-xl shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive ? lightBgColor : 'rgba(0,0,0,0.03)'
                }}
              >
                {getIcon(tpl.icon, activePalette)}
              </div>
              <div>
                <h4 
                  className="text-sm font-black transition-colors"
                  style={{ color: isActive ? accentColor : undefined }}
                >
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

