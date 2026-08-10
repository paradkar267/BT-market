/* ==========================================================================
   THE ATELIER — Main JavaScript
   Core: navbar scroll, scroll reveals, mobile menu, smooth scroll
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     NAVBAR — Transparent → Solid on Scroll
     ------------------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (!navbar) return;

    if (scrollY > 60) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--solid');
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.classList.add('navbar--transparent');
    }

    lastScrollY = scrollY;
  }

  if (navbar) {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Initial check
  }

  /* -------------------------------------------------------------------
     MOBILE MENU — Toggle + Focus Trap
     ------------------------------------------------------------------- */
  const menuToggle = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuToggle.classList.add('is-active');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');

    // Force navbar to stay dark when menu is open
    navbar.classList.remove('navbar--solid');
    navbar.classList.add('navbar--transparent');

    // Focus first link after animation
    setTimeout(() => {
      const firstLink = mobileMenu.querySelector('.mobile-menu__link');
      if (firstLink) firstLink.focus();
    }, 400);
  }

  function closeMenu() {
    menuOpen = false;
    menuToggle.classList.remove('is-active');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
    handleNavScroll(); // Restore nav state
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuOpen ? closeMenu() : openMenu();
    });

    // Close menu on link click
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
        menuToggle.focus();
      }
    });

    // Focus trap within mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusable = mobileMenu.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* -------------------------------------------------------------------
     SCROLL REVEAL — Intersection Observer
     ------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      revealElements.forEach((el) => revealObserver.observe(el));
    }
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-revealed');
    });
  }

  /* -------------------------------------------------------------------
     STAT COUNTER — Count up on scroll into view
     ------------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('[data-count]');

  if (statNumbers.length > 0 && !prefersReducedMotion) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();

            function animate(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quad
              const eased = 1 - (1 - progress) * (1 - progress);
              const current = Math.floor(eased * target);
              el.textContent = current + suffix;

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                el.textContent = target + suffix;
              }
            }

            requestAnimationFrame(animate);
            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  }

  /* -------------------------------------------------------------------
     SMOOTH SCROLL — For anchor links
     ------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    });
  });

  /* -------------------------------------------------------------------
     STICKY MOBILE CTA BAR — Show after hero scroll-past
     ------------------------------------------------------------------- */
  const stickyCta = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero') || document.querySelector('.page-hero');

  if (stickyCta && hero) {
    const stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            stickyCta.classList.add('is-visible');
          } else {
            stickyCta.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0 }
    );

    stickyObserver.observe(hero);
  }

  /* -------------------------------------------------------------------
     ACTIVE NAV LINK — Highlight based on current page
     ------------------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .mobile-menu__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === 'index.html')) {
      link.classList.add('navbar__link--active');
    }
  });

})();
