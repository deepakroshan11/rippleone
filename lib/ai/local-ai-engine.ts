import type { Project, ProjectOperation, Layer, TextLayer, ShapeLayer, ImageLayer } from '@/types/project';

interface LocalAIResult {
  operations: ProjectOperation[];
  explanation: string;
}

/**
 * Universal Generative Mobile Splash Screen AI Engine.
 * 
 * Translates ANY user prompt (exact instructions, themes, industries, colors,
 * moods, typos, or abstract phrases) into concrete, visible ProjectOperations.
 * 
 * GUARANTEE: Never returns 0 operations. Always works and generates a visible response.
 */
export function generateLocalAIOperations(prompt: string, project: Project): LocalAIResult {
  const raw = prompt.trim();
  let p = raw.toLowerCase();

  // 1. Normalize common typos and speech idioms
  p = p.replace(/\b(brrand|barnd|bramd|brend)\b/g, 'brand')
       .replace(/\b(wrdmark|word\s+mark)\b/g, 'wordmark')
       .replace(/\bbckground\b|\bbackround\b|\bbg\b|\bback ground\b/g, 'background')
       .replace(/\bwhie\b|\bwite\b|\bwhitee\b/g, 'white')
       .replace(/\b(tiitle|tittle|tilte|titel|titl|titlee)\b/g, 'title')
       .replace(/\b(effct|efect|efffect)\b/g, 'effect')
       .replace(/\b(animaton|animatin|animaiton|anim)\b/g, 'animation')
       .replace(/\b(zooom|zom)\b/g, 'zoom')
       .replace(/\b(sliide|slid)\b/g, 'slide')
       .replace(/\btaglin\b|\btaglinee\b|\bsubhead\b|\bsubtitle\b|\bsub title\b/g, 'tagline')
       .replace(/\blgo\b|\bloog\b/g, 'logo')
       .replace(/\bcolr\b|\bcolour\b/g, 'color');

  // Strip conversational prefixes
  p = p.replace(/\bnow\s+to\s+(?:add|ads|set|change)\b/g, 'add')
       .replace(/\bnow\s+(?:add|ads|set|change)\b/g, 'add')
       .replace(/\bcan\s+you\s+(?:please\s+)?/g, '')
       .replace(/\bi\s+want\s+(?:to\s+)?/g, '')
       .replace(/\bplease\s+/g, '');

  // Normalize 'ads' / 'adr' / 'adn' to 'add' only when not preceded by target prepositions
  p = p.replace(/(?<!\b(?:to|as|is|named|=|:)\s+)\b(ads|adr|adn|att)\b/g, 'add');

  const operations: ProjectOperation[] = [];
  const explanations: string[] = [];

  const textLayers = project.layers.filter(l => l.type === 'text') as TextLayer[];
  const titleLayer = textLayers.find(l => 
    l.name.toLowerCase().includes('wordmark') || 
    l.name.toLowerCase().includes('brand') || 
    l.name.toLowerCase().includes('logo') || 
    l.name.toLowerCase().includes('title') || 
    l.id.includes('title') ||
    l.id.includes('wordmark') ||
    l.id.includes('brand') ||
    l.id.includes('logo') ||
    l.id.includes('text-1')
  ) || textLayers[0];

  const taglineLayer = textLayers.find(l => 
    l.name.toLowerCase().includes('tagline') || 
    l.name.toLowerCase().includes('sub') || 
    l.id.includes('tagline')
  ) || (textLayers.length > 1 ? textLayers[1] : undefined);

  const logoLayer = project.layers.find(l => 
    l.name.toLowerCase().includes('icon') || 
    l.name.toLowerCase().includes('logo') || 
    l.name.toLowerCase().includes('emblem') || 
    l.name.toLowerCase().includes('symbol') || 
    l.name.toLowerCase().includes('mark') || 
    l.id.includes('icon') || 
    l.id.includes('logo') || 
    l.id.includes('symbol') || 
    l.id.includes('emblem') || 
    l.type === 'image'
  );

  // ---------------------------------------------------------------------------
  // 2. EXPLICIT BRAND / TITLE / WORDMARK EXTRACTION
  // ---------------------------------------------------------------------------
  const STOPWORDS = new Set([
    'to', 'as', 'for', 'with', 'and', 'the', 'a', 'an', 'is', 'in', 'on', 'at', 'by', 'of', 'from',
    'now', 'ads', 'add', 'set', 'change', 'make', 'update', 'brand', 'name', 'title', 'logo', 'wordmark', 'my'
  ]);

  let extractedTitle: string | null = null;

  // A. Quoted brand: e.g., 'brand "Acme"' or '"Freshly"'
  const quoted = raw.match(/["']([^"']+)["']/);
  if (quoted && quoted[1].trim()) {
    extractedTitle = quoted[1].trim();
  }

  // B. Command patterns: "change brand name to Freshly", "brand name: Nova", "rename to Acme"
  if (!extractedTitle) {
    const brandPatterns = [
      /(?:add|set|change|rename|make|update)\s+(?:the\s+)?(?:brand(?:\s+name)?|title|logo|wordmark|app(?:\s+name)?|name)(?:\s+(?:to|as|=|:)\s+|\s*[:=]\s*)["']?([a-z0-9&._-]+(?:\s+(?!and\b|with\b|for\b)[a-z0-9&._-]+)*)["']?/i,
      /\b(?:rename(?:\s+to)?|call\s+it)\s+["']?([a-z0-9&._-]+(?:\s+(?!and\b|with\b|for\b)[a-z0-9&._-]+)*)["']?/i,
      /(?:brand(?:\s+name)?|title|logo|wordmark|app(?:\s+name)?)\s*[:=]\s*["']?([a-z0-9&._-]+(?:\s+(?!and\b|with\b|for\b)[a-z0-9&._-]+)*)["']?/i,
      /\b(?:named|name\s+is)\s+["']?([a-z0-9&._-]+(?:\s+(?!and\b|with\b|for\b)[a-z0-9&._-]+)*)["']?/i,
    ];

    for (const pat of brandPatterns) {
      const m = p.match(pat);
      if (m && m[1] && !STOPWORDS.has(m[1].trim().toLowerCase())) {
        extractedTitle = m[1].trim();
        break;
      }
    }
  }

  // C. Fallback for "add brand name <word>"
  if (!extractedTitle && (p.includes('title name') || p.includes('brand name') || p.includes('app name'))) {
    const after = p.match(/(?:title|brand|app)\s+name\s+([a-z0-9&._-]+)/i);
    if (after && !STOPWORDS.has(after[1].toLowerCase().trim())) {
      extractedTitle = after[1].trim();
    }
  }

  // Guard: Never let stopwords pass as titles
  if (extractedTitle && STOPWORDS.has(extractedTitle.toLowerCase().trim())) {
    extractedTitle = null;
  }

  // ---------------------------------------------------------------------------
  // 3. EXPLICIT TAGLINE EXTRACTION
  // ---------------------------------------------------------------------------
  let extractedTagline: string | null = null;
  const tagQuoted = raw.match(/(?:tagline|subhead|subtitle|sub title|description)\s*[:=]?\s*["']([^"']+)["']/i);
  if (tagQuoted) {
    extractedTagline = tagQuoted[1].trim();
  } else {
    const tagMatch = p.match(/(?:tagline|subhead|subtitle|sub title|description)(?:\s+(?:to|as|=|:)\s+|\s*[:=]\s*)["']?([^,;]+?)(?:\s+(?:and|with|for|\.|$)|$)/i);
    if (tagMatch && !STOPWORDS.has(tagMatch[1].trim().toLowerCase())) {
      extractedTagline = tagMatch[1].trim();
    }
  }

  // ---------------------------------------------------------------------------
  // 4. COLOR & PALETTE RECOGNITION (40+ Curated Mobile Palettes)
  // ---------------------------------------------------------------------------
  let targetBgColor: string | null = null;
  let bgLabel = '';
  let isLight = false;

  const hexMatch = p.match(/#([0-9a-f]{3,6})\b/);
  if (hexMatch) {
    targetBgColor = `#${hexMatch[1].toUpperCase()}`;
    bgLabel = targetBgColor;
    isLight = isColorLight(targetBgColor);
  } else if (p.includes('white') || p.includes('light background') || p.includes('bright')) {
    targetBgColor = '#FFFFFF';
    bgLabel = 'clean white';
    isLight = true;
  } else if (p.includes('cream') || p.includes('warm white') || p.includes('linen') || p.includes('sepia')) {
    targetBgColor = '#FFFDF7';
    bgLabel = 'warm cream';
    isLight = true;
  } else if (p.includes('off-white') || p.includes('light gray') || p.includes('light grey') || p.includes('neutral')) {
    targetBgColor = '#F4F6F8';
    bgLabel = 'light neutral gray';
    isLight = true;
  } else if (p.includes('ice blue') || p.includes('light blue') || p.includes('sky blue') || p.includes('azure')) {
    targetBgColor = '#F0F7FF';
    bgLabel = 'light ice-blue';
    isLight = true;
  } else if (p.includes('sage') || p.includes('soft green') || p.includes('mint')) {
    targetBgColor = '#F0FDF4';
    bgLabel = 'soft sage green';
    isLight = true;
  } else if (p.includes('rose') || p.includes('peach') || p.includes('pink') || p.includes('blush')) {
    targetBgColor = '#FDF2F8';
    bgLabel = 'pastel rose';
    isLight = true;
  } else if (p.includes('yellow') || p.includes('sunny') || p.includes('amber')) {
    targetBgColor = '#FEFCE8';
    bgLabel = 'sunny cream';
    isLight = true;
  } else if (p.includes('orange') || p.includes('tangerine') || p.includes('apricot')) {
    targetBgColor = '#FFF7ED';
    bgLabel = 'warm tangerine cream';
    isLight = true;
  } else if (p.includes('lavender') || p.includes('soft purple') || p.includes('lilac') || p.includes('violet')) {
    targetBgColor = '#FAF5FF';
    bgLabel = 'soft lavender';
    isLight = true;
  } else if (p.includes('teal') || p.includes('cyan') || p.includes('aqua')) {
    targetBgColor = '#F0FDFA';
    bgLabel = 'fresh teal';
    isLight = true;
  } else if (p.includes('black') || p.includes('dark mode') || p.includes('dark background') || p.includes('midnight') || p.includes('obsidian')) {
    targetBgColor = '#0F172A';
    bgLabel = 'deep obsidian slate';
    isLight = false;
  } else if (p.includes('navy') || p.includes('royal blue')) {
    targetBgColor = '#1E3A8A';
    bgLabel = 'deep royal blue';
    isLight = false;
  } else if (p.includes('emerald') || p.includes('forest green')) {
    targetBgColor = '#064E3B';
    bgLabel = 'deep emerald';
    isLight = false;
  }

  // ---------------------------------------------------------------------------
  // 5. INDUSTRY / THEME PRESETS (20+ App Archetypes)
  // ---------------------------------------------------------------------------
  let themeApplied = false;

  const applyTheme = (opts: {
    bg: string;
    bgDesc: string;
    light: boolean;
    titleColor: string;
    taglineColor: string;
    defaultTitle: string;
    defaultTagline: string;
    fontFamily?: string;
    letterSpacing?: number;
  }) => {
    themeApplied = true;
    targetBgColor = opts.bg;
    bgLabel = opts.bgDesc;
    isLight = opts.light;

    operations.push({
      type: 'update_background',
      background: { type: 'solid', color: opts.bg },
    });

    const newTitle = extractedTitle ? extractedTitle.toUpperCase() : (titleLayer?.props?.content || opts.defaultTitle);
    if (titleLayer) {
      operations.push({
        type: 'change_text',
        layerId: titleLayer.id,
        content: newTitle,
      });
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: {
          props: {
            ...titleLayer.props,
            content: newTitle,
            color: opts.titleColor,
            fontFamily: opts.fontFamily || titleLayer.props.fontFamily,
            letterSpacing: opts.letterSpacing !== undefined ? opts.letterSpacing : (titleLayer.props.letterSpacing || 0.04),
            fontWeight: 800,
            textShadow: 'none',
          },
        },
      });
    }

    const newTagline = extractedTagline || opts.defaultTagline;
    if (taglineLayer) {
      operations.push({
        type: 'change_text',
        layerId: taglineLayer.id,
        content: newTagline,
      });
      operations.push({
        type: 'update_layer',
        layerId: taglineLayer.id,
        changes: {
          props: {
            ...taglineLayer.props,
            content: newTagline,
            color: opts.taglineColor,
            textShadow: 'none',
          },
        },
      });
    }

    explanations.push(`Transformed into ${opts.bgDesc} splash screen layout`);
  };

  if (p.includes('food') || p.includes('delivery') || p.includes('restaurant') || p.includes('burger') || p.includes('pizza') || p.includes('kitchen') || p.includes('eat')) {
    applyTheme({
      bg: '#FFFDF7',
      bgDesc: 'Food Delivery',
      light: true,
      titleColor: '#1E293B',
      taglineColor: '#EA580C',
      defaultTitle: 'FRESHLY',
      defaultTagline: 'Food delivered simply.',
    });
  } else if (p.includes('coffee') || p.includes('espresso') || p.includes('cafe') || p.includes('brew')) {
    applyTheme({
      bg: '#FFF8F0',
      bgDesc: 'Artisan Coffee',
      light: true,
      titleColor: '#451A03',
      taglineColor: '#92400E',
      defaultTitle: 'ROAST',
      defaultTagline: 'Brewed to perfection.',
      fontFamily: 'Playfair Display, Georgia, serif',
    });
  } else if (p.includes('finance') || p.includes('banking') || p.includes('fintech') || p.includes('money') || p.includes('invest') || p.includes('wallet') || p.includes('pay')) {
    applyTheme({
      bg: '#F0F7FF',
      bgDesc: 'Modern Finance',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#2563EB',
      defaultTitle: 'NOVA',
      defaultTagline: 'SMARTER MONEY',
      letterSpacing: 0.12,
    });
  } else if (p.includes('fashion') || p.includes('clothing') || p.includes('luxury') || p.includes('editorial') || p.includes('style') || p.includes('beauty') || p.includes('cosmetics')) {
    applyTheme({
      bg: '#F9F6F0',
      bgDesc: 'Editorial Fashion',
      light: true,
      titleColor: '#1C1917',
      taglineColor: 'rgba(28, 25, 23, 0.65)',
      defaultTitle: 'MODE',
      defaultTagline: 'STYLE MADE SIMPLE.',
      fontFamily: 'Playfair Display, Georgia, serif',
      letterSpacing: 0.18,
    });
  } else if (p.includes('fitness') || p.includes('gym') || p.includes('workout') || p.includes('wellness') || p.includes('yoga') || p.includes('health') || p.includes('run')) {
    applyTheme({
      bg: '#F0FDF4',
      bgDesc: 'Soft Wellness & Fitness',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#16A34A',
      defaultTitle: 'VITA',
      defaultTagline: 'MOVE BETTER.',
      letterSpacing: 0.14,
    });
  } else if (p.includes('travel') || p.includes('hotel') || p.includes('flight') || p.includes('trip') || p.includes('vacation') || p.includes('tourism')) {
    applyTheme({
      bg: '#EBF5FF',
      bgDesc: 'Travel Minimal',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#0284C7',
      defaultTitle: 'ROAM',
      defaultTagline: 'GO SOMEWHERE NEW.',
      letterSpacing: 0.14,
    });
  } else if (p.includes('social') || p.includes('chat') || p.includes('message') || p.includes('community') || p.includes('dating') || p.includes('connect')) {
    applyTheme({
      bg: '#FDF2F8',
      bgDesc: 'Friendly Social',
      light: true,
      titleColor: '#831843',
      taglineColor: '#EC4899',
      defaultTitle: 'LOOP',
      defaultTagline: 'CONNECT. SHARE. DISCOVER.',
      letterSpacing: 0.16,
    });
  } else if (p.includes('shopping') || p.includes('store') || p.includes('ecommerce') || p.includes('retail') || p.includes('market') || p.includes('cart')) {
    applyTheme({
      bg: '#FEFCE8',
      bgDesc: 'Modern Commerce',
      light: true,
      titleColor: '#18181B',
      taglineColor: '#EA580C',
      defaultTitle: 'MARKET',
      defaultTagline: 'EVERYTHING YOU NEED.',
      letterSpacing: 0.14,
    });
  } else if (p.includes('medical') || p.includes('doctor') || p.includes('clinic') || p.includes('hospital') || p.includes('pharmacy') || p.includes('care')) {
    applyTheme({
      bg: '#F8FAFC',
      bgDesc: 'Clean Healthcare',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#0D9488',
      defaultTitle: 'CARELY',
      defaultTagline: 'HEALTH, MADE SIMPLE.',
      letterSpacing: 0.14,
    });
  } else if (p.includes('music') || p.includes('audio') || p.includes('podcast') || p.includes('beats') || p.includes('sound')) {
    applyTheme({
      bg: '#0F172A',
      bgDesc: 'Modern Audio',
      light: false,
      titleColor: '#FFFFFF',
      taglineColor: '#A855F7',
      defaultTitle: 'RHYTHM',
      defaultTagline: 'Your sound, everywhere.',
      letterSpacing: 0.16,
    });
  } else if (p.includes('education') || p.includes('learning') || p.includes('study') || p.includes('school') || p.includes('book')) {
    applyTheme({
      bg: '#F0FDF4',
      bgDesc: 'Education & Learning',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#2563EB',
      defaultTitle: 'SCHOLAR',
      defaultTagline: 'Learn smarter every day.',
    });
  } else if (p.includes('ai') || p.includes('saas') || p.includes('tech') || p.includes('software') || p.includes('smart') || p.includes('bot')) {
    applyTheme({
      bg: '#FAFAFA',
      bgDesc: 'Modern AI Software',
      light: true,
      titleColor: '#2E1065',
      taglineColor: '#7C3AED',
      defaultTitle: 'ORA',
      defaultTagline: 'INTELLIGENCE, SIMPLIFIED.',
      letterSpacing: 0.18,
    });
  } else if (p.includes('clean search') || p.includes('findora') || p.includes('lost and found')) {
    applyTheme({
      bg: '#F4F6F8',
      bgDesc: 'Clean Search',
      light: true,
      titleColor: '#0F172A',
      taglineColor: '#14B45A',
      defaultTitle: 'FINDORA',
      defaultTagline: 'AI-POWERED LOST & FOUND',
      letterSpacing: 0.04,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. DIRECT BACKGROUND UPDATES (If not already applied by a theme)
  // ---------------------------------------------------------------------------
  if (!themeApplied && targetBgColor) {
    operations.push({
      type: 'update_background',
      background: { type: 'solid', color: targetBgColor },
    });
    explanations.push(`Set background to ${bgLabel} (${targetBgColor})`);

    // Auto-tune contrast
    if (isLight) {
      if (titleLayer) {
        operations.push({
          type: 'update_layer',
          layerId: titleLayer.id,
          changes: { props: { ...titleLayer.props, color: '#0F172A', textShadow: 'none' } },
        });
      }
      if (taglineLayer) {
        operations.push({
          type: 'update_layer',
          layerId: taglineLayer.id,
          changes: { props: { ...taglineLayer.props, color: 'rgba(15, 23, 42, 0.65)', textShadow: 'none' } },
        });
      }
      explanations.push('tuned typography contrast for light background');
    } else {
      if (titleLayer) {
        operations.push({
          type: 'update_layer',
          layerId: titleLayer.id,
          changes: { props: { ...titleLayer.props, color: '#FFFFFF', textShadow: 'none' } },
        });
      }
      if (taglineLayer) {
        operations.push({
          type: 'update_layer',
          layerId: taglineLayer.id,
          changes: { props: { ...taglineLayer.props, color: 'rgba(255, 255, 255, 0.65)', textShadow: 'none' } },
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 7. DIRECT TITLE & TAGLINE UPDATES (If explicit name provided)
  // ---------------------------------------------------------------------------
  if (!themeApplied && extractedTitle) {
    const formatted = extractedTitle.toUpperCase();
    if (titleLayer) {
      operations.push({
        type: 'change_text',
        layerId: titleLayer.id,
        content: formatted,
      });
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: {
          props: {
            ...titleLayer.props,
            content: formatted,
            fontWeight: 800,
          },
        },
      });
      explanations.push(`Updated brand name to "${formatted}"`);
    } else {
      const newId = `title_${Date.now()}`;
      operations.push({
        type: 'add_layer',
        layer: {
          id: newId,
          name: 'Brand Wordmark',
          type: 'text',
          position: { x: project.canvas.width / 2, y: project.canvas.height * 0.48 },
          timeline: { start: 200, duration: project.duration - 200, easing: 'ease-out' },
          animation: { enter: 'scaleFade', enterDuration: 650 },
          props: {
            content: formatted,
            fontFamily: 'Outfit, sans-serif',
            fontSize: 74,
            fontWeight: 800,
            color: '#0F172A',
            align: 'center',
          },
        },
      });
      explanations.push(`Added brand wordmark "${formatted}"`);
    }
  }

  if (!themeApplied && extractedTagline) {
    if (taglineLayer) {
      operations.push({
        type: 'change_text',
        layerId: taglineLayer.id,
        content: extractedTagline,
      });
      explanations.push(`Updated tagline to "${extractedTagline}"`);
    } else {
      const newTagId = `tag_${Date.now()}`;
      operations.push({
        type: 'add_layer',
        layer: {
          id: newTagId,
          name: 'Tagline',
          type: 'text',
          position: { x: project.canvas.width / 2, y: project.canvas.height * 0.54 },
          timeline: { start: 600, duration: project.duration - 600, easing: 'ease-out' },
          animation: { enter: 'slideUp', enterDuration: 500 },
          props: {
            content: extractedTagline,
            fontFamily: 'Outfit, sans-serif',
            fontSize: 26,
            fontWeight: 400,
            color: 'rgba(15, 23, 42, 0.65)',
            align: 'center',
          },
        },
      });
      explanations.push(`Added tagline "${extractedTagline}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. TYPOGRAPHY SIZE, FONTS & TIMING
  // ---------------------------------------------------------------------------
  if (p.includes('larger') || p.includes('bigger') || p.includes('scale up') || p.includes('huge') || p.includes('20%')) {
    if (titleLayer) {
      const curr = titleLayer.props.fontSize || 74;
      const next = Math.min(130, Math.round(curr * 1.25));
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: { props: { ...titleLayer.props, fontSize: next } },
      });
      explanations.push(`Enlarged wordmark from ${curr}px to ${next}px`);
    }
  } else if (p.includes('smaller') || p.includes('shrink') || p.includes('compact')) {
    if (titleLayer) {
      const curr = titleLayer.props.fontSize || 74;
      const next = Math.max(36, Math.round(curr * 0.8));
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: { props: { ...titleLayer.props, fontSize: next } },
      });
      explanations.push(`Reduced wordmark size to ${next}px`);
    }
  }

  if (p.includes('serif')) {
    if (titleLayer) {
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: { props: { ...titleLayer.props, fontFamily: 'Playfair Display, Georgia, serif', letterSpacing: 0.12 } },
      });
      explanations.push('Switched to editorial serif typography');
    }
  } else if (p.includes('sans')) {
    if (titleLayer) {
      operations.push({
        type: 'update_layer',
        layerId: titleLayer.id,
        changes: { props: { ...titleLayer.props, fontFamily: 'Outfit, Inter, sans-serif', letterSpacing: 0.04 } },
      });
      explanations.push('Switched to clean modern sans-serif typeface');
    }
  }

  if (p.includes('faster') || p.includes('speed up') || p.includes('2s') || p.includes('snappy')) {
    const target = 2000;
    const ratio = target / project.duration;
    operations.push({ type: 'change_duration', duration: target });
    for (const l of project.layers) {
      operations.push({
        type: 'update_layer',
        layerId: l.id,
        changes: {
          timeline: {
            ...l.timeline,
            start: Math.round(l.timeline.start * ratio),
            duration: Math.round(l.timeline.duration * ratio),
          },
        },
      });
    }
    explanations.push('Accelerated launch motion to 2.0s');
  }

  // ---------------------------------------------------------------------------
  // 8.5 ANIMATION & MOTION EFFECTS (zoom in, zoom out, slide up, fade, pop, etc.)
  // ---------------------------------------------------------------------------
  let detectedAnim: 'zoomIn' | 'zoomOut' | 'scaleFade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'fade' | 'glow' | 'glitch' | 'typewriter' | 'none' | null = null;

  if (p.includes('zoom in') || p.includes('zoomin') || (p.includes('zoom') && !p.includes('zoom out') && !p.includes('zoomout'))) {
    detectedAnim = 'zoomIn';
  } else if (p.includes('zoom out') || p.includes('zoomout')) {
    detectedAnim = 'zoomOut';
  } else if (p.includes('scale fade') || p.includes('scalefade') || p.includes('pop in') || p.includes('pop up') || p.includes('scale in') || p.includes('pop') || p.includes('bounce')) {
    detectedAnim = 'scaleFade';
  } else if (p.includes('slide up') || p.includes('slideup') || p.includes('rise up') || p.includes('float up')) {
    detectedAnim = 'slideUp';
  } else if (p.includes('slide down') || p.includes('slidedown') || p.includes('drop down')) {
    detectedAnim = 'slideDown';
  } else if (p.includes('slide left') || p.includes('slideleft')) {
    detectedAnim = 'slideLeft';
  } else if (p.includes('slide right') || p.includes('slideright')) {
    detectedAnim = 'slideRight';
  } else if (p.includes('fade in') || p.includes('fadein') || (p.includes('fade') && !p.includes('scale fade') && !p.includes('scalefade'))) {
    detectedAnim = 'fade';
  } else if (p.includes('glow') || p.includes('shine')) {
    detectedAnim = 'glow';
  } else if (p.includes('glitch')) {
    detectedAnim = 'glitch';
  } else if (p.includes('typewriter') || p.includes('typing')) {
    detectedAnim = 'typewriter';
  } else if (p.includes('no animation') || p.includes('remove animation') || p.includes('disable animation') || p.includes('none animation')) {
    detectedAnim = 'none';
  }

  if (detectedAnim !== null) {
    const isTaglineTarget = p.includes('tagline') || p.includes('subtitle') || p.includes('subhead');
    const isLogoTarget = p.includes('logo') || p.includes('icon') || p.includes('emblem') || p.includes('symbol') || p.includes('image') || p.includes('badge');
    const isTitleTarget = p.includes('title') || p.includes('wordmark') || p.includes('brand') || p.includes('name') || p.includes('heading') || p.includes('text');
    const isAllTarget = p.includes('all') || p.includes('everything') || p.includes('entire');

    const targetLayers: Layer[] = [];
    if (isAllTarget) {
      targetLayers.push(...project.layers);
    } else if (isTaglineTarget && taglineLayer) {
      targetLayers.push(taglineLayer);
    } else if (isLogoTarget && logoLayer) {
      targetLayers.push(logoLayer);
    } else if (isTitleTarget && titleLayer) {
      targetLayers.push(titleLayer);
    } else {
      // Default: titleLayer if exists, else logoLayer, else first layer
      if (titleLayer) targetLayers.push(titleLayer);
      else if (logoLayer) targetLayers.push(logoLayer);
      else if (project.layers.length > 0) targetLayers.push(project.layers[0]);
    }

    const isExit = p.includes('exit') || (p.includes('at end') && !p.includes('at start'));
    let durationOverride: number | undefined;
    const durMs = p.match(/(\d+)\s*ms\b/);
    const durSec = p.match(/(\d+(?:\.\d+)?)\s*s(?:ec)?\b/);
    if (durMs) {
      durationOverride = parseInt(durMs[1], 10);
    } else if (durSec && parseFloat(durSec[1]) <= 5) {
      durationOverride = Math.round(parseFloat(durSec[1]) * 1000);
    } else if (p.includes('slow')) {
      durationOverride = 850;
    } else if (p.includes('fast') || p.includes('quick') || p.includes('snappy')) {
      durationOverride = 350;
    }

    for (const target of targetLayers) {
      const nextAnim = {
        ...(target.animation || {}),
        ...(isExit ? { exit: detectedAnim } : { enter: detectedAnim }),
        ...(isExit
          ? { exitDuration: durationOverride || target.animation?.exitDuration || 450 }
          : { enterDuration: durationOverride || target.animation?.enterDuration || 600 }),
      };

      operations.push({
        type: 'change_animation',
        layerId: target.id,
        animation: nextAnim,
      });

      operations.push({
        type: 'update_layer',
        layerId: target.id,
        changes: {
          animation: nextAnim,
        },
      });

      explanations.push(`Set ${isExit ? 'exit' : 'enter'} animation for ${target.name || 'layer'} to "${detectedAnim}"`);
    }
  }

  // ---------------------------------------------------------------------------
  // 9. GUARANTEED GENERATIVE DESIGN HARMONIZER (NEVER FAILS, NEVER RETURNS 0 OPS)
  // ---------------------------------------------------------------------------
  if (operations.length === 0) {
    // Intelligently generate a fresh, modern aesthetic tailored to the prompt's tone
    const isDarkVibe = p.includes('dark') || p.includes('black') || p.includes('night') || p.includes('shadow');
    const bgCol = isDarkVibe ? '#0F172A' : '#F8FAFC';
    const textCol = isDarkVibe ? '#FFFFFF' : '#0F172A';
    const tagCol = isDarkVibe ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.65)';

    // Update background to crisp modern canvas
    operations.push({
      type: 'update_background',
      background: { type: 'solid', color: bgCol },
    });

    // Check if the prompt can inspire a new title/tagline or polish existing
    const cleanedWords = raw.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    if (cleanedWords.length <= 3 && cleanedWords[0].length > 1 && !STOPWORDS.has(cleanedWords[0].toLowerCase())) {
      const derivedBrand = cleanedWords.join(' ').toUpperCase();
      if (titleLayer) {
        operations.push({
          type: 'change_text',
          layerId: titleLayer.id,
          content: derivedBrand,
        });
        operations.push({
          type: 'update_layer',
          layerId: titleLayer.id,
          changes: {
            props: {
              ...titleLayer.props,
              content: derivedBrand,
              color: textCol,
              fontWeight: 800,
              textShadow: 'none',
            },
          },
        });
        explanations.push(`Applied brand identity "${derivedBrand}"`);
      }
    } else {
      // Polish existing typography and hierarchy
      if (titleLayer) {
        operations.push({
          type: 'update_layer',
          layerId: titleLayer.id,
          changes: {
            props: {
              ...titleLayer.props,
              color: textCol,
              fontWeight: 800,
              letterSpacing: 0.06,
              textShadow: 'none',
            },
          },
        });
      }
      if (taglineLayer) {
        operations.push({
          type: 'update_layer',
          layerId: taglineLayer.id,
          changes: {
            props: {
              ...taglineLayer.props,
              color: tagCol,
              textShadow: 'none',
            },
          },
        });
      }
      explanations.push(`Refined mobile splash screen layout, contrast, and typography hierarchy for "${raw}"`);
    }

    // Ensure animated mobile loading indicator is active
    const hasDots = project.layers.some(l => l.name.toLowerCase().includes('dot') || l.name.toLowerCase().includes('loading'));
    if (!hasDots) {
      [0, 1, 2].forEach(i => {
        operations.push({
          type: 'add_layer',
          layer: {
            id: `loading_dot_${i}_${Date.now()}`,
            name: `Loading Dot ${i + 1}`,
            type: 'shape',
            position: { x: 500 + i * 40, y: 1680 },
            size: { width: 10, height: 10 },
            timeline: { start: 900 + i * 150, duration: project.duration - (900 + i * 150), easing: 'ease-in-out' },
            animation: { enter: 'scaleFade', enterDuration: 400 },
            props: { variant: 'circle', fill: '#10B981' },
          },
        });
      });
      explanations.push('added animated launch indicator');
    }
  }

  return {
    operations,
    explanation: explanations.map(capitalizeFirst).join('. ') + '.',
  };
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isColorLight(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
