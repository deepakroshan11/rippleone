import { z } from 'zod';

// ============================================================
// ZOD VALIDATION SCHEMAS — AI INTRO STUDIO
// ============================================================

export const EasingSchema = z.enum([
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'spring',
]);

export const AnimationTypeSchema = z.enum([
  'fade', 'scaleFade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight',
  'zoomIn', 'zoomOut', 'glitch', 'typewriter', 'glow', 'none',
]);

export const TimelineEntrySchema = z.object({
  start: z.number().min(0),
  duration: z.number().min(0),
  delay: z.number().min(0).optional(),
  easing: EasingSchema.optional(),
});

export const LayerAnimationSchema = z.object({
  enter: AnimationTypeSchema.optional(),
  exit: AnimationTypeSchema.optional(),
  loop: z.boolean().optional(),
  enterDuration: z.number().min(0).optional(),
  exitDuration: z.number().min(0).optional(),
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
});

export const TextLayerPropsSchema = z.object({
  content: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().min(1).max(500),
  fontWeight: z.union([z.number(), z.string()]),
  color: z.string(),
  align: z.enum(['left', 'center', 'right']).optional().default('center'),
  letterSpacing: z.union([z.number(), z.string()]).optional(),
  lineHeight: z.union([z.number(), z.string()]).optional(),
  textShadow: z.string().optional(),
});

export const ImageLayerPropsSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  objectFit: z.enum(['contain', 'cover', 'fill']).optional(),
  tint: z.string().optional(),
  blur: z.number().min(0).max(100).optional(),
  brightness: z.number().min(0).max(2).optional(),
});

export const ShapeLayerPropsSchema = z.object({
  variant: z.enum(['circle', 'rect', 'triangle', 'line']),
  fill: z.string(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  borderRadius: z.number().min(0).optional(),
});

export const ParticleLayerPropsSchema = z.object({
  count: z.number().min(1).max(500),
  color: z.string(),
  size: z.number().min(1).max(100),
  spread: z.number().min(0).max(1),
  speed: z.number().min(0).max(2),
  type: z.enum(['dot', 'star', 'flare', 'sparkle']),
});

const BaseLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: PositionSchema,
  size: SizeSchema.optional(),
  scale: z.number().min(0.01).max(20).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  zIndex: z.number().optional(),
  timeline: TimelineEntrySchema,
  animation: LayerAnimationSchema.optional(),
});

export const TextLayerSchema = BaseLayerSchema.extend({
  type: z.literal('text'),
  props: TextLayerPropsSchema,
});

export const ImageLayerSchema = BaseLayerSchema.extend({
  type: z.literal('image'),
  props: ImageLayerPropsSchema,
});

export const ShapeLayerSchema = BaseLayerSchema.extend({
  type: z.literal('shape'),
  props: ShapeLayerPropsSchema,
});

export const ParticleLayerSchema = BaseLayerSchema.extend({
  type: z.literal('particle'),
  props: ParticleLayerPropsSchema,
});

export const LayerSchema = z.discriminatedUnion('type', [
  TextLayerSchema,
  ImageLayerSchema,
  ShapeLayerSchema,
  ParticleLayerSchema,
]);

export const SolidBackgroundSchema = z.object({
  type: z.literal('solid'),
  color: z.string(),
});

export const GradientBackgroundSchema = z.object({
  type: z.literal('gradient'),
  direction: z.enum(['to-bottom', 'to-right', 'to-top-right', 'radial']),
  stops: z.array(z.object({
    color: z.string(),
    position: z.number().min(0).max(100),
  })).min(2),
});

export const ImageBackgroundSchema = z.object({
  type: z.literal('image'),
  src: z.string(),
  objectFit: z.enum(['contain', 'cover', 'fill']).optional(),
  blur: z.number().min(0).max(100).optional(),
  brightness: z.number().min(0).max(2).optional(),
});

export const BackgroundSchema = z.discriminatedUnion('type', [
  SolidBackgroundSchema,
  GradientBackgroundSchema,
  ImageBackgroundSchema,
]);

export const CanvasSchema = z.object({
  width: z.number().min(540).max(4096),
  height: z.number().min(960).max(2304),
  fps: z.number().min(12).max(60),
});

export const ProjectSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  canvas: CanvasSchema,
  duration: z.number().min(500).max(30000),
  background: BackgroundSchema,
  layers: z.array(LayerSchema).max(50),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  templateId: z.string().optional(),
  userId: z.string().optional(),
});

// --- AI Operation Schemas ---
export const AddLayerOperationSchema = z.object({
  type: z.literal('add_layer'),
  layer: LayerSchema,
});

export const RemoveLayerOperationSchema = z.object({
  type: z.literal('remove_layer'),
  layerId: z.string(),
});

export const UpdateLayerOperationSchema = z.object({
  type: z.literal('update_layer'),
  layerId: z.string(),
  changes: z.record(z.string(), z.unknown()),
});

export const MoveLayerOperationSchema = z.object({
  type: z.literal('move_layer'),
  layerId: z.string(),
  position: PositionSchema,
});

export const ResizeLayerOperationSchema = z.object({
  type: z.literal('resize_layer'),
  layerId: z.string(),
  size: SizeSchema.optional(),
  scale: z.number().min(0.01).max(20).optional(),
});

export const ChangeColorOperationSchema = z.object({
  type: z.literal('change_color'),
  target: z.enum(['background', 'layer']),
  layerId: z.string().optional(),
  color: z.string(),
});

export const ChangeTextOperationSchema = z.object({
  type: z.literal('change_text'),
  layerId: z.string(),
  content: z.string(),
});

export const ChangeAnimationOperationSchema = z.object({
  type: z.literal('change_animation'),
  layerId: z.string(),
  animation: LayerAnimationSchema,
});

export const ChangeDurationOperationSchema = z.object({
  type: z.literal('change_duration'),
  duration: z.number().min(500).max(30000),
});

export const UpdateBackgroundOperationSchema = z.object({
  type: z.literal('update_background'),
  background: BackgroundSchema,
});

export const ProjectOperationSchema = z.discriminatedUnion('type', [
  AddLayerOperationSchema,
  RemoveLayerOperationSchema,
  UpdateLayerOperationSchema,
  MoveLayerOperationSchema,
  ResizeLayerOperationSchema,
  ChangeColorOperationSchema,
  ChangeTextOperationSchema,
  ChangeAnimationOperationSchema,
  ChangeDurationOperationSchema,
  UpdateBackgroundOperationSchema,
]);

export const AIResponseSchema = z.object({
  operations: z.array(ProjectOperationSchema),
  explanation: z.string().optional(),
});

// Helper types
export type ValidatedProject = z.infer<typeof ProjectSchema>;
export type ValidatedLayer = z.infer<typeof LayerSchema>;
export type ValidatedProjectOperation = z.infer<typeof ProjectOperationSchema>;
