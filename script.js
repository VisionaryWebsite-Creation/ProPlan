/* ==========================================================================
   AUREN — script.js
   Part 1: GSAP registration + reduced-motion aware config only.
   No animations are written yet — Part 4 (hero), Part 6 (features),
   Part 8 (specs) and Part 9 (CTA/footer) will each add their own
   clearly-labeled section below this boilerplate.
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (typeof gsap === 'undefined') {
    console.error('Auren: GSAP failed to load from CDN.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Global GSAP defaults so every future animation in this project shares
  // one consistent feel. Match --ease-signature / --duration-med in styles.css.
  gsap.defaults({
    ease: 'expo.out',
    duration: 0.6,
  });

  // Respect the user's OS-level motion preference project-wide. Later parts
  // should check `window.AUREN.reducedMotion` before building any timeline,
  // or simply skip ScrollTrigger-driven motion and rely on the CSS fallback.
  window.AUREN = window.AUREN || {};
  window.AUREN.reducedMotion = prefersReducedMotion;
  window.AUREN.gsapVersion = gsap.version;

  console.log(
    `Auren foundation ready — GSAP v${gsap.version} registered` +
    (prefersReducedMotion ? ' (reduced motion: on)' : '')
  );

  // ==========================================================================
  // NAVBAR (Part 2)
  // ==========================================================================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  let menuOpen = false;

  // Scroll-aware background/blur state.
  function updateNavScrollState() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNavScrollState, { passive: true });
  updateNavScrollState();

  function openMenu() {
    menuOpen = true;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navToggle.classList.add('is-active');
    mobileMenu.classList.add('is-open');
    document.body.classList.add('menu-open');

    if (!prefersReducedMotion) {
      gsap.timeline()
        .fromTo(mobileMenu, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.35 })
        .fromTo(mobileMenuLinks, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06 }, '-=0.15');
    } else {
      gsap.set(mobileMenu, { autoAlpha: 1, y: 0 });
      gsap.set(mobileMenuLinks, { autoAlpha: 1, y: 0 });
    }
  }

  function closeMenu() {
    menuOpen = false;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.classList.remove('is-active');
    document.body.classList.remove('menu-open');

    if (!prefersReducedMotion) {
      gsap.to(mobileMenu, {
        autoAlpha: 0,
        y: -12,
        duration: 0.25,
        onComplete: () => mobileMenu.classList.remove('is-open'),
      });
    } else {
      mobileMenu.classList.remove('is-open');
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

    mobileMenuLinks.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    // Collapse the mobile menu automatically if the viewport grows past the
    // mobile breakpoint (e.g. rotating a tablet, or resizing a window).
    window.addEventListener('resize', () => {
      if (menuOpen && window.innerWidth > 860) closeMenu();
    });
  }

  // ==========================================================================
  // HERO MOTION (Part 4)
  // Progressive enhancement: the hero is fully visible via normal HTML/CSS
  // with no JS at all. This block ADDS an entrance animation and scroll
  // parallax on top of that — it never hides content that JS might fail to
  // reveal. When reduced motion is on, we skip this entirely and the hero
  // simply stays in its normal, static, fully-visible state.
  // ==========================================================================
  const heroSection = document.querySelector('.hero');

  if (heroSection && !prefersReducedMotion) {
    const copyChildren = heroSection.querySelectorAll('.hero__copy > *');
    const visual = heroSection.querySelector('.hero__visual');
    const glow = heroSection.querySelector('.hero__glow');
    const mark = heroSection.querySelector('.hero__aperture-mark');
    const tags = heroSection.querySelectorAll('.hero__tag');

    // Entrance timeline, plays once on load.
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(copyChildren, { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.12 })
      .from(glow, { autoAlpha: 0, scale: 0.8, duration: 1 }, '-=0.5')
      .from(mark, { autoAlpha: 0, scale: 0.7, rotate: -25, duration: 0.9 }, '<')
      .from(tags, { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.1 }, '-=0.4');

    // Subtle scroll-linked parallax: the visual drifts and rotates slightly
    // as the hero scrolls past, tying it to scroll position rather than time.
    if (visual) {
      gsap.to(visual, {
        yPercent: 8,
        rotate: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  // ==========================================================================
  // FEATURES MOTION (Part 6)
  // Same progressive-enhancement rule as the hero: cards are fully visible
  // via plain HTML/CSS. JS only hides-then-reveals them when motion is on.
  // ==========================================================================
  const featureCards = gsap.utils.toArray('.feature-card');

  if (featureCards.length && !prefersReducedMotion) {
    gsap.set(featureCards, { autoAlpha: 0, y: 30 });

    // ScrollTrigger.batch reveals cards in the order they individually enter
    // the viewport, staggered within each batch — not all four animating
    // from one single trigger point regardless of scroll position.
    ScrollTrigger.batch(featureCards, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'expo.out',
        }),
    });

    // Subtle hover detail on top of the existing CSS lift: the category
    // label nudges right slightly, echoing the card's own lift with a
    // second, quieter motion instead of duplicating it.
    featureCards.forEach((card) => {
      const label = card.querySelector('.feature-card__label');
      if (!label) return;
      card.addEventListener('mouseenter', () => {
        gsap.to(label, { x: 4, duration: 0.25, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(label, { x: 0, duration: 0.25, ease: 'power2.out' });
      });
    });
  }

  // ==========================================================================
  // SPECS MOTION (Part 8)
  // Same progressive-enhancement rule as every other part. The accordion
  // (Part 7) already works with zero JS via native <details>/<summary>;
  // everything here only adds polish on top and always falls back cleanly.
  // ==========================================================================
  const specSheet = document.querySelector('.spec-sheet');

  if (specSheet) {
    const specGroups = gsap.utils.toArray('.spec-group');

    // Scroll reveal — deliberately lighter/quicker than the Features
    // reveal (smaller travel distance, tighter stagger, a plainer ease)
    // so the page doesn't feel like the same effect repeated section to
    // section.
    if (specGroups.length && !prefersReducedMotion) {
      gsap.set(specGroups, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(specGroups, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
          }),
      });
    }

    // Count-up numbers. Static fallback text is already correct in the
    // HTML, so this only runs when motion is enabled — if it never fires,
    // the person still sees the right value.
    if (!prefersReducedMotion) {
      gsap.utils.toArray('.spec-countup').forEach((el) => {
        const target = parseInt(el.dataset.value, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (Number.isNaN(target)) return;

        const counter = { value: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              value: target,
              duration: 1,
              ease: 'power1.out',
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(counter.value).toLocaleString()}${suffix}`;
              },
            });
          },
        });
      });
    }

    // Smoothed accordion open/close. When reduced motion is on, the click
    // handler simply doesn't call preventDefault(), so the native
    // <details> toggle from Part 7 runs exactly as before — untouched.
    if (!prefersReducedMotion) {
      specGroups.forEach((details) => {
        const summary = details.querySelector('summary');
        const rows = details.querySelector('.spec-rows');
        if (!summary || !rows) return;

        summary.addEventListener('click', (e) => {
          if (details.dataset.animating === 'true') {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          details.dataset.animating = 'true';

          if (details.hasAttribute('open')) {
            gsap.set(rows, { height: rows.scrollHeight, overflow: 'hidden' });
            gsap.to(rows, {
              height: 0,
              duration: 0.35,
              ease: 'power2.inOut',
              onComplete: () => {
                details.removeAttribute('open');
                gsap.set(rows, { height: '', overflow: '' });
                details.dataset.animating = 'false';
              },
            });
          } else {
            details.setAttribute('open', '');
            const target = rows.scrollHeight;
            gsap.fromTo(
              rows,
              { height: 0, overflow: 'hidden' },
              {
                height: target,
                duration: 0.35,
                ease: 'power2.inOut',
                onComplete: () => {
                  gsap.set(rows, { height: '', overflow: '' });
                  details.dataset.animating = 'false';
                },
              }
            );
          }
        });
      });
    }
  }
})();
