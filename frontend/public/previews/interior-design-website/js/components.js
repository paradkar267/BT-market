/* ==========================================================================
   THE ATELIER — Component JavaScript
   Accordion, Before/After Slider, Multi-step Form, Filters,
   Cursor Follow Preview, Testimonial Carousel, Lightbox, Tabs
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------
     FAQ ACCORDION — Keyboard accessible, ARIA compliant
     ------------------------------------------------------------------- */
  const accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    if (!trigger || !panel) return;

    // Set initial ARIA
    const panelId = panel.id || `panel-${Math.random().toString(36).substr(2, 9)}`;
    const triggerId = trigger.id || `trigger-${Math.random().toString(36).substr(2, 9)}`;
    panel.id = panelId;
    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0';
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Keyboard: Enter/Space
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  /* -------------------------------------------------------------------
     BEFORE / AFTER SLIDER — Drag + Keyboard
     ------------------------------------------------------------------- */
  const baSliders = document.querySelectorAll('.ba-slider');

  baSliders.forEach((slider) => {
    const beforeEl = slider.querySelector('.ba-slider__before');
    const handle = slider.querySelector('.ba-slider__handle');
    let isDragging = false;

    function updatePosition(x) {
      const rect = slider.getBoundingClientRect();
      let pos = ((x - rect.left) / rect.width) * 100;
      pos = Math.max(5, Math.min(95, pos));

      beforeEl.style.width = pos + '%';
      handle.style.left = pos + '%';
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Keyboard: Arrow keys
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', 'Before and after comparison. Use arrow keys to adjust.');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');

    slider.addEventListener('keydown', (e) => {
      const rect = slider.getBoundingClientRect();
      const currentPct = (parseFloat(handle.style.left) || 50);
      let newPct = currentPct;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newPct = Math.max(5, currentPct - 2);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newPct = Math.min(95, currentPct + 2);
        e.preventDefault();
      }

      if (newPct !== currentPct) {
        beforeEl.style.width = newPct + '%';
        handle.style.left = newPct + '%';
        slider.setAttribute('aria-valuenow', Math.round(newPct));
      }
    });

    // Click on slider body to jump
    slider.addEventListener('click', (e) => {
      if (e.target === handle || handle.contains(e.target)) return;
      updatePosition(e.clientX);
    });
  });

  /* -------------------------------------------------------------------
     MULTI-STEP FORM
     ------------------------------------------------------------------- */
  const multiForm = document.querySelector('.form-multi');

  if (multiForm) {
    const panels = multiForm.querySelectorAll('.form-multi__panel');
    const progressFill = multiForm.querySelector('.form-multi__progress-fill');
    const stepIndicator = multiForm.querySelector('.form-multi__step-indicator');
    const liveRegion = multiForm.querySelector('[aria-live]') || document.createElement('div');
    let currentStep = 0;
    const totalSteps = panels.length;

    function showStep(index) {
      panels.forEach((p, i) => {
        p.classList.toggle('is-active', i === index);
      });

      currentStep = index;

      // Update progress
      const progress = ((index + 1) / totalSteps) * 100;
      if (progressFill) progressFill.style.width = progress + '%';
      if (stepIndicator) stepIndicator.textContent = `Step ${index + 1} of ${totalSteps}`;

      // Announce to screen readers
      if (liveRegion) {
        liveRegion.textContent = `Step ${index + 1} of ${totalSteps}`;
      }

      // Focus first input in new step
      const firstInput = panels[index].querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }

    // Next/Back buttons
    multiForm.querySelectorAll('[data-form-next]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate current step
        const currentPanel = panels[currentStep];
        const requiredFields = currentPanel.querySelectorAll('[required]');
        let valid = true;

        requiredFields.forEach((field) => {
          const group = field.closest('.form-group');
          if (!field.value.trim()) {
            valid = false;
            if (group) group.classList.add('form-group--error');
          } else {
            if (group) group.classList.remove('form-group--error');
          }
        });

        if (valid && currentStep < totalSteps - 1) {
          showStep(currentStep + 1);
        }
      });
    });

    multiForm.querySelectorAll('[data-form-back]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) {
          showStep(currentStep - 1);
        }
      });
    });

    // Form submission
    multiForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate final step
      const currentPanel = panels[currentStep];
      const requiredFields = currentPanel.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach((field) => {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          valid = false;
          if (group) group.classList.add('form-group--error');
        } else {
          if (group) group.classList.remove('form-group--error');
        }
      });

      if (valid) {
        // Redirect to thank you page
        window.location.href = 'thank-you.html';
      }
    });

    // Initialize first step
    showStep(0);

    // Live validation - clear error on input
    multiForm.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group) group.classList.remove('form-group--error');
      });
    });
  }

  /* -------------------------------------------------------------------
     PORTFOLIO FILTER BAR
     ------------------------------------------------------------------- */
  const filterBar = document.querySelector('.filter-bar');

  if (filterBar) {
    const chips = filterBar.querySelectorAll('.filter-chip');
    const grid = document.querySelector('.portfolio-grid');
    const items = grid ? grid.querySelectorAll('[data-category]') : [];
    const resultCount = document.querySelector('[data-filter-count]');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        // Update active chip
        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        const filter = chip.dataset.filter;
        let visibleCount = 0;

        items.forEach((item, index) => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';

          if (show) {
            visibleCount++;
            // Stagger animation
            if (!prefersReducedMotion) {
              item.style.opacity = '0';
              item.style.transform = 'translateY(16px)';
              setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, index * 60);
            }
          }
        });

        // Update result count (aria-live)
        if (resultCount) {
          resultCount.textContent = `${visibleCount} project${visibleCount !== 1 ? 's' : ''}`;
        }
      });
    });
  }

  /* -------------------------------------------------------------------
     CURSOR-FOLLOW PREVIEW (Desktop Only)
     ------------------------------------------------------------------- */
  if (window.innerWidth >= 1024 && !prefersReducedMotion) {
    const previewEl = document.querySelector('.cursor-preview');
    const previewImg = previewEl ? previewEl.querySelector('img') : null;
    const hoverTriggers = document.querySelectorAll('[data-preview]');

    if (previewEl && previewImg && hoverTriggers.length > 0) {
      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;
      let animating = false;

      function animatePreview() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        previewEl.style.transform = `translate(${currentX + 20}px, ${currentY - 175}px)`;

        if (animating) requestAnimationFrame(animatePreview);
      }

      hoverTriggers.forEach((trigger) => {
        trigger.addEventListener('mouseenter', () => {
          const imgSrc = trigger.dataset.preview;
          if (imgSrc) {
            previewImg.src = imgSrc;
            previewEl.classList.add('is-visible');
            animating = true;
            requestAnimationFrame(animatePreview);
          }
        });

        trigger.addEventListener('mouseleave', () => {
          previewEl.classList.remove('is-visible');
          animating = false;
        });

        trigger.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
        });
      });
    }
  }

  /* -------------------------------------------------------------------
     TESTIMONIAL CAROUSEL
     ------------------------------------------------------------------- */
  const carousels = document.querySelectorAll('.testimonial-carousel');

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.testimonial-carousel__track');
    const slides = carousel.querySelectorAll('.testimonial-carousel__slide');
    const dots = carousel.querySelectorAll('.testimonial-carousel__dot');
    let current = 0;
    let autoplayInterval = null;
    let isPaused = false;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      current = index;

      track.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
      });
    }

    // Dot navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    // Auto-advance (8s, pausable)
    function startAutoplay() {
      if (slides.length <= 1) return;
      autoplayInterval = setInterval(() => {
        if (!isPaused) goToSlide(current + 1);
      }, 8000);
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    // Keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Client testimonials');

    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(current - 1);
        isPaused = true;
      } else if (e.key === 'ArrowRight') {
        goToSlide(current + 1);
        isPaused = true;
      }
    });

    // Respect reduced motion
    if (!prefersReducedMotion) {
      startAutoplay();
    }
  });

  /* -------------------------------------------------------------------
     LIGHTBOX
     ------------------------------------------------------------------- */
  const lightbox = document.querySelector('.lightbox');

  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const lightboxPrev = lightbox.querySelector('.lightbox__nav--prev');
    const lightboxNext = lightbox.querySelector('.lightbox__nav--next');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const galleryItems = document.querySelectorAll('[data-lightbox]');
    let lightboxImages = [];
    let lightboxIndex = 0;

    // Collect images
    galleryItems.forEach((item, i) => {
      lightboxImages.push(item.dataset.lightbox || item.querySelector('img')?.src);

      item.addEventListener('click', (e) => {
        e.preventDefault();
        lightboxIndex = i;
        openLightbox();
      });
    });

    function openLightbox() {
      lightboxImg.src = lightboxImages[lightboxIndex];
      if (lightboxCounter) {
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
      }
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      // Return focus to trigger
      if (galleryItems[lightboxIndex]) galleryItems[lightboxIndex].focus();
    }

    function nextImage() {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      lightboxImg.src = lightboxImages[lightboxIndex];
      if (lightboxCounter) {
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
      }
    }

    function prevImage() {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      lightboxImg.src = lightboxImages[lightboxIndex];
      if (lightboxCounter) {
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
      }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
    if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

    // Click overlay to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }

  /* -------------------------------------------------------------------
     TABS
     ------------------------------------------------------------------- */
  const tabGroups = document.querySelectorAll('.tabs');

  tabGroups.forEach((tabGroup) => {
    const triggers = tabGroup.querySelectorAll('.tabs__trigger');
    const panels = document.querySelectorAll(
      triggers[0] ? `[data-tab-group="${tabGroup.dataset.tabGroup}"]` : '.tabs__panel'
    );

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const target = trigger.dataset.tab;

        // Update triggers
        triggers.forEach((t) => t.classList.remove('is-active'));
        trigger.classList.add('is-active');

        // Update panels
        const allPanels = tabGroup.parentElement.querySelectorAll('.tabs__panel');
        allPanels.forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.tab === target);
        });
      });
    });
  });

})();
