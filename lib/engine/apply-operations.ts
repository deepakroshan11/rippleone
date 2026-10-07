import type { Project, ProjectOperation, Layer, Background } from '@/types/project';

/**
 * Applies an array of validated AI operations to a project, returning a new project.
 * This is the central mutation engine — immutable, pure function.
 */
export function applyOperations(project: Project, operations: ProjectOperation[]): Project {
  let current = { ...project, layers: [...project.layers] };

  for (const op of operations) {
    current = applyOperation(current, op);
  }

  return { ...current, updatedAt: new Date().toISOString() };
}

function applyOperation(project: Project, op: ProjectOperation): Project {
  switch (op.type) {
    case 'add_layer': {
      // Ensure no duplicate IDs
      const exists = project.layers.find(l => l.id === op.layer.id);
      if (exists) {
        const newId = `${op.layer.id}_${Date.now()}`;
        return {
          ...project,
          layers: [...project.layers, { ...op.layer, id: newId }],
        };
      }
      return { ...project, layers: [...project.layers, op.layer] };
    }

    case 'remove_layer':
      return {
        ...project,
        layers: project.layers.filter(l => l.id !== op.layerId),
      };

    case 'update_layer': {
      return {
        ...project,
        layers: project.layers.map(l =>
          l.id === op.layerId ? deepMergeLayer(l, op.changes as Partial<Layer>) : l
        ),
      };
    }

    case 'move_layer':
      return {
        ...project,
        layers: project.layers.map(l =>
          l.id === op.layerId ? { ...l, position: op.position } : l
        ),
      };

    case 'resize_layer':
      return {
        ...project,
        layers: project.layers.map(l => {
          if (l.id !== op.layerId) return l;
          return {
            ...l,
            ...(op.size !== undefined ? { size: op.size } : {}),
            ...(op.scale !== undefined ? { scale: op.scale } : {}),
          };
        }),
      };

    case 'change_color': {
      if (op.target === 'background') {
        return {
          ...project,
          background: { type: 'solid', color: op.color },
        };
      }
      // Layer color — works for text and shape layers
      return {
        ...project,
        layers: project.layers.map(l => {
          if (l.id !== op.layerId) return l;
          if (l.type === 'text') {
            return { ...l, props: { ...l.props, color: op.color } };
          }
          if (l.type === 'shape') {
            return { ...l, props: { ...l.props, fill: op.color } };
          }
          return l;
        }),
      };
    }

    case 'change_text':
      return {
        ...project,
        layers: project.layers.map(l => {
          if (l.id !== op.layerId || l.type !== 'text') return l;
          return { ...l, props: { ...l.props, content: op.content } };
        }),
      };

    case 'change_animation':
      return {
        ...project,
        layers: project.layers.map(l =>
          l.id === op.layerId ? { ...l, animation: op.animation } : l
        ),
      };

    case 'change_duration':
      return { ...project, duration: op.duration };

    case 'update_background':
      return { ...project, background: op.background as Background };

    default:
      console.warn('Unknown operation type:', (op as ProjectOperation).type);
      return project;
  }
}

function deepMergeLayer(layer: Layer, changes: Partial<Layer>): Layer {
  const merged = { ...layer, ...changes } as Layer;
  // Deep merge props if provided
  if ('props' in changes && changes.props && 'props' in layer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (merged as any).props = { ...(layer as any).props, ...(changes as any).props };
  }
  // Deep merge timeline if provided
  if (changes.timeline && layer.timeline) {
    merged.timeline = { ...layer.timeline, ...changes.timeline };
  }
  // Deep merge animation if provided
  if (changes.animation && layer.animation) {
    merged.animation = { ...layer.animation, ...changes.animation };
  }
  return merged;
}
