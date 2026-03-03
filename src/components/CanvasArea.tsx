import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import { CanvasSize } from '../types';
import { Loader2, Maximize2, MousePointer2, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

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

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 40; // Reduced padding for better fit
        const availableWidth = clientWidth - padding * 2;
        const availableHeight = clientHeight - padding * 2;
        
        const scaleX = availableWidth / size.width;
        const scaleY = availableHeight / size.height;
        const newScale = Math.min(scaleX, scaleY); // Allow scaling up if needed, but usually limited by available space
        
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
    if (!generatedImage) return;
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
    <div ref={containerRef} className="flex-1 flex items-center justify-center p-10 relative overflow-hidden">
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

            {/* Selection Rectangle */}
            {selectedRegion && (
              <Rect
                x={selectedRegion.x}
                y={selectedRegion.y}
                width={selectedRegion.width}
                height={selectedRegion.height}
                stroke="#141414"
                strokeWidth={2 / scale}
                dash={[5 / scale, 5 / scale]}
                fill="rgba(255, 255, 255, 0.2)"
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

        {/* Selected Region Actions */}
        {selectedRegion && !isDrawing && (
          <div 
            className="absolute z-30 flex items-center gap-2"
            style={{ 
              left: selectedRegion.x * scale, 
              top: (selectedRegion.y + selectedRegion.height) * scale + 10 
            }}
          >
            <div className="bg-[#141414] text-white px-3 py-1.5 rounded-full text-[10px] font-medium flex items-center gap-2 shadow-xl">
              <Sparkles size={12} />
              <span>局部调整模式</span>
              <button 
                onClick={() => setSelectedRegion(null)}
                className="ml-2 p-0.5 hover:bg-white/20 rounded-full"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-[#F5F5F0] transition-colors">
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CanvasArea;
