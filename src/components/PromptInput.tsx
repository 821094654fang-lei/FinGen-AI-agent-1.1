import React, { useCallback, useState } from 'react';
import { 
  Send, 
  FileText, 
  FileSpreadsheet, 
  File as FileIcon,
  Loader2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onFileProcess: (content: string) => void;
  selectedRegion: { x: number, y: number, width: number, height: number } | null;
  
  // Reference Image Props
  referenceImages: string[];
  setReferenceImages: (images: (prev: string[]) => string[]) => void;
  onReversePrompt: (imageUrl: string) => void;
  isAnalyzing: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  isGenerating,
  onFileProcess,
  selectedRegion,
  referenceImages,
  setReferenceImages,
  onReversePrompt,
  isAnalyzing
}) => {
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const onDropFile = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Handle images separately as reference images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setReferenceImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle documents
    setIsProcessingFile(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type || 'application/octet-stream';

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: "Extract the core marketing content, product features, and key data from this document. Summarize it into a concise description suitable for generating a financial marketing poster or banner." },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        });

        if (response.text) {
          onFileProcess(response.text);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File processing failed:", error);
    } finally {
      setIsProcessingFile(false);
    }
  }, [onFileProcess, setReferenceImages]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop: onDropFile,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative transition-all duration-300",
          isDragActive ? "scale-[1.01]" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 z-10 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex items-center gap-3 text-white font-medium">
              <FileIcon className="animate-bounce" />
              <span>松开以上传</span>
            </div>
          </div>
        )}

        <div className="relative group grok-card p-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想生成的金融营销内容..."
            className="w-full bg-transparent border-none p-4 pr-32 min-h-[100px] focus:ring-0 transition-all resize-none text-sm leading-relaxed text-white placeholder:text-grok-muted"
          />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !prompt || isProcessingFile}
              className="grok-btn-primary flex items-center gap-2"
            >
              {isGenerating || isProcessingFile ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>生成</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Assets & Upload Area */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* Upload Button */}
          <button 
            onClick={open}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[11px] font-medium text-grok-muted transition-colors border border-grok-border"
          >
            <Upload size={12} />
            <span>上传文件/参考图</span>
          </button>

          {/* Reference Images Gallery */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {referenceImages.map((img, i) => (
              <div key={i} className="relative group/img flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-grok-border shadow-sm">
                <img src={img} alt="Ref" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button 
                    onClick={() => onReversePrompt(img)}
                    disabled={isAnalyzing}
                    className="p-1 bg-white rounded-full text-black hover:scale-110 transition-transform"
                  >
                    {isAnalyzing ? <Loader2 size={8} className="animate-spin" /> : <Search size={8} />}
                  </button>
                  <button 
                    onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-1 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                  >
                    <X size={8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
