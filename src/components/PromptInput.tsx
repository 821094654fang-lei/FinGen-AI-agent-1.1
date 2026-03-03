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
    <div className="p-6 bg-white/50 backdrop-blur-md border-t border-[#141414]/10">
      <div 
        {...getRootProps()} 
        className={cn(
          "max-w-4xl mx-auto relative transition-all duration-300",
          isDragActive ? "scale-[1.02]" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 z-10 bg-[#141414]/5 border-2 border-dashed border-[#141414]/20 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex items-center gap-3 text-[#141414] font-medium">
              <FileIcon className="animate-bounce" />
              <span>松开以上传文档或参考图</span>
            </div>
          </div>
        )}

        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想生成的金融营销内容... (例如: 推广一款年化收益4.5%的稳健型理财产品，风格高端大气)"
            className="w-full bg-white border border-[#141414]/10 rounded-2xl p-4 pr-32 min-h-[120px] focus:ring-2 focus:ring-[#141414]/5 focus:border-[#141414]/20 transition-all resize-none text-sm leading-relaxed"
          />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !prompt || isProcessingFile}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all",
                isGenerating || !prompt || isProcessingFile
                  ? "bg-[#141414]/10 text-[#141414]/30 cursor-not-allowed"
                  : "bg-[#141414] text-white hover:bg-[#333] shadow-lg shadow-[#141414]/10"
              )}
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
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {/* Upload Button */}
          <button 
            onClick={open}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] hover:bg-[#E4E3E0] rounded-xl text-xs font-medium text-[#141414]/60 transition-colors"
          >
            <Upload size={14} />
            <span>上传 PDF/Excel/参考图</span>
          </button>

          {/* Reference Images Gallery */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {referenceImages.map((img, i) => (
              <div key={i} className="relative group/img flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-[#141414]/10 shadow-sm">
                <img src={img} alt="Ref" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button 
                    onClick={() => onReversePrompt(img)}
                    disabled={isAnalyzing}
                    className="p-1 bg-white rounded-full text-[#141414] hover:scale-110 transition-transform"
                  >
                    {isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
                  </button>
                  <button 
                    onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-1 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <p className="mt-4 text-[10px] text-[#141414]/40 text-center uppercase tracking-[0.2em]">
          Powered by Gemini 3.1 Flash Image & Gemini 3 Flash
        </p>
      </div>
    </div>
  );
};

export default PromptInput;
