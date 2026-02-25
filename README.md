# Prakrit Tyagi<span style="color:#d04a15">.</span>

### Developer · Game Designer · AI Enthusiast

A single-page portfolio built from scratch with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools, no dependencies. Just clean, modular code with dual theming, scroll-driven animations, an interactive WebGL globe, and 18 featured projects.

> 🚧 **This site is actively in development.**

---

## ✨ Highlights

- **Zero dependencies** — No React, no Tailwind, no bundler. Pure HTML/CSS/JS.
- **6 color palettes** — Random on every visit. Each tints backgrounds, borders, terminals, and glows — not just the accent.
- **Dark & Light modes** — Instant toggle with a ring-expand animation that reveals the new theme from the button outward. No flash on load.
- **Scroll-driven timeline** — Experience section has a red progress bar that grows as you scroll, with animated dots that pulse when reached.
- **Terminal tech stack** — Skills displayed as a typing animation in a fake terminal window.
- **Interactive globe** — WebGL globe (cobe) in the About section, themed per palette, with a marker on New Delhi.
- **18 project cards** — Paged carousel with autoplay, keyboard navigation, and Instagram-style dot indicators.
- **Live YouTube feed** — Auto-fetches uploads via the YouTube Data API and renders a scrollable video strip.
- **Particle network background** — Canvas-based interactive particle system with spatial grid optimization.

---

## 📸 Sections

| Section | Anchor | What's There |
|:--------|:------:|:-------------|
| **Hero** | `#home` | Split layout — CDAC (professional) + *Echoes of the Mountain* game trailer (personal) with autoplay video |
| **About** | `#about` | 3×3 bento grid — intro tile, socials, terminal tech stack, profile photo, availability + WebGL globe |
| **Experience** | `#work` | Vertical timeline with scroll-driven progress bar, animated dots, company logos |
| **Projects** | `#projects` | Featured card + 17-card paged carousel with category filters (Game Dev, Web, AI/ML, Tools) |
| **Extra** | `#extra` | Activities, publications with status badges, certifications, journey gallery, YouTube feed |
| **Clients** | `#clients` | Two-row marquee of testimonials with avatar fallbacks and hover pause |
| **Contact** | `#contact` | Client-side validated form → `mailto:` link (no backend needed) |
| **Footer** | — | Name, social icon strip |

---

