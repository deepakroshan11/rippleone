import type { Project, Layer, TextLayer, ImageLayer, ShapeLayer } from '@/types/project';

/**
 * Generates a standalone HTML/CSS/JS animation from a Project JSON.
 * Deterministic — not LLM-generated.
 */
export function generateHTML(project: Project): string {
  const { canvas, duration, background, layers } = project;

  const bgCSS = getBackgroundCSS(project);

  const layerStyles = layers.map(layer => {
    const enterAnim = getEnterAnimation(layer);
    const exitAnim = getExitAnimation(layer);
    const delayS = (layer.timeline.start / 1000).toFixed(3);
    const enterDurS = ((layer.animation?.enterDuration || 600) / 1000).toFixed(3);
    const exitDurS = ((layer.animation?.exitDuration || 400) / 1000).toFixed(3);
    const totalDurS = (layer.timeline.duration / 1000).toFixed(3);

    return `
  #${cssId(layer.id)} {
    position: absolute;
    left: ${layer.position.x}px;
    top: ${layer.position.y}px;
    transform: translate(-50%, -50%)${layer.scale && layer.scale !== 1 ? ` scale(${layer.scale})` : ''}${layer.rotation ? ` rotate(${layer.rotation}deg)` : ''};
    opacity: 0;
    ${layer.size ? `width: ${layer.size.width}px; height: ${layer.size.height}px;` : ''}
    ${getTypeStyles(layer)}
    animation:
      ${enterAnim} ${enterDurS}s ${getCSSEasing(layer.timeline.easing || 'ease')} ${delayS}s forwards,
      ${exitAnim} ${exitDurS}s ease-in ${((layer.timeline.start + layer.timeline.duration - (layer.animation?.exitDuration || 400)) / 1000).toFixed(3)}s forwards;
  }`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #000;
      font-family: 'Outfit', sans-serif;
    }

    .intro-canvas {
      width: ${canvas.width}px;
      height: ${canvas.height}px;
      position: relative;
      overflow: hidden;
      ${bgCSS}
    }

    @media (max-width: ${canvas.width}px) {
      .intro-canvas {
        width: 100vw;
        height: calc(100vw * ${canvas.height / canvas.width});
        transform-origin: top left;
      }
    }

${layerStyles}

    /* ── Enter animations ── */
    @keyframes ais-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ais-scale-fade { from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    @keyframes ais-slide-up { from { opacity: 0; transform: translate(-50%, calc(-50% + 40px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
    @keyframes ais-slide-down { from { opacity: 0; transform: translate(-50%, calc(-50% - 40px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
    @keyframes ais-zoom-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    @keyframes ais-glow { from { opacity: 0; filter: blur(20px); } to { opacity: 1; filter: blur(0); } }
    /* ── Exit animations ── */
    @keyframes ais-fade-out { to { opacity: 0; } }
    @keyframes ais-slide-up-exit { to { opacity: 0; transform: translate(-50%, calc(-50% - 40px)); } }
  </style>
</head>
<body>
  <main class="intro-canvas" role="main" aria-label="${project.name} intro animation">
${layers.map(l => renderLayerHTML(l)).join('\n')}
  </main>
  <script>
    // Replay on click
    document.querySelector('.intro-canvas')?.addEventListener('click', () => {
      location.reload();
    });
  </script>
</body>
</html>`;

  return html;
}

function getBackgroundCSS(project: Project): string {
  const bg = project.background;
  if (bg.type === 'solid') return `background: ${bg.color};`;
  if (bg.type === 'gradient') {
    if (bg.direction === 'radial') {
      const stops = bg.stops.map(s => `${s.color} ${s.position}%`).join(', ');
      return `background: radial-gradient(circle, ${stops});`;
    }
    const dir = bg.direction === 'to-bottom' ? 'to bottom' : bg.direction === 'to-right' ? 'to right' : 'to top right';
    const stops = bg.stops.map(s => `${s.color} ${s.position}%`).join(', ');
    return `background: linear-gradient(${dir}, ${stops});`;
  }
  return 'background: #000;';
}

function getTypeStyles(layer: Layer): string {
  if (layer.type === 'text') {
    const tl = layer as TextLayer;
    return `
    font-family: ${tl.props.fontFamily};
    font-size: ${tl.props.fontSize}px;
    font-weight: ${tl.props.fontWeight};
    color: ${tl.props.color};
    text-align: ${tl.props.align};
    ${tl.props.letterSpacing ? `letter-spacing: ${tl.props.letterSpacing}em;` : ''}
    ${tl.props.textShadow ? `text-shadow: ${tl.props.textShadow};` : ''}
    white-space: nowrap;
    `;
  }
  if (layer.type === 'shape') {
    const sl = layer as ShapeLayer;
    return `
    background: ${sl.props.fill};
    ${sl.props.variant === 'circle' ? 'border-radius: 50%;' : ''}
    ${sl.props.stroke ? `border: ${sl.props.strokeWidth || 1}px solid ${sl.props.stroke};` : ''}
    `;
  }
  if (layer.type === 'image') {
    const il = layer as ImageLayer;
    return `
    ${il.props.brightness ? `filter: brightness(${il.props.brightness});` : ''}
    `;
  }
  return '';
}

function renderLayerHTML(layer: Layer): string {
  const id = cssId(layer.id);
  if (layer.type === 'text') {
    const tl = layer as TextLayer;
    return `    <div id="${id}">${tl.props.content}</div>`;
  }
  if (layer.type === 'image') {
    const il = layer as ImageLayer;
    return `    <img id="${id}" src="${il.props.src}" alt="${il.props.alt || layer.name}" style="object-fit: ${il.props.objectFit || 'contain'}; width: 100%; height: 100%;">`;
  }
  if (layer.type === 'shape') {
    return `    <div id="${id}"></div>`;
  }
  return `    <div id="${id}"></div>`;
}

function getEnterAnimation(layer: Layer): string {
  const anim = layer.animation?.enter || 'fade';
  const map: Record<string, string> = {
    fade: 'ais-fade-in',
    scaleFade: 'ais-scale-fade',
    slideUp: 'ais-slide-up',
    slideDown: 'ais-slide-down',
    zoomIn: 'ais-zoom-in',
    glow: 'ais-glow',
    none: 'ais-fade-in',
  };
  return map[anim] || 'ais-fade-in';
}

function getExitAnimation(layer: Layer): string {
  const anim = layer.animation?.exit || 'fade';
  const map: Record<string, string> = {
    fade: 'ais-fade-out',
    slideUp: 'ais-slide-up-exit',
    none: 'ais-fade-out',
  };
  return map[anim] || 'ais-fade-out';
}

function getCSSEasing(easing: string): string {
  const map: Record<string, string> = {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };
  return map[easing] || 'ease';
}

function cssId(id: string): string {
  return `layer-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
}
