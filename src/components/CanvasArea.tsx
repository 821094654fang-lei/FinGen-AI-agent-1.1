import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import { CanvasSize } from '../types';
import { Loader2, Maximize2, MousePointer2, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

import ImagePreviewModal from './ImagePreviewModal';

interface CanvasAreaProps {
  size: CanvasSize;
  generatedImage: string | null;
  logo: string | null;
  qrCode: string | null;
  isGenerating: boolean;
  selectedRegion: { x: number, y: number, width: number, height: number } | null;
  setSelectedRegion: (region: { x: number, y: number, width: number, height: number } | null) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  size, 
  generatedImage, 
  logo, 
  qrCode, 
  isGenerating,
  selectedRegion,
  setSelectedRegion
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  const [mainImg, setMainImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 40;
        const availableWidth = clientWidth - padding * 2;
        const availableHeight = clientHeight - padding * 2;
        
        const scaleX = availableWidth / size.width;
        const scaleY = availableHeight / size.height;
        
        const fitScale = Math.min(scaleX, scaleY);
        const newScale = fitScale;
        
        setStageSize({
          width: size.width * newScale,
          height: size.height * newScale
        });
        setScale(newScale);
      }
    };

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    updateSize();
    return () => observer.disconnect();
  }, [size]);

  // Keyboard shortcut for Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && selectedRegion) {
        e.preventDefault();
        const promptArea = document.querySelector('textarea');
        if (promptArea) promptArea.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegion]);

  useEffect(() => {
    if (generatedImage) {
      const img = new window.Image();
      img.src = generatedImage;
      img.onload = () => setMainImg(img);
    } else {
      setMainImg(null);
    }
  }, [generatedImage]);

  useEffect(() => {
    if (logo) {
      const img = new window.Image();
      img.src = logo;
      img.onload = () => setLogoImg(img);
    } else {
      setLogoImg(null);
    }
  }, [logo]);

  useEffect(() => {
    if (qrCode) {
      const img = new window.Image();
      img.src = qrCode;
      img.onload = () => setQrImg(img);
    } else {
      setQrImg(null);
    }
  }, [qrCode]);

  const handleMouseDown = (e: any) => {
    if (!generatedImage || isGenerating) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = (pos.x) / scale;
    const y = (pos.y) / scale;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setSelectedRegion({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = (pos.x) / scale;
    const y = (pos.y) / scale;

    setSelectedRegion({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (selectedRegion && (selectedRegion.width < 5 || selectedRegion.height < 5)) {
      setSelectedRegion(null);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex items-center justify-center p-10 relative overflow-hidden"
    >
      <div 
        className="bg-white shadow-2xl relative group"
        style={{ width: stageSize.width, height: stageSize.height }}
      >
        {/* Canvas Background Info */}
        {!generatedImage && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#141414]/20 pointer-events-none">
            <div className="font-serif italic text-4xl mb-2">{size.width} × {size.height}</div>
            <div className="text-xs uppercase tracking-widest">{size.label}</div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#141414] mb-4" size={32} />
            <p className="text-sm font-medium animate-pulse">正在生成金融营销物料...</p>
          </div>
        )}

        {/* Selection Hint */}
        {generatedImage && !selectedRegion && !isGenerating && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#141414]/80 text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <MousePointer2 size={12} />
            <span>拖拽选择区域进行局部调整</span>
          </div>
        )}

        <Stage 
          width={stageSize.width} 
          height={stageSize.height} 
          scaleX={scale} 
          scaleY={scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {/* Main Generated Image */}
            {mainImg && (
              <KonvaImage
                image={mainImg}
                width={size.width}
                height={size.height}
              />
            )}

            {/* Selection Rectangle - Screenshot Style */}
            {selectedRegion && (
              <Rect
                x={selectedRegion.x}
                y={selectedRegion.y}
                width={selectedRegion.width}
                height={selectedRegion.height}
                stroke="#3B82F6"
                strokeWidth={2 / scale}
                fill="rgba(59, 130, 246, 0.1)"
              />
            )}

            {/* Logo Overlay */}
            {logoImg && (
              <KonvaImage
                image={logoImg}
                x={40}
                y={40}
                width={120}
                height={120 * (logoImg.height / logoImg.width)}
                draggable
              />
            )}

            {/* QR Code Overlay */}
            {qrImg && (
              <KonvaImage
                image={qrImg}
                x={size.width - 160}
                y={size.height - 160}
                width={120}
                height={120}
                draggable
              />
            )}
          </Layer>
        </Stage>

        {/* Selected Region Actions - Screenshot Style */}
        {selectedRegion && !isDrawing && (
          <>
            {/* Number Badge */}
            <div 
              className="absolute z-40 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white"
              style={{ 
                left: selectedRegion.x * scale - 12, 
                top: selectedRegion.y * scale - 12 
              }}
            >
              1
            </div>

            {/* Quick Edit Label */}
            <div 
              className="absolute z-40 flex items-center gap-2"
              style={{ 
                left: (selectedRegion.x + selectedRegion.width) * scale + 8, 
                top: (selectedRegion.y + selectedRegion.height) * scale - 24 
              }}
            >
              <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-gray-700">快捷编辑</span>
                <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] text-gray-500 font-mono">Tab</span>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="ml-1 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
        <button 
          onClick={() => setShowPreview(true)}
          disabled={!generatedImage}
          className={cn(
            "p-3 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center bg-white text-[#141414] hover:bg-[#F5F5F0] disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="放大预览"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Preview Modal */}
      {generatedImage && (
        <ImagePreviewModal 
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          imageUrl={generatedImage}
          title={`${size.label} · ${size.width}x${size.height}`}
        />
      )}
    </div>
  );
};

export default CanvasArea;
