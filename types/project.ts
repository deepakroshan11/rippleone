// Core Project Types for RippleOne
export type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
export type AnimationType = 'fade' | 'scaleFade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut' | 'glitch' | 'typewriter' | 'glow' | 'none';
export type LayerType = 'image' | 'text' | 'shape' | 'video' | 'particle' | 'group';
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video';
export type OrientationType = 'portrait' | 'landscape' | 'square';

export interface TimelineEntry {
  start: number;
  duration: number;
  delay?: number;
  easing?: EasingType;
}

export interface LayerAnimation {
  enter?: AnimationType;
  exit?: AnimationType;
  loop?: boolean;
  enterDuration?: number;
  exitDuration?: number;
}

export interface Position { x: number; y: number; }
export interface Size { width: number; height: number; }

export interface TextLayerProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  align: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
}

export interface ImageLayerProps {
  src: string;
  alt?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  tint?: string;
  blur?: number;
  brightness?: number;
}

export type ShapeVariant = 'circle' | 'rect' | 'triangle' | 'line';
export interface ShapeLayerProps {
  variant: ShapeVariant;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export interface ParticleLayerProps {
  count: number;
  color: string;
  size: number;
  spread: number;
  speed: number;
  type: 'dot' | 'star' | 'flare' | 'sparkle';
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  position: Position;
  size?: Size;
  scale?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  timeline: TimelineEntry;
  animation?: LayerAnimation;
}

export interface TextLayer extends BaseLayer { type: 'text'; props: TextLayerProps; }
export interface ImageLayer extends BaseLayer { type: 'image'; props: ImageLayerProps; }
export interface ShapeLayer extends BaseLayer { type: 'shape'; props: ShapeLayerProps; }
export interface ParticleLayer extends BaseLayer { type: 'particle'; props: ParticleLayerProps; }
export type Layer = TextLayer | ImageLayer | ShapeLayer | ParticleLayer;

export interface SolidBackground { type: 'solid'; color: string; }
export interface GradientBackground {
  type: 'gradient';
  direction: 'to-bottom' | 'to-right' | 'to-top-right' | 'radial';
  stops: Array<{ color: string; position: number }>;
}
export interface ImageBackground {
  type: 'image'; src: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  blur?: number; brightness?: number;
}
export type Background = SolidBackground | GradientBackground | ImageBackground;

export interface Canvas { width: number; height: number; fps: number; }

export interface Project {
  id: string;
  version: string;
  name: string;
  description?: string;
  canvas: Canvas;
  duration: number;
  background: Background;
  layers: Layer[];
  createdAt?: string;
  updatedAt?: string;
  templateId?: string;
  userId?: string;
}

export type OperationType = 'add_layer' | 'remove_layer' | 'update_layer' | 'move_layer' | 'resize_layer' | 'change_color' | 'change_text' | 'change_animation' | 'change_duration' | 'add_particle' | 'duplicate_layer' | 'update_background';

export interface AddLayerOperation { type: 'add_layer'; layer: Layer; }
export interface RemoveLayerOperation { type: 'remove_layer'; layerId: string; }
export interface UpdateLayerOperation { type: 'update_layer'; layerId: string; changes: Partial<Layer>; }
export interface MoveLayerOperation { type: 'move_layer'; layerId: string; position: Position; }
export interface ResizeLayerOperation { type: 'resize_layer'; layerId: string; size?: Size; scale?: number; }
export interface ChangeColorOperation { type: 'change_color'; target: 'background' | 'layer'; layerId?: string; color: string; }
export interface ChangeTextOperation { type: 'change_text'; layerId: string; content: string; }
export interface ChangeAnimationOperation { type: 'change_animation'; layerId: string; animation: LayerAnimation; }
export interface ChangeDurationOperation { type: 'change_duration'; duration: number; }
export interface UpdateBackgroundOperation { type: 'update_background'; background: Background; }

export type ProjectOperation =
  | AddLayerOperation | RemoveLayerOperation | UpdateLayerOperation
  | MoveLayerOperation | ResizeLayerOperation | ChangeColorOperation
  | ChangeTextOperation | ChangeAnimationOperation | ChangeDurationOperation
  | UpdateBackgroundOperation;

export interface ProjectContext {
  project?: Partial<Project>;
  templateId?: string;
  style?: string;
  mood?: string;
}

export interface AIProvider {
  generateProject(prompt: string, context: ProjectContext): Promise<ProjectOperation[]>;
  modifyProject(prompt: string, project: Project): Promise<ProjectOperation[]>;
  isAvailable(): Promise<boolean>;
}

export interface AIGenerationRecord {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  model: string;
  operations: ProjectOperation[];
  success: boolean;
  error?: string;
  createdAt: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  previewUrl?: string;
  projectJsonUrl?: string;
  durationMs: number;
  orientation: OrientationType;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExportTarget = 'json' | 'html' | 'react' | 'webm' | 'mp4' | 'gif';
export interface ExportOptions { target: ExportTarget; quality?: 'low' | 'medium' | 'high'; scale?: number; }

// Canvas presets
export const CANVAS_PRESETS = {
  'mobile-portrait': { width: 1080, height: 1920, label: 'Mobile Portrait' },
  'mobile-landscape': { width: 1920, height: 1080, label: 'Mobile Landscape' },
  'square': { width: 1080, height: 1080, label: 'Square' },
  'desktop': { width: 1920, height: 1080, label: 'Desktop' },
  '4k': { width: 4096, height: 2304, label: '4K' },
} as const;
