/* ============================================================
   RISHAV — Seamless View Router & Animation Engine
   Guarantees:
     1. ZERO browser reload when clicking sections (NO white flash / blink)
     2. Silky smooth cross-fade transitions between sections
     3. URL updates seamlessly (pushState + popstate back/forward support)
     4. Correct view auto-detected from URL on initial visit
     5. Minimalist loader runs once on first load
   ============================================================ */

(() => {
  'use strict';

  const VIEW_MAP = {
    'index.html':    'view-about',
    'about.html':    'view-about',
    '':              'view-about',
    'writing.html':  'view-writing',
    'research.html': 'view-research',
    'teaching.html': 'view-teaching',
    'press.html':    'view-press',
    'contact.html':  'view-contact',
  };

  const TITLE_MAP = {
    'view-about':    'Rishav — Queer Organizer & Researcher',
    'view-writing':  'Writing — Rishav',
    'view-research': 'Research — Rishav',
    'view-teaching': 'Teaching — Rishav',
    'view-press':    'Press — Rishav',
    'view-contact':  'Contact — Rishav',
  };

  let isSwitching = false;

  // ═══════════════════════════════════════════════════════════
  //  SEAMLESS VIEW SWITCHER (NO RELOAD / NO BLINK)
  // ═══════════════════════════════════════════════════════════
  function switchToView(targetViewId, pushUrl = true, targetUrl = null) {
    if (isSwitching) return;

    const currentView = document.querySelector('.page-view.is-active');
    const targetView = document.getElementById(targetViewId);

    if (!targetView) return;
    if (currentView === targetView) return;

    isSwitching = true;

    // 1. Update navigation states immediately
    updateNav(targetViewId);

    // 2. Fade out current view
    if (currentView) {
      currentView.classList.add('is-leaving');
      currentView.style.opacity = '0';
      currentView.style.transform = 'translateY(-10px)';
    }

    // 3. Swap views after brief fade-out
    setTimeout(() => {
      if (currentView) {
        currentView.classList.remove('is-active', 'is-leaving');
        currentView.style.display = 'none';
      }

      targetView.style.display = 'block';
      targetView.style.opacity = '0';
      targetView.style.transform = 'translateY(12px)';

      // Force layout reflow
      void targetView.offsetHeight;

      targetView.classList.add('is-active');
      targetView.style.opacity = '1';
      targetView.style.transform = 'translateY(0)';

      // Update document title
      if (TITLE_MAP[targetViewId]) {
        document.title = TITLE_MAP[targetViewId];
      }

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update URL without reloading
      if (pushUrl && window.history && window.history.pushState) {
        const destUrl = targetUrl || getUrlForView(targetViewId);
        try {
          window.history.pushState({ view: targetViewId }, '', destUrl);
        } catch (e) {
          // If running directly on restricted file:// origin, pushState may be restricted; safe fallback
        }
      }

      isSwitching = false;
    }, 180);
  }

  function getUrlForView(viewId) {
    for (const [url, id] of Object.entries(VIEW_MAP)) {
      if (id === viewId && url !== '') return url;
    }
    return 'index.html';
  }

  function updateNav(activeViewId) {
    const navLinks = document.querySelectorAll('.nav__link[data-view]');
    navLinks.forEach((link) => {
      const linkView = link.getAttribute('data-view');
      if (linkView === activeViewId) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  NAVIGATION INTERCEPTOR
  // ═══════════════════════════════════════════════════════════
  function initNavClicks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-view], a[href]');
      if (!link) return;

      const targetViewAttr = link.getAttribute('data-view');
      const href = link.getAttribute('href');

      // If it's a view link
      if (targetViewAttr) {
        e.preventDefault();
        switchToView(targetViewAttr, true, href);
        // Close mobile nav if open
        const navLinks = document.querySelector('.nav__links');
        if (navLinks) navLinks.classList.remove('nav__links--open');
        return;
      }

      // If it's a local .html link that maps to a view
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
        const cleanHref = href.split('/').pop().split('?')[0].split('#')[0];
        const mappedView = VIEW_MAP[cleanHref];
        if (mappedView) {
          e.preventDefault();
          switchToView(mappedView, true, href);
          const navLinks = document.querySelector('.nav__links');
          if (navLinks) navLinks.classList.remove('nav__links--open');
        }
      }
    });

    // Handle browser Back / Forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        switchToView(e.state.view, false);
      } else {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const viewId = VIEW_MAP[path] || 'view-about';
        switchToView(viewId, false);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  LOADER (Runs once on first entry / hard refresh)
  // ═══════════════════════════════════════════════════════════
  function runInitialLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;

    const line = loader.querySelector('.loader__line');
    if (line) {
      setTimeout(() => {
        line.style.transition = 'width 650ms cubic-bezier(0.22, 1, 0.36, 1)';
        line.style.width = '64px';
      }, 80);
    }

    setTimeout(() => {
      loader.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
      loader.style.transform = 'translateY(-100%)';

      setTimeout(() => {
        loader.style.display = 'none';
      }, 620);
    }, 750);
  }

  // ═══════════════════════════════════════════════════════════
  //  FORM HANDLING (Contact Form)
  // ═══════════════════════════════════════════════════════════
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-outline-send');
      const originalText = btn ? btn.textContent : 'SEND MESSAGE';

      if (btn) {
        btn.textContent = 'MESSAGE SENT!';
        btn.style.background = '#1a1a1a';
        btn.style.color = '#ffffff';
        btn.disabled = true;

        setTimeout(() => {
          form.reset();
          btn.textContent = originalText;
          btn.style.background = 'transparent';
          btn.style.color = '#1a1a1a';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  NAV SCROLL EFFECT (Frosted glass)
  // ═══════════════════════════════════════════════════════════
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 15);
        ticking = false;
      });
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════
  //  MOBILE NAV TOGGLE
  // ═══════════════════════════════════════════════════════════
  function initMobileNav() {
    const toggle = document.querySelector('.nav__toggle');
    const links  = document.querySelector('.nav__links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      links.classList.toggle('nav__links--open');
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  BOOTSTRAP
  // ═══════════════════════════════════════════════════════════
  function init() {
    // 1. Determine active view from URL
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    const initialViewId = VIEW_MAP[filename] || 'view-about';

    // Activate the appropriate view
    const allViews = document.querySelectorAll('.page-view');
    allViews.forEach((v) => {
      if (v.id === initialViewId) {
        v.style.display = 'block';
        v.classList.add('is-active');
        v.style.opacity = '1';
        v.style.transform = 'translateY(0)';
      } else {
        v.style.display = 'none';
        v.classList.remove('is-active');
      }
    });

    updateNav(initialViewId);
    if (TITLE_MAP[initialViewId]) {
      document.title = TITLE_MAP[initialViewId];
    }

    // 2. Setup listeners
    initNavClicks();
    initContactForm();
    initNavScroll();
    initMobileNav();

    // 3. Play initial loader once
    runInitialLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
