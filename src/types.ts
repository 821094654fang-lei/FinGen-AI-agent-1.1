export type MaterialType = 'poster' | 'banner' | 'long_image' | 'custom';

export interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

export type LayoutType = 'standard' | 'split_v' | 'split_h' | 'centered' | 'minimal';

export interface GenerationRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  size: CanvasSize;
  type: MaterialType;
  layout: LayoutType;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  records: GenerationRecord[];
}

export interface IndustryTemplate {
  id: string;
  name: string;
  previewUrl: string;
  prompt: string;
  type: MaterialType;
  layout: LayoutType;
}

export interface IndustryTheme {
  id: string;
  label: string;
  icon: React.ReactNode;
  templates: IndustryTemplate[];
}

export interface AppState {
  materialType: MaterialType;
  canvasSize: CanvasSize;
  layout: LayoutType;
  prompt: string;
  negativePrompt: string;
  logoUrl: string | null;
  qrCodeUrl: string | null;
  referenceImages: string[];
  generatedImageUrl: string | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  extractedContent: string | null;
}

export const MATERIAL_TEMPLATES: Record<MaterialType, CanvasSize[]> = {
  poster: [
    { width: 1242, height: 2208, label: '手机海报 (9:16)' },
    { width: 1080, height: 1920, label: '标准海报' },
  ],
  banner: [
    { width: 1920, height: 400, label: '网页横幅' },
    { width: 1080, height: 300, label: '公众号首图' },
  ],
  long_image: [
    { width: 800, height: 3000, label: '产品长图' },
  ],
  custom: [
    { width: 1000, height: 1000, label: '自定义' },
  ]
};

export const LAYOUT_OPTIONS: { id: LayoutType; label: string; description: string }[] = [
  { id: 'standard', label: '标准排版', description: '经典金融海报布局' },
  { id: 'split_v', label: '垂直分割', description: '左图右文或左文右图' },
  { id: 'split_h', label: '水平分割', description: '上图下文布局' },
  { id: 'centered', label: '居中对齐', description: '核心产品居中展示' },
  { id: 'minimal', label: '极简主义', description: '留白较多，突出质感' },
];
