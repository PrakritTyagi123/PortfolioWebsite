# Prakrit Tyagi — Portfolio Website

A single-page portfolio built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — just clean, modular code with dark/light theming, scroll-driven animations, and a fully responsive layout.

> **Note:** This website is still in development.

---

## Live Sections

| Section | Anchor | Description |
|---|---|---|
| **Hero** | `#home` | Full-width game trailer (*Echoes of the Mountain*) with autoplay video and play/pause toggle |
| **About** | `#about` | 3×3 bento grid — intro, socials, terminal-style tech stack, profile photo, availability globe |
| **Work Experience** | `#work` | Vertical timeline with scroll-driven red progress bar and animated dots |
| **Projects** | `#projects` | Paged carousel (17 projects) with autoplay, keyboard nav, IG-style dot indicators, and tech stack tooltips |
| **Extra** | `#extra` | Activities, publications with status badges, certifications, journey gallery, and live YouTube feed |
| **Clients** | `#clients` | Two-row marquee of client testimonials with avatar fallbacks and hover pause |
| **Contact** | `#contact` | Mailto-based contact form with inline validation |
| **Footer** | — | Name, social icon strip |

---

## Tech Stack

This site is intentionally zero-dependency on the frontend — no React, no Tailwind, no bundler.

- **HTML5** — Semantic markup, partials loaded at runtime via `fetch()`
- **CSS3** — Custom properties for theming, per-section stylesheets, CSS keyframe animations, scroll-snap
- **Vanilla JS** — Modular IIFE architecture, IntersectionObserver for reveals, custom smooth scrolling
- **cobe** — Lightweight WebGL globe (loaded via CDN) for the availability tile
- **YouTube Data API v3** — Fetches the full uploads playlist and renders a scrollable video strip

---

## Project Structure

```
├── index.html                 # Entry point — boots partials + scripts sequentially
│
├── assets/
│   ├── docs/                  # CV / downloadable documents
│   ├── img/
│   │   ├── companies/         # Employer logos
│   │   ├── customer/          # Client avatar photos
│   │   ├── extra/             # Journey & experience photos
│   │   ├── icons/             # Social SVGs (GitHub, LinkedIn, etc.)
│   │   ├── me/                # Profile photo
│   │   ├── misc/              # UI icons (arrows, moon, sun, pin)
│   │   ├── projects/          # Project cover images
│   │   └── techstack/         # 400+ technology logo SVGs
│   └── videos/
│       └── trailer.mp4        # Hero section game trailer
│
├── css/
│   ├── base.css               # Resets, typography, layout tokens, footer
│   ├── themes/
│   │   ├── dark.css           # Dark theme CSS custom properties
│   │   └── light.css          # Light theme CSS custom properties
│   └── sections/
│       ├── header.css          # Fixed header + glass nav indicator
│       ├── hero.css            # Trailer layout, scroll disclaimer
│       ├── about.css           # Bento grid, terminal, globe, animations
│       ├── experience.css      # Timeline spine, dots, progress bar
│       ├── projects.css        # Carousel, cards, dot navigation
│       ├── reviews.css         # Marquee rows, avatar colors
│       ├── extra.css           # Activities, journey, YouTube strip
│       ├── contact.css         # Form styling, validation states
│       └── dividers.css        # Red line section dividers
│
├── js/
│   ├── main.js                # Module initializer
│   ├── utils/
│   │   ├── css.js             # CSS variable helpers
│   │   ├── dom.js             # Query selectors, matrix utils
│   │   ├── io.js              # Debounce, throttle, event helpers
│   │   └── scroll.js          # Smooth scroll, header offset calc
│   └── modules/
│       ├── header.js          # Nav links, glass indicator, theme toggle + ring animation
│       ├── hero.js            # Video autoplay, pause/play, disclaimer scroll
│       ├── about.js           # Grid sizing, terminal tech stack, globe, CTA scroll
│       ├── experience.js      # Scroll-driven progress bar + dot state machine
│       ├── projects.js        # Paged carousel, autoplay, dots, keyboard, tooltips
│       ├── reviews.js         # Marquee cloning, speed calc, avatar fallbacks
│       ├── extra.js           # YouTube API fetch, auto-scroll strip, drag support
│       ├── contact.js         # Form validation, mailto builder
│       └── animations.js      # IntersectionObserver reveal-on-scroll
│
└── partials/
    ├── head.html              # Meta, theme bootstrap, stylesheet links
    ├── header.html            # Fixed nav bar with theme toggle
    └── sections/
        ├── hero.html
        ├── about.html
        ├── experience.html
        ├── projects.html
        ├── extra.html
        ├── reviews.html
        └── contact.html
```

