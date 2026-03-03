import React, { useCallback, useState } from 'react';
import { 
  Layout, 
  ImageIcon, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  Layers,
  Plus,
  History,
  Settings,
  Upload,
  Trash2,
  QrCode as QrIcon,
  Search,
  Loader2,
  Users,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MaterialType, CanvasSize, IndustryTheme } from '../types';
import { cn } from '../lib/utils';
import { useDropzone } from 'react-dropzone';

interface SidebarLeftProps {
  activeType: MaterialType;
  onTypeChange: (type: MaterialType) => void;
  onNewChat: () => void;
  onToggleHistory: () => void;
  
  // Props from SidebarRight
  canvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  qrCode: string | null;
  setQrCode: (qr: string | null) => void;
  onReversePrompt: (imageUrl: string) => void;
  isAnalyzing: boolean;

  // New Template Props
  onOpenTemplate: (theme: IndustryTheme) => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  activeType, 
  onTypeChange, 
  onNewChat, 
  onToggleHistory,
  canvasSize,
  setCanvasSize,
  logo,
  setLogo,
  qrCode,
  setQrCode,
  onReversePrompt,
  isAnalyzing,
  onOpenTemplate
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['material', 'templates']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const menuItems = [
    { id: 'poster', label: '营销海报', icon: <ImageIcon size={20} />, description: '朋友圈、社群分享' },
    { id: 'banner', label: '横幅广告', icon: <Layout size={20} />, description: 'APP、网页展位' },
    { id: 'long_image', label: '产品长图', icon: <FileText size={20} />, description: '详情介绍、长图文' },
    { id: 'custom', label: '自定义尺寸', icon: <Layers size={20} />, description: '灵活配置规格' },
  ];

