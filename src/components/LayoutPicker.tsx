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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-[#141414]/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif italic font-bold">选择排版布局</h2>
                <p className="text-xs opacity-40 uppercase tracking-widest mt-1">Layout Selection</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors">
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
                    "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left group",
                    selectedLayout === option.id 
                      ? "border-[#141414] bg-[#141414] text-white" 
                      : "border-[#141414]/5 hover:border-[#141414]/20 hover:bg-[#F5F5F0]"
                  )}
                >
                  <div className="w-full aspect-video bg-[#E4E3E0] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                    {/* Visual representation of layout */}
                    <div className={cn(
                      "w-full h-full p-2 flex gap-1",
                      option.id === 'split_v' ? "flex-row" : "flex-col",
                      option.id === 'centered' ? "items-center justify-center" : ""
                    )}>
                      <div className={cn(
                        "bg-white/40 rounded",
                        option.id === 'standard' ? "w-full h-2/3" : 
                        option.id === 'split_v' ? "w-1/2 h-full" :
                        option.id === 'split_h' ? "w-full h-1/2" :
                        option.id === 'centered' ? "w-1/2 h-1/2" : "w-full h-full opacity-20"
                      )} />
                      <div className={cn(
                        "bg-white/20 rounded",
                        option.id === 'standard' ? "w-full h-1/3" : 
                        option.id === 'split_v' ? "w-1/2 h-full" :
                        option.id === 'split_h' ? "w-full h-1/2" :
                        option.id === 'centered' ? "hidden" : "w-full h-full opacity-10"
                      )} />
                    </div>
                    {selectedLayout === option.id && (
                      <div className="absolute top-2 right-2 bg-white text-[#141414] rounded-full p-1">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className={cn(
                    "text-[10px] mt-1",
                    selectedLayout === option.id ? "opacity-60" : "opacity-40"
                  )}>{option.description}</span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-[#F5F5F0] flex justify-end">
              <button 
                onClick={onClose}
                className="bg-[#141414] text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
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
