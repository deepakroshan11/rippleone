# RippleOne

> The modern studio for designing authentic mobile app splash screens and animated launch experiences.

RippleOne is a specialized motion design platform engineered for mobile product teams, indie hackers, and motion designers. Build production-grade 9:16 app splash screens, animated brand reveals, and seamless launch progressions—powered by real-world archetypes and natural language AI assistance.

---

## Highlights

* **Authentic Mobile Splash Archetypes**: Curated gallery modeled directly on real consumer apps: Myntra (Fashion), BookMyShow (Cinema & Entertainment), Vodafone Vi (Telecom), Spotify (Audio), Swiggy (Food Delivery), and Findora (Clean Search).
* **Live Motion Playback**: Scrub and inspect launch progressions directly in the browser with real-time 60fps rendering, responsive device scaling, and one-click replay.
* **Intelligent AI Assistant**: Natural language prompt interface to modify colors, typography hierarchy, easing curves, and duration with zero latency.
* **Luxury Navy & White Design System**: Minimalist, high-craft dark mode styled in deep midnight navy (`#060B17`), slate elevation (`#142240`), and crisp white typography.
* **Developer Export**: Clean export to standalone HTML/CSS/JS bundles, pure React/Framer Motion components, and portable Project JSON schemas.

---

## Tech Stack

* **Framework**: Next.js 15 (App Router, React 19)
* **Styling**: Tailwind CSS & Modern Vanilla CSS Design Tokens
* **Motion Engine**: HTML5 Canvas / requestAnimationFrame with easing interpolation
* **AI Engine**: Dual-mode engine supporting built-in instant heuristic operations and local Ollama (Qwen 4B)
* **Type Safety**: TypeScript & Zod Schema Validation

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to launch RippleOne in your browser.

---

## Project Structure

```
├── app/
│   ├── dashboard/          # Project overview & workspace metrics
│   ├── editor/             # Multi-track motion canvas & timeline editor
│   ├── templates/          # Live interactive splash screen gallery
│   ├── globals.css         # Luxury navy design tokens & primitives
│   └── page.tsx            # RippleOne home landing experience
├── components/
│   ├── ai/                 # Minimalist AI Assistant panel
│   ├── editor/             # Timeline, Layers, Properties, and Canvas
│   └── templates/          # Motion player cards & detail views
├── templates/
│   └── registry.ts         # Authentic 9:16 splash screen definitions
└── types/
    └── project.ts          # Core schema & layer primitives
```

---

## License

MIT © RippleOne