## 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| Markup | HTML5 — semantic, partial-based architecture loaded via `fetch()` |
| Styling | CSS3 — custom properties for theming, per-section stylesheets, keyframe animations |
| Logic | Vanilla JS — modular IIFE pattern, IntersectionObserver reveals, custom smooth scrolling |
| Globe | [cobe](https://github.com/shuding/cobe) — lightweight WebGL globe via CDN |
| Icons | 400+ technology SVGs from [Devicon](https://devicon.dev/) |
| YouTube | YouTube Data API v3 — fetches uploads playlist, renders scrollable strip |

---

## 📁 Project Structure

```
├── index.html                  # Entry point — boots partials + scripts
│
├── assets/
│   ├── docs/                   # CV / downloadable documents
│   ├── img/
│   │   ├── companies/          # Employer logos
│   │   ├── customer/           # Client avatars
│   │   ├── extra/              # Journey & experience photos
│   │   ├── icons/              # Social SVGs (GitHub, LinkedIn, etc.)
│   │   ├── me/                 # Profile photo
│   │   ├── misc/               # UI icons (arrows, moon, sun, pin)
│   │   ├── projects/           # 18 project cover images (1376×768)
│   │   └── techstack/          # 400+ technology logo SVGs
│   └── videos/
│       └── trailer.mp4         # Hero section game trailer
│
├── css/
│   ├── base.css                # Resets, typography, layout tokens
│   ├── themes/
│   │   ├── red/                # Bold editorial — pure black & red
│   │   ├── charcoal/           # Monochrome — cool grays
│   │   ├── midnight-blue/      # Deep navy-tinted surfaces
│   │   ├── gunmetal/           # Industrial blue-gray steel
│   │   ├── warm-black/         # Premium leather — warm tan/gold
│   │   └── amber/              # Warm gold-orange
│   │       ├── dark.css        # Dark mode CSS custom properties
│   │       └── light.css       # Light mode CSS custom properties
│   └── sections/
│       ├── header.css          # Fixed header + glass nav indicator
│       ├── hero.css            # Split hero layout, trailer
│       ├── about.css           # Bento grid, terminal, globe
│       ├── experience.css      # Timeline spine, dots, progress bar
│       ├── projects.css        # Carousel, cards, dot navigation
│       ├── reviews.css         # Marquee rows, avatar colors
│       ├── extra.css           # Activities, journey, YouTube strip
│       ├── contact.css         # Form styling, validation states
│       └── dividers.css        # Accent-colored section dividers
│
├── js/
│   ├── utils.js                # DOM helpers, debounce, smooth scroll
│   └── modules/
│       ├── header.js           # Nav links, glass indicator, theme toggle
│       ├── hero.js             # Video autoplay, pause/play toggle
│       ├── about.js            # Grid sizing, terminal, globe, CTA
│       ├── experience.js       # Scroll-driven progress + dot states
│       ├── projects.js         # Carousel, autoplay, keyboard, filters
│       ├── reviews.js          # Marquee cloning, speed calc, fallbacks
│       ├── extra.js            # YouTube API, auto-scroll, drag support
│       ├── contact.js          # Form validation, mailto builder
│       ├── network.js          # Canvas particle system (spatial grid)
│       └── animations.js       # IntersectionObserver reveal-on-scroll
│
└── partials/
    ├── header.html             # Fixed nav bar with theme toggle
    └── sections/
        ├── hero.html           # Split hero (CDAC + game trailer)
        ├── about.html          # Bento grid layout
        ├── experience.html     # Timeline cards
        ├── projects.html       # Featured + 17 carousel cards
        ├── extra.html          # Activities, publications, journey
        ├── reviews.html        # Client testimonials
        └── contact.html        # Contact form
```

---

## 🎨 Theming System

The site ships with **6 professional palettes**, randomly selected on each visit:

| Palette | Accent | Vibe |
|:--------|:-------|:-----|
| **Red** | `#ff0000` | Bold editorial — pure black & white with red punch |
| **Ivory & Charcoal** | `#888888` | Monochrome sophistication — zero distraction |
| **Midnight Blue** | `#4a7ab5` | Deep ocean — navy-tinted surfaces |
| **Gunmetal** | `#7a8a9a` | Industrial steel — developer edge |
| **Warm Black** | `#c49a6c` | Premium leather — tan gold accent |
| **Amber** | `#f59e0b` | Warm gold-orange — inviting, premium |

### How it works

1. An inline `<script>` in `<head>` picks a random palette and reads `localStorage` (or `prefers-color-scheme`) — sets `data-theme` and `data-palette` on `<html>` before first paint. **No flash.**
2. Two `<link>` tags inject `dark.css` and `light.css` from the selected palette folder. Each file defines 60+ CSS custom properties.
3. The moon/sun toggle fires a **ring-expand animation** — a `box-shadow` trick that reveals the new theme from the button's position outward.
4. The WebGL globe re-renders on theme/palette change, reading color values from CSS custom properties.

---

## ⚡ How It Boots

No build step. `index.html` runs a simple async boot sequence:

1. **Stage 1 — HTML Partials:** Fetches each partial in order via `fetch()` and injects into `#app` with `insertAdjacentHTML`. DOM order preserved.
2. **Stage 2 — JavaScript:** Loads each script sequentially (dependency order: utils → modules).
3. **Stage 3 — Init:** Each module self-initializes on `DOMContentLoaded`. A preloader overlay hides the page until everything is ready.

---

## 🔧 Configuration

| Setting | Location | Notes |
|:--------|:---------|:------|
| YouTube API key | `js/modules/extra.js` → `CONFIG.apiKey` | Restrict by HTTP referrer in Google Cloud Console |
| YouTube handle | `js/modules/extra.js` → `CONFIG.handle` | Currently `@PrakritTyagi19` |
| Contact email | `contact.html` + `contact.js` | `prakrittyagi.work@gmail.com` |
| Tech stack | `js/modules/about.js` → `techStack` object | Add/remove technologies from terminal |
| Theme colors | `css/themes/{palette}/dark.css` + `light.css` | All color tokens as CSS custom properties |
| Particle network | CSS custom properties `--network-*` | Density, speed, colors, connection distance |

---

## 🚀 Running Locally

No dependencies to install. Just serve the files:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# VS Code
# Right-click index.html → Open with Live Server
```

Open `http://localhost:8000` and you're live.

---

## 🌐 Browser Support

Targets modern evergreen browsers (Chrome, Firefox, Safari, Edge).

**Key APIs used:**
IntersectionObserver · CSS Custom Properties · ES2017+ async/await · CSS scroll-snap · backdrop-filter · Canvas 2D (particle network) · WebGL (cobe globe) · prefers-color-scheme · prefers-reduced-motion

---

## 📋 Projects Showcase

| # | Project | Category | Tech |
|:-:|:--------|:---------|:-----|
| ★ | **Unity Parkour System** | Game Dev | Unity, C#, Blender |
| 1 | Survival Game | Game Dev | Unity, C#, PostgreSQL |
| 2 | Video Hashing Web App | Web | Python, FastAPI, React, Docker |
| 3 | Document Scanner | AI/ML | Python, OpenCV, NumPy |
| 4 | FPS Template | Game Dev | Unity, C# |
| 5 | Object Detector | AI/ML | Python, OpenCV, NumPy |
| 6 | Object Measurement | AI/ML | Python, PyTorch, OpenCV |
| 7 | AI Pacman Game | AI/ML | Python, NumPy |
| 8 | Snake AI Game | AI/ML | Python, PyTorch |
| 9 | 2D to 3D Converter | AI/ML | Python, PyTorch, OpenCV, Blender |
| 10 | Talking Chatbot | AI/ML | Python, FastAPI, PyTorch |
| 11 | Game Launcher | Tools | C#, .NET |
| 12 | Video Thumbnail Maker | Tools | Python, OpenCV, Flask |
| 13 | Video Concatenator | Tools | Python, Flask |
| 14 | Video Downloader | Tools | Python, SQLite |
| 15 | N Queen Game | Web | HTML5, CSS3, JavaScript, React |
| 16 | DeepFake Software | AI/ML | Python, PyTorch, OpenCV |
| 17 | Neural Scribe | AI/ML | Python, PyTorch, React |
| 18 | Portfolio Website | Web | HTML5, CSS3, JavaScript |

---

## 📄 License

This is a personal portfolio. The codebase structure and design are original work by **Prakrit Tyagi**. Tech stack SVG icons are sourced from the [Devicon](https://devicon.dev/) project.

---

## 📬 Contact

<p>
  <a href="mailto:prakrittyagi.work@gmail.com"><strong>Email</strong></a> · 
  <a href="https://www.linkedin.com/in/prakrittyagi19"><strong>LinkedIn</strong></a> · 
  <a href="https://github.com/PrakritTyagi123"><strong>GitHub</strong></a> · 
  <a href="https://youtube.com/@PrakritTyagi19"><strong>YouTube</strong></a> · 
  <a href="https://x.com/Prakrittyagi1"><strong>Twitter/X</strong></a>
</p>