---

## Theming

The site ships with two themes — **dark** (black/white/red) and **light** (white/black/red). Both share `--accent: #ff0000` as the only color accent.

How it works:

1. An inline script in `<head>` reads `localStorage` (or falls back to `prefers-color-scheme`) and sets `data-theme` on `<html>` before any paint — no flash.
2. Two theme stylesheets (`dark.css`, `light.css`) define all color tokens as CSS custom properties. Only one is enabled at a time via the `disabled` attribute.
3. Clicking the moon/sun toggle in the header fires a ring-expand animation (a CSS `box-shadow` trick) that reveals the new theme from the button's position outward.
4. The globe in the About section re-renders on theme change; in light mode it's CSS `filter: invert(1)`.

---

## How It Boots

There is no build step. `index.html` runs a simple async boot sequence:

1. **Stage 1 — HTML Partials:** Fetches each partial in order via `fetch()` and injects them into `#app` with `insertAdjacentHTML`. Order is preserved so the DOM reads top-to-bottom.
2. **Stage 2 — JavaScript:** Loads each script file sequentially with dynamic `<script>` elements (dependency order matters — utils before modules).
3. **Stage 3 — Init:** Calls `themeModule.init()` to finalize the toggle binding. Each module self-initializes on `DOMContentLoaded` or immediately if the DOM is already ready.

---

## Key Features

- **Scroll-driven experience timeline** — A red progress bar grows down the spine as you scroll; dots transition from white → pulsing red as the bar reaches them.
- **Terminal tech stack** — The About section renders your stack as a fake terminal window with typing animation, organized by category (Frontend, Backend, Gamedev, DevOps, AI/ML, Design).
- **Project carousel** — 17 projects in a paged slider with autoplay (8s), hover-pause, keyboard arrows, and an Instagram-style sliding 5-dot window.
- **Live YouTube feed** — Pulls all uploads via the YouTube Data API, renders thumbnails in an auto-scrolling strip with drag support, and badges videos posted within the last week as "Latest."
- **Active nav indicator** — The active nav link is highlighted with an `is-active` class based on which section is most visible in the viewport. The header has a frosted-glass backdrop effect.
- **Marquee client reviews** — Two rows scrolling in opposite directions, CSS-animated with JS-calculated duration for constant px/sec speed. Avatar images fall back to colored initials.
- **Zero-backend contact form** — Validates client-side, then constructs a `mailto:` link that opens the user's default email client with the form data pre-filled.

---

## Running Locally

No dependencies to install. Just serve the files:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:8000`.

---

## Configuration

- **YouTube API key** — Located in `js/modules/extra.js` under `CONFIG.apiKey`. Restrict this key by HTTP referrer in the Google Cloud Console for production use.
- **YouTube handle** — `CONFIG.handle` in the same file. Currently set to `@PrakritTyagi19`.
- **Contact email** — Defined in `contact.html`'s form `action` attribute and in `contact.js` as a fallback: `prakrittyagi.work@gmail.com`.
- **Tech stack** — Edit the `techStack` object at the top of `js/modules/about.js` to add or remove technologies from the terminal display.
- **Theme colors** — All color tokens live in `css/themes/dark.css` and `css/themes/light.css`.

---

## Browser Support

Targets modern evergreen browsers (Chrome, Firefox, Safari, Edge). Key APIs used:

- `IntersectionObserver`
- `CSS Custom Properties`
- `ES2017+ async/await`
- `CSS scroll-snap`
- `backdrop-filter` (glass indicator — graceful degradation)
- `prefers-color-scheme` and `prefers-reduced-motion` media queries

---

## License

This is a personal portfolio. The codebase structure and design are original work by Prakrit Tyagi. Tech stack SVG icons are sourced from the [Devicon](https://devicon.dev/) project.

---

## Contact

- **Email:** prakrittyagi.work@gmail.com
- **LinkedIn:** [prakrittyagi19](https://www.linkedin.com/in/prakrittyagi19)
- **GitHub:** [PrakritTyagi123](https://github.com/PrakritTyagi123)
- **YouTube:** [@PrakritTyagi19](https://youtube.com/@PrakritTyagi19)
- **Twitter/X:** [@Prakrittyagi1](https://x.com/Prakrittyagi1)
