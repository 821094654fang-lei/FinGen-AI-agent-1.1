import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl, title }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Reset scale and position when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) { // Always allow wheel zoom in preview
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(Math.max(scale + delta, 0.5), 5);
      setScale(newScale);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-zoom-out"
            onClick={onClose}
          />
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
            <div className="text-white/80">
              <h3 className="text-sm font-medium">{title || '物料预览'}</h3>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">Scroll to zoom · Drag to pan</p>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-md border border-white/10">
                <button onClick={() => setScale(Math.max(scale - 0.2, 0.5))} className="p-1 hover:text-white text-white/60 transition-colors">
                  <ZoomOut size={16} />
                </button>
                <span className="text-[10px] font-mono text-white w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(Math.min(scale + 0.2, 5))} className="p-1 hover:text-white text-white/60 transition-colors">
                  <ZoomIn size={16} />
                </button>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div 
            ref={containerRef}
            className="relative w-full h-full overflow-hidden flex items-center justify-center"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <motion.div
              style={{ 
                scale,
                x: position.x,
                y: position.y,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              className="relative shadow-2xl"
            >
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-[90vw] max-h-[85vh] object-contain select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `fingen-preview-${Date.now()}.png`;
                link.click();
              }}
              className="bg-white text-[#141414] px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl"
            >
              <Download size={18} />
              <span>下载当前版本</span>
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
