import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  FileText, 
  QrCode, 
  Upload, 
  Settings, 
  Layers, 
  Download, 
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Maximize2,
  ChevronRight,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { MaterialType, CanvasSize, MATERIAL_TEMPLATES, LayoutType, ChatSession, GenerationRecord, IndustryTheme } from './types';
import { useDropzone } from 'react-dropzone';

// Components
import SidebarLeft from './components/SidebarLeft';
import CanvasArea from './components/CanvasArea';
import PromptInput from './components/PromptInput';
import LayoutPicker from './components/LayoutPicker';
import HistorySidebar from './components/HistorySidebar';
import TemplatePicker from './components/TemplatePicker';

export default function App() {
  const [materialType, setMaterialType] = useState<MaterialType>('poster');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(MATERIAL_TEMPLATES.poster[0]);
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [prompt, setPrompt] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New States
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', title: '理财产品海报生成', createdAt: Date.now(), records: [] }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  // Template States
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [activeTheme, setActiveTheme] = useState<IndustryTheme | null>(null);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话 ' + (sessions.length + 1),
      createdAt: Date.now(),
      records: []
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setGeneratedImage(null);
    setPrompt('');
    setReferenceImages([]);
    setSelectedRegion(null);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let finalPrompt = `Generate a financial marketing ${materialType} with the following description: ${prompt}. 
      Layout style: ${layout}. 
      Dimensions: ${canvasSize.width}x${canvasSize.height}. 
      Style: Professional, trustworthy, financial industry.`;

      if (selectedRegion) {
        finalPrompt = `Adjust the following region in the existing image: x=${selectedRegion.x}, y=${selectedRegion.y}, width=${selectedRegion.width}, height=${selectedRegion.height}. 
        Adjustment description: ${prompt}. 
        Keep the rest of the image consistent.`;
      }
      
      const parts: any[] = [{ text: finalPrompt }];
      
      referenceImages.forEach((img) => {
        parts.push({
          inlineData: {
            data: img.split(',')[1],
            mimeType: "image/png"
          }
        });
      });

      if (generatedImage && selectedRegion) {
        parts.push({
          inlineData: {
            data: generatedImage.split(',')[1],
            mimeType: "image/png"
          }
        });
      }

      // Calculate best aspect ratio for Gemini 3.1
      const ratio = canvasSize.width / canvasSize.height;
      let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1" = "1:1";
      
      if (ratio > 7) aspectRatio = "8:1";
      else if (ratio > 3.5) aspectRatio = "4:1";
      else if (ratio > 1.5) aspectRatio = "16:9";
      else if (ratio > 1.2) aspectRatio = "4:3";
      else if (ratio < 0.13) aspectRatio = "1:8";
      else if (ratio < 0.26) aspectRatio = "1:4";
      else if (ratio < 0.6) aspectRatio = "9:16";
      else if (ratio < 0.8) aspectRatio = "3:4";

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: "1K"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newImg = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImage(newImg);
          
          // Save to history
          const newRecord: GenerationRecord = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            imageUrl: newImg,
            prompt: prompt,
            size: canvasSize,
            type: materialType,
            layout: layout
          };

          setSessions(prev => prev.map(s => 
            s.id === currentSessionId 
              ? { ...s, records: [newRecord, ...s.records] } 
              : s
          ));
        }
      }
      setSelectedRegion(null);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReversePrompt = async (imageUrl: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Analyze this financial marketing image and provide a detailed prompt that could be used to generate a similar image. Focus on composition, color palette, financial elements, and atmosphere." },
            { inlineData: { data: imageUrl.split(',')[1], mimeType: "image/png" } }
          ]
        }
      });
      setPrompt(response.text || '');
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-grok-bg text-grok-text font-sans overflow-hidden">
      {/* Left Sidebar */}
      <SidebarLeft 
        activeType={materialType} 
        onTypeChange={(type) => {
          setMaterialType(type);
          setCanvasSize(MATERIAL_TEMPLATES[type][0]);
          setShowLayoutPicker(true);
        }} 
        onNewChat={handleNewChat}
        onToggleHistory={() => setShowHistory(true)}
        canvasSize={canvasSize}
        setCanvasSize={setCanvasSize}
        logo={logo}
        setLogo={setLogo}
        qrCode={qrCode}
        setQrCode={setQrCode}
        onReversePrompt={handleReversePrompt}
        isAnalyzing={isAnalyzing}
        onOpenTemplate={(theme) => {
          setActiveTheme(theme);
          setShowTemplatePicker(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-grok-bg">
        <header className="h-14 border-b border-grok-border flex items-center justify-between px-6 bg-grok-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tighter text-xl">FinGen</span>
            <span className="text-[10px] uppercase tracking-widest text-grok-muted px-2 py-0.5 border border-grok-border rounded-full">Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (generatedImage) {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `fingen-${Date.now()}.png`;
                  link.click();
                }
              }}
              className="grok-btn-primary flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              <span>导出</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col bg-grok-bg relative">
            <CanvasArea 
              size={canvasSize} 
              generatedImage={generatedImage}
              logo={logo}
              qrCode={qrCode}
              isGenerating={isGenerating}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
            
            {/* Bottom Prompt Area */}
            <div className="max-w-4xl w-full mx-auto pb-8 px-6">
              <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onFileProcess={(content) => setPrompt(prev => prev + "\n" + content)}
                selectedRegion={selectedRegion}
                referenceImages={referenceImages}
                setReferenceImages={setReferenceImages}
                onReversePrompt={handleReversePrompt}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      <LayoutPicker 
        isOpen={showLayoutPicker}
        onClose={() => setShowLayoutPicker(false)}
        selectedLayout={layout}
        onSelect={setLayout}
      />

      <TemplatePicker 
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        theme={activeTheme}
        onSelect={(template) => {
          setPrompt(template.prompt);
          setMaterialType(template.type);
          setLayout(template.layout);
          setCanvasSize(MATERIAL_TEMPLATES[template.type][0]);
          setGeneratedImage(template.previewUrl);
        }}
      />

      <HistorySidebar 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          const session = sessions.find(s => s.id === id);
          if (session && session.records.length > 0) {
            setGeneratedImage(session.records[0].imageUrl);
            setCanvasSize(session.records[0].size);
            setMaterialType(session.records[0].type);
            setLayout(session.records[0].layout);
            setPrompt(session.records[0].prompt);
          }
        }}
        onNewSession={handleNewChat}
        onDeleteSession={(id) => {
          setSessions(sessions.filter(s => s.id !== id));
          if (currentSessionId === id) handleNewChat();
        }}
        onViewRecord={(record) => {
          setGeneratedImage(record.imageUrl);
          setCanvasSize(record.size);
          setMaterialType(record.type);
          setLayout(record.layout);
          setPrompt(record.prompt);
          setShowHistory(false);
        }}
      />
    </div>
  );
}