  const industryThemes: IndustryTheme[] = [
    { 
      id: 'hr', 
      label: '行政招聘', 
      icon: <Users size={16} />,
      templates: [
        { id: 'hr1', name: '极简招聘海报', previewUrl: 'https://picsum.photos/seed/hr1/600/800', prompt: 'Minimalist recruitment poster for an administrative role, clean typography, professional office background', type: 'poster', layout: 'minimal' },
        { id: 'hr2', name: '互联网大厂风格', previewUrl: 'https://picsum.photos/seed/hr2/600/800', prompt: 'Tech company style recruitment poster, vibrant colors, geometric shapes, energetic atmosphere', type: 'poster', layout: 'standard' },
      ]
    },
    { 
      id: 'virtual', 
      label: '虚拟金融', 
      icon: <CreditCard size={16} />,
      templates: [
        { id: 'vf1', name: '数字货币推广', previewUrl: 'https://picsum.photos/seed/vf1/600/800', prompt: 'Digital currency promotion banner, futuristic neon style, blockchain elements, high tech feel', type: 'banner', layout: 'split_h' },
        { id: 'vf2', name: '虚拟账户开户', previewUrl: 'https://picsum.photos/seed/vf2/600/800', prompt: 'Virtual bank account opening poster, safe and secure atmosphere, modern mobile app UI elements', type: 'poster', layout: 'centered' },
      ]
    },
    { 
      id: 'wealth', 
      label: '财富管理', 
      icon: <TrendingUp size={16} />,
      templates: [
        { id: 'wm1', name: '高端理财周报', previewUrl: 'https://picsum.photos/seed/wm1/600/800', prompt: 'High-end wealth management weekly report, elegant serif fonts, gold and navy blue palette', type: 'long_image', layout: 'standard' },
      ]
    },
    { 
      id: 'insurance', 
      label: '保险保障', 
      icon: <ShieldCheck size={16} />,
      templates: [
        { id: 'ins1', name: '家庭守护计划', previewUrl: 'https://picsum.photos/seed/ins1/600/800', prompt: 'Family insurance protection plan poster, warm lighting, happy family in background, protective shield icon', type: 'poster', layout: 'split_v' },
      ]
    },
  ];

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }, [setLogo]);

  const onDropQR = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setQrCode(reader.result as string);
    reader.readAsDataURL(file);
  }, [setQrCode]);

  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({ onDrop: onDropLogo, accept: { 'image/*': [] }, multiple: false });
  const { getRootProps: getQRProps, getInputProps: getQRInput } = useDropzone({ onDrop: onDropQR, accept: { 'image/*': [] }, multiple: false });

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-2 group"
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="opacity-40" />
        <h2 className="text-[11px] font-serif italic uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{title}</h2>
      </div>
      {expandedSections.includes(id) ? <ChevronDown size={14} className="opacity-40" /> : <ChevronRight size={14} className="opacity-40" />}
    </button>
  );

  return (
    <aside className="w-72 border-r border-[#141414]/10 flex flex-col bg-white overflow-hidden">
      <div className="p-4 border-b border-[#141414]/5">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-[#141414] text-white p-3 rounded-2xl hover:bg-[#333] transition-all shadow-lg shadow-[#141414]/10"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">开启新对话</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {/* Material Type Section */}
        <section>
          <SectionHeader id="material" title="物料类型" icon={Layers} />
          {expandedSections.includes('material') && (
            <nav className="space-y-1 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTypeChange(item.id as MaterialType)}
                  className={cn(
                    "w-full flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left",
                    activeType === item.id 
                      ? "bg-[#F5F5F0] text-[#141414]" 
                      : "hover:bg-[#F5F5F0]/50 text-[#141414]/70"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      activeType === item.id ? "bg-[#141414] text-white" : "bg-[#E4E3E0]"
                    )}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <span className="text-[10px] opacity-40 ml-11">
                    {item.description}
                  </span>
                </button>
              ))}
            </nav>
          )}
        </section>

        {/* Industry Templates Section */}
        <section>
          <SectionHeader id="templates" title="行业模版" icon={Users} />
          {expandedSections.includes('templates') && (
            <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {industryThemes.map((theme) => (
                <button 
                  key={theme.id}
                  onClick={() => onOpenTemplate(theme)}
                  className="w-full flex items-center justify-between p-2 text-xs font-medium text-[#141414]/60 hover:text-[#141414] hover:bg-[#F5F5F0] rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E4E3E0] flex items-center justify-center group-hover:bg-[#141414] group-hover:text-white transition-colors">
                      {theme.icon}
                    </div>
                    {theme.label}
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Dimensions Section */}
        <section>
          <SectionHeader id="dimensions" title="规格设置" icon={Settings} />
          {expandedSections.includes('dimensions') && (
            <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] uppercase opacity-50">宽度 (px)</label>
                <input 
                  type="number" 
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize({ ...canvasSize, width: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#F5F5F0] border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#141414]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase opacity-50">高度 (px)</label>
                <input 
                  type="number" 
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize({ ...canvasSize, height: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#F5F5F0] border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#141414]"
                />
              </div>
            </div>
          )}
        </section>

        {/* Assets Section */}
        <section>
          <SectionHeader id="assets" title="品牌资产" icon={Plus} />
          {expandedSections.includes('assets') && (
            <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Logo Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Logo 替换</span>
                  {logo && <button onClick={() => setLogo(null)} className="text-[#141414]/40 hover:text-red-500"><Trash2 size={14} /></button>}
                </div>
                <div {...getLogoProps()} className="border-2 border-dashed border-[#141414]/5 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F5F0] transition-colors">
                  <input {...getLogoInput()} />
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-12 object-contain" />
                  ) : (
                    <>
                      <Upload size={20} className="opacity-20 mb-2" />
                      <span className="text-[10px] opacity-40">点击或拖拽上传 Logo</span>
                    </>
                  )}
                </div>
              </div>

              {/* QR Code Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">二维码配置</span>
                  {qrCode && <button onClick={() => setQrCode(null)} className="text-[#141414]/40 hover:text-red-500"><Trash2 size={14} /></button>}
                </div>
                <div {...getQRProps()} className="border-2 border-dashed border-[#141414]/5 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F5F0] transition-colors">
                  <input {...getQRInput()} />
                  {qrCode ? (
                    <img src={qrCode} alt="QR" className="h-12 w-12 object-contain" />
                  ) : (
                    <>
                      <QrIcon size={20} className="opacity-20 mb-2" />
                      <span className="text-[10px] opacity-40">上传渠道二维码</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="p-4 border-t border-[#141414]/5">
        <button 
          onClick={onToggleHistory}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-[#141414]/60 hover:text-[#141414] hover:bg-[#F5F5F0] transition-all"
        >
          <History size={20} />
          <span className="font-medium text-sm">历史生成记录</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarLeft;
