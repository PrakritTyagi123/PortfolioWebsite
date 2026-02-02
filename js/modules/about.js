(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ===========================================
     TECH STACK CONFIGURATION
     Update the 'logo' paths to match your SVG files
     =========================================== */
  const techStack = {
    Frontend: [
      { name: 'HTML5',        logo: 'assets/img/techstack/HTML5.svg' },
      { name: 'CSS3',         logo: 'assets/img/techstack/CSS3.svg' },
      { name: 'JavaScript',   logo: 'assets/img/techstack/JavaScript.svg' },
      { name: 'React',        logo: 'assets/img/techstack/React.svg' },
      { name: 'Next.js',      logo: 'assets/img/techstack/Next.js.svg' },
      { name: 'TypeScript',   logo: 'assets/img/techstack/TypeScript.svg' },
      { name: 'Tailwind CSS', logo: 'assets/img/techstack/Tailwind-CSS.svg' },
      { name: 'Three.js',     logo: 'assets/img/techstack/Three.js.svg' },
    ],
    
    Backend: [
      { name: 'Node.js',      logo: 'assets/img/techstack/Node.js.svg' },
      { name: 'Express',      logo: 'assets/img/techstack/Express.svg' },
      { name: 'Python',       logo: 'assets/img/techstack/Python.svg' },
      { name: 'PostgreSQL',   logo: 'assets/img/techstack/PostgresSQL.svg' },
      { name: 'MongoDB',      logo: 'assets/img/techstack/MongoDB.svg' },
      { name: 'Redis',        logo: 'assets/img/techstack/Redis.svg' },
    ],
    
    Gamedev: [
      { name: 'Unity',        logo: 'assets/img/techstack/Unity.svg' },
      { name: 'C#',           logo: 'assets/img/techstack/C%23-(CSharp).svg' },
      { name: 'Unreal Engine',logo: 'assets/img/techstack/Unreal-Engine.svg' },
      { name: 'Blender',      logo: 'assets/img/techstack/Blender.svg' },
    ],
    
    Devops: [
      { name: 'AWS',          logo: 'assets/img/techstack/AWS.svg' },
      { name: 'Docker',       logo: 'assets/img/techstack/Docker.svg' },
      { name: 'Git',          logo: 'assets/img/techstack/Git.svg' },
      { name: 'GitHub',       logo: 'assets/img/techstack/GitHub.svg' },
      { name: 'Linux',        logo: 'assets/img/techstack/Linux.svg' },
      { name: 'NGINX',        logo: 'assets/img/techstack/NGINX.svg' },
    ],
    
    AI_ML: [
      { name: 'Python',       logo: 'assets/img/techstack/Python.svg' },
      { name: 'NumPy',        logo: 'assets/img/techstack/NumPy.svg' },
      { name: 'Pandas',       logo: 'assets/img/techstack/Pandas.svg' },
      { name: 'PyTorch',      logo: 'assets/img/techstack/PyTorch.svg' },
      { name: 'TensorFlow',   logo: 'assets/img/techstack/TensorFlow.svg' },
      { name: 'Jupyter',      logo: 'assets/img/techstack/Jupyter.svg' },
    ],
    
    Design: [
      { name: 'Figma',        logo: 'assets/img/techstack/Figma.svg' },
      { name: 'Photoshop',    logo: 'assets/img/techstack/Adobe-Photoshop.svg' },
      { name: 'Illustrator',  logo: 'assets/img/techstack/Adobe-Illustrator.svg' },
      { name: 'After Effects',logo: 'assets/img/techstack/After-Effects.svg' },
    ],
  };

  /* ---------- Smooth scroll helpers ---------- */
  function rafSmoothScrollTo(targetY, duration = 700) {
    const root = document.scrollingElement || document.documentElement;
    const startY = root.scrollTop;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      root.scrollTop = startY + deltaY * easeInOutCubic(p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function getHeaderH() {
    if (window.scrollUtils && typeof window.scrollUtils.getHeaderHeight === 'function') {
      return window.scrollUtils.getHeaderHeight();
    }
    const rs = getComputedStyle(document.documentElement);
    const v = parseFloat(rs.getPropertyValue('--header-h'));
    return Number.isFinite(v) ? v : 56;
  }

  function smoothTo(hash) {
    const id = (hash || '').replace(/^#/, '');
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    if (window.scrollUtils && typeof window.scrollUtils.scrollToElement === 'function') {
      window.scrollUtils.scrollToElement(el);
    } else {
      const headerH = getHeaderH();
      const elementTop = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
      const targetY = Math.max(0, elementTop - headerH);
      rafSmoothScrollTo(targetY, 700);
    }
  }

  /* ---------- Compute about-grid cell ---------- */
  function computeAboutCell(section) {
    const grid = $('.about-grid', section);
    if (!grid) return;

    const secStyles = getComputedStyle(section);
    const pt = parseFloat(secStyles.paddingTop) || 0;
    const pb = parseFloat(secStyles.paddingBottom) || 0;

    const title = $('.section-title', section);
    let titleH = 0, titleMB = 0;
    if (title) {
      const r = title.getBoundingClientRect();
      titleH = r.height;
      const tcs = getComputedStyle(title);
      titleMB = parseFloat(tcs.marginBottom) || 0;
    }

    const headerH = getHeaderH();
    const availH = window.innerHeight - headerH - pt - pb - titleH - titleMB;
    const capByWidth = window.innerWidth * 0.92;
    const maxBox = Math.min(1100, capByWidth, availH);
    const GAP = 12;

    let cell = (maxBox - 2 * GAP) / 3;
    cell = Math.max(170, Math.min(cell, 360));

    grid.style.setProperty('--about-cell', cell + 'px');
    grid.style.setProperty('--about-gap', GAP + 'px');
  }

  /* ---------- Terminal Tech Stack ---------- */
  function buildTerminalLines() {
    const lines = [
      { type: 'bracket', content: '{' },
    ];

    const categories = Object.entries(techStack);
    categories.forEach(([category, items], catIndex) => {
      // Use lowercase category labels like "frontend"
      const label = category;
      lines.push({ type: 'section', content: `  "${label}": [` });

      // Add each tech item, tracking last-in-section for commas
      items.forEach((tech, index) => {
        const isLastInSection = index === items.length - 1;
        lines.push({ type: 'tech', name: tech.name, logo: tech.logo, last: isLastInSection });
      });

      // Close bracket with or without comma
      const isLast = catIndex === categories.length - 1;
      lines.push({ type: 'bracket', content: isLast ? '  ]' : '  ],' });
    });

    lines.push({ type: 'bracket', content: '}' });
    return lines;
  }

  function initTerminalStack(section) {
    const output = $('#ts-output', section);
    if (!output) return;

    // Clear any existing content
    output.innerHTML = '';

    const lines = buildTerminalLines();
    let animationStarted = false;

    // Create all line elements first (hidden)
    const lineElements = lines.map((line, index) => {
      const el = document.createElement('div');
      el.className = `ts-line ts-line--${line.type}`;
      el.style.animationDelay = `${index * 0.04}s`;
      el.style.animationPlayState = 'paused';

      if (line.type === 'tech') {
        const techLabel = `"${line.name}"${line.last ? '' : ','}`;
        el.innerHTML = `
          <div class="ts-tech-logo">
            <img src="${line.logo}" alt="${line.name}" loading="lazy" />
          </div>
          <span class="ts-tech-name">${techLabel}</span>
        `;
      } else {
        el.textContent = line.content;
      }

      output.appendChild(el);
      return el;
    });

    // Function to start animation
    function startAnimation() {
      if (animationStarted) return;
      animationStarted = true;

      lineElements.forEach((el, index) => {
        setTimeout(() => {
          el.style.animationPlayState = 'running';
        }, index * 50);
      });
    }

    // Check if section is already in view
    if (section.classList.contains('is-inview')) {
      setTimeout(startAnimation, 400);
    }

    // Watch for the section to come into view
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (section.classList.contains('is-inview')) {
            setTimeout(startAnimation, 400);
          }
        }
      });
    });

    observer.observe(section, { attributes: true });

    // Fallback: start animation after page load if section is visible
    window.addEventListener('load', () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(startAnimation, 500);
      }
    });
  }

  /* ---------- Globe Setup ---------- */
  function setupGlobe() {
    const canvas = document.getElementById('cobe-globe');
    if (!canvas) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import createGlobe from 'https://cdn.skypack.dev/cobe@0.6.3';
      
      let phi = 0;
      let globe = null;
      const canvas = document.getElementById('cobe-globe');
      
      function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
      }
      
      function createGlobeInstance() {
        if (globe) {
          globe.destroy();
          globe = null;
        }
        
        const dark = isDarkMode();
        
        const config = {
          dark: 1,
          baseColor: [1, 1, 1],
          glowColor: [0.2, 0.2, 0.2],
          mapBrightness: 6,
        };
        
        globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: 1000,
          height: 1000,
          phi: phi,
          theta: 0.3,
          dark: config.dark,
          diffuse: 1.2,
          mapSamples: 16000,
          mapBrightness: config.mapBrightness,
          baseColor: config.baseColor,
          markerColor: [1, 0.2, 0.2],
          glowColor: config.glowColor,
          markers: [
            { location: [28.6139, 77.2090], size: 0.1 },
          ],
          onRender: (state) => {
            state.phi = phi;
            phi += 0.001;
          },
        });
        
        window._cobeGlobe = globe;
      }
      
      if (canvas) {
        setTimeout(createGlobeInstance, 100);
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
              setTimeout(createGlobeInstance, 50);
            }
          });
        });
        
        observer.observe(document.documentElement, { attributes: true });
      }
    `;
    document.body.appendChild(script);
  }

  /* ---------- Scroll observer ---------- */
  function observeSection(section) {
    const ENTER_RATIO = 0.52;
    const EXIT_RATIO = 0.28;
    let active = false;

    const setOn = () => {
      if (!active) {
        section.classList.add('is-inview');
        active = true;
      }
    };
    const setOff = () => {
      if (active) {
        section.classList.remove('is-inview');
        active = false;
      }
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target !== section) continue;
        const ratio = e.intersectionRatio || 0;

        if (!active) {
          if (e.isIntersecting && ratio >= ENTER_RATIO) setOn();
        } else {
          if (!e.isIntersecting || ratio <= EXIT_RATIO) setOff();
        }
      }
    }, {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.15, 0.28, 0.4, 0.52, 0.75, 1]
    });

    io.observe(section);

    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const ratio = visible / Math.max(1, rect.height);
      if (ratio >= ENTER_RATIO) setOn();
      else setOff();
    });
  }

  /* ---------- Contact CTA smooth scroll ---------- */
  function bindContactCTA(section) {
    section.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#contact"]');
      if (!a || !section.contains(a)) return;
      e.preventDefault();
      smoothTo('#contact');
      history.pushState(null, '', '#contact');
    }, { passive: false });

    window.addEventListener('hashchange', () => {
      if (location.hash === '#contact') smoothTo('#contact');
    });
    if (location.hash === '#contact') {
      setTimeout(() => smoothTo('#contact'), 0);
    }
  }

  /* ---------- Init ---------- */
  function init() {
    const section = $('#about');
    if (!section) return;

    computeAboutCell(section);
    initTerminalStack(section);
    setupGlobe();
    observeSection(section);
    bindContactCTA(section);

    window.addEventListener('resize', () => {
      computeAboutCell(section);
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      computeAboutCell(section);
    }, { passive: true });
    window.addEventListener('load', () => {
      computeAboutCell(section);
    });
  }

  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();