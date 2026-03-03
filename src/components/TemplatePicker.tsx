import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles } from 'lucide-react';
import { IndustryTemplate, IndustryTheme } from '../types';
import { cn } from '../lib/utils';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: IndustryTheme | null;
  onSelect: (template: IndustryTemplate) => void;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose, theme, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && theme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-grok-surface border border-grok-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-grok-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-black rounded-xl">
                  {theme.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tighter">{theme.label} · 优质模版</h2>
                  <p className="text-[10px] text-grok-muted uppercase tracking-widest mt-1">Premium Industry Templates</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-grok-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-6 custom-scrollbar">
              {theme.templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelect(template);
                    onClose();
                  }}
                  className="flex flex-col items-start group text-left"
                >
                  <div className="w-full aspect-[3/4] bg-grok-bg rounded-2xl mb-3 overflow-hidden relative border border-grok-border group-hover:border-white/20 transition-all">
                    <img 
                      src={template.previewUrl} 
                      alt={template.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Sparkles size={14} />
                        使用模版
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-sm text-white">{template.name}</span>
                  <span className="text-[10px] text-grok-muted uppercase tracking-widest mt-1">{template.type} · {template.layout}</span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-black flex justify-between items-center border-t border-grok-border">
              <p className="text-[10px] text-grok-muted max-w-md">
                选择模版后将自动填充提示词、布局和物料类型，您可以基于此进行二次创作。
              </p>
              <button 
                onClick={onClose}
                className="text-sm font-medium text-grok-muted hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplatePicker;
