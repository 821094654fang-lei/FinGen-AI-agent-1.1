import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { LayoutType, LAYOUT_OPTIONS } from '../types';
import { cn } from '../lib/utils';

interface LayoutPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayout: LayoutType;
  onSelect: (layout: LayoutType) => void;
}

const LayoutPicker: React.FC<LayoutPickerProps> = ({ isOpen, onClose, selectedLayout, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-2xl bg-grok-surface border border-grok-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-grok-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tighter">选择排版布局</h2>
                <p className="text-[10px] text-grok-muted uppercase tracking-widest mt-1">Layout Selection</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-grok-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id);
                    onClose();
                  }}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl border transition-all text-left group",
                    selectedLayout === option.id 
                      ? "border-white bg-white text-black" 
                      : "border-grok-border hover:border-white/20 hover:bg-white/5 text-grok-muted"
                  )}
                >
                  <div className="w-full aspect-video bg-grok-bg rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                    {/* Visual representation of layout */}
                    <div className={cn(
                      "w-full h-full p-2 flex gap-1",
                      option.id === 'split_v' ? "flex-row" : "flex-col",
                      option.id === 'centered' ? "items-center justify-center" : ""
                    )}>
                      <div className={cn(
                        "bg-white/20 rounded",
                        option.id === 'standard' ? "w-full h-2/3" : 
                        option.id === 'split_v' ? "w-1/2 h-full" :
                        option.id === 'split_h' ? "w-full h-1/2" :
                        option.id === 'centered' ? "w-1/2 h-1/2" : "w-full h-full opacity-20"
                      )} />
                      <div className={cn(
                        "bg-white/10 rounded",
                        option.id === 'standard' ? "w-full h-1/3" : 
                        option.id === 'split_v' ? "w-1/2 h-full" :
                        option.id === 'split_h' ? "w-full h-1/2" :
                        option.id === 'centered' ? "hidden" : "w-full h-full opacity-10"
                      )} />
                    </div>
                    {selectedLayout === option.id && (
                      <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "font-medium text-sm",
                    selectedLayout === option.id ? "text-black" : "text-white"
                  )}>{option.label}</span>
                  <span className={cn(
                    "text-[10px] mt-1",
                    selectedLayout === option.id ? "text-black/60" : "text-grok-muted"
                  )}>{option.description}</span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-black flex justify-end border-t border-grok-border">
              <button 
                onClick={onClose}
                className="grok-btn-primary"
              >
                确认选择
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LayoutPicker;
