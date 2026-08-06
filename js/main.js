/* ==========================================================================
   MIDTECH — interaction layer (vanilla JS, no build step, Bootstrap 5 safe)
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     1. Sticky header
  --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------------------
     2. Mobile drawer
  --------------------------------------------------------------------- */
  var hamburger = document.querySelector(".hamburger-btn");
  var drawer = document.querySelector(".mobile-drawer");
  var drawerClose = document.querySelector(".drawer-close");
  function openDrawer() { if (drawer) { drawer.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); document.body.style.overflow = ""; } }
  if (hamburger) hamburger.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.querySelectorAll("nav > a, .drawer-accordion-panel a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }

  /* ---------------------------------------------------------------------
     2b. Hero image slider — crossfades through 6 slides
  --------------------------------------------------------------------- */
  var heroSlides = document.querySelectorAll(".hero-slide-img");
  if (heroSlides.length) {
    var heroCurrent = 0;
    var heroH1 = document.querySelector('.hero-inner h1');
    var heroP = document.querySelector('.hero-subhead');
    function updateHeroCaptions(i) {
      var slide = heroSlides[i];
      if (!slide) return;
      var title = slide.getAttribute('data-title') || slide.getAttribute('alt') || '';
      var subtitle = slide.getAttribute('data-subtitle') || '';
      if (heroH1) heroH1.textContent = title;
      if (heroP) heroP.textContent = subtitle;
    }

    // set initial captions
    updateHeroCaptions(heroCurrent);

    if (heroSlides.length > 1 && !reduceMotion) {
      setInterval(function () {
        heroSlides[heroCurrent].classList.remove("active");
        heroCurrent = (heroCurrent + 1) % heroSlides.length;
        heroSlides[heroCurrent].classList.add("active");
        updateHeroCaptions(heroCurrent);
      }, 4500);
    }
  }

  /* ---------------------------------------------------------------------
     3. Mega menu (desktop hover / touch toggle)
  --------------------------------------------------------------------- */
  document.querySelectorAll(".has-mega > a").forEach(function (trigger) {
    var parent = trigger.closest(".has-mega");
    trigger.addEventListener("click", function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        document.querySelectorAll(".has-mega.mega-open").forEach(function (openItem) {
          if (openItem !== parent) openItem.classList.remove("mega-open");
        });
        parent.classList.toggle("mega-open");
      }
    });
  });

  /* ---------------------------------------------------------------------
     4. Mobile drawer accordions (Services / Gallery)
  --------------------------------------------------------------------- */
  document.querySelectorAll(".drawer-accordion-btn").forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener("click", function () {
      var isOpen = btn.classList.contains("open");
      document.querySelectorAll(".drawer-accordion-btn.open").forEach(function (openBtn) {
        if (openBtn !== btn) {
          openBtn.classList.remove("open");
          openBtn.nextElementSibling.style.maxHeight = null;
        }
      });
      if (isOpen) {
        btn.classList.remove("open");
        panel.style.maxHeight = null;
      } else {
        btn.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------------------------------------------------------------------
     5. Services — filter UI removed; all cards are shown directly
  --------------------------------------------------------------------- */
  var miniCards = document.querySelectorAll(".service-mini-wrap");
  var stickyHeader = document.querySelector(".site-header");
  var peekGap = 15; // px of the previous card left visible
  var headerOffset = (stickyHeader ? stickyHeader.offsetHeight : 72) + 16;

  miniCards.forEach(function (c, index) {
    requestAnimationFrame(function () { c.classList.add("is-visible"); });
    c.style.setProperty("--i", index + 1);
  });

  /* ---------------------------------------------------------------------
     7. Gallery — Photo / Video tab switch
  --------------------------------------------------------------------- */
  var galleryTabs = document.querySelectorAll(".gallery-tab");
  galleryTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      galleryTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = tab.getAttribute("data-gallery");
      document.querySelectorAll(".gallery-pane").forEach(function (pane) {
        pane.classList.toggle("active", pane.id === "gallery-" + target);
      });
    });
  });

  /* ---------------------------------------------------------------------
     8. Portfolio filter (Photo Gallery)
  --------------------------------------------------------------------- */
  var pFilters = document.querySelectorAll(".portfolio-filter-btn");
  var pItems = document.querySelectorAll(".portfolio-item");
  pFilters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      pFilters.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      pItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  /* ---------------------------------------------------------------------
     9. Count-up stats on scroll into view
  --------------------------------------------------------------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------------
     10. Scroll reveal (direction-aware, staggered) via IntersectionObserver
  --------------------------------------------------------------------- */
  var revealGroups = {};
  document.querySelectorAll(".reveal").forEach(function (el) {
    var group = el.getAttribute("data-reveal-group") || "default";
    revealGroups[group] = revealGroups[group] || 0;
    var indexInGroup = revealGroups[group]++;
    el.style.transitionDelay = reduceMotion ? "0ms" : (indexInGroup * 60) + "ms";
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        if (entry.target.classList.contains("stat-number")) animateCount(entry.target);
        if (entry.target.classList.contains("process-line-svg")) entry.target.classList.add("drawn");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal, .stat-number, .process-line-svg").forEach(function (el) { io.observe(el); });

  /* ---------------------------------------------------------------------
     11. Testimonial carousel
  --------------------------------------------------------------------- */
  var testiWrap = document.querySelector(".testi-wrap");
  if (testiWrap) {
    var slides = testiWrap.querySelectorAll(".testi-slide");
    var dots = testiWrap.querySelectorAll(".testi-dot");
    var current = 0;
    var timer;
    function showSlide(i) {
      slides.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle("active", idx === i); });
      current = i;
    }
    function nextSlide() { showSlide((current + 1) % slides.length); }
    function startAutoplay() { if (reduceMotion) return; timer = setInterval(nextSlide, 5500); }
    function stopAutoplay() { clearInterval(timer); }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { showSlide(i); stopAutoplay(); startAutoplay(); });
    });
    testiWrap.addEventListener("mouseenter", stopAutoplay);
    testiWrap.addEventListener("mouseleave", startAutoplay);

    var touchStartX = 0;
    testiWrap.addEventListener("touchstart", function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    testiWrap.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? showSlide((current + 1) % slides.length) : showSlide((current - 1 + slides.length) % slides.length);
        stopAutoplay(); startAutoplay();
      }
    }, { passive: true });

    showSlide(0);
    startAutoplay();
  }

  /* ---------------------------------------------------------------------
     12. Industries — tap-to-flip on touch devices
  --------------------------------------------------------------------- */
  document.querySelectorAll(".industry-card").forEach(function (card) {
    card.addEventListener("click", function () {
      if (window.matchMedia("(hover: none)").matches) card.classList.toggle("flipped");
    });
  });

  /* ---------------------------------------------------------------------
     13. FAQ accordion
  --------------------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------------------------------------------------------------------
     14. Before / after slider
  --------------------------------------------------------------------- */
  document.querySelectorAll(".ba-slider").forEach(function (slider) {
    var after = slider.querySelector(".ba-after");
    var handle = slider.querySelector(".ba-handle");
    var dragging = false;
    function setPosition(clientX) {
      var rect = slider.getBoundingClientRect();
      var pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      after.style.clipPath = "inset(0 " + (100 - pct * 100) + "% 0 0)";
      handle.style.left = (pct * 100) + "%";
    }
    handle.addEventListener("mousedown", function () { dragging = true; });
    window.addEventListener("mouseup", function () { dragging = false; });
    window.addEventListener("mousemove", function (e) { if (dragging) setPosition(e.clientX); });
    handle.addEventListener("touchstart", function () { dragging = true; }, { passive: true });
    window.addEventListener("touchend", function () { dragging = false; });
    slider.addEventListener("touchmove", function (e) { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener("click", function (e) { if (e.target === handle) return; setPosition(e.clientX); });
  });

  /* ---------------------------------------------------------------------
     15. Slow-connection hero fallback
  --------------------------------------------------------------------- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo) {
    var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    var isSlow = (conn && (conn.saveData || /2g/.test(conn.effectiveType)));
    if (isSlow) heroVideo.parentNode.removeChild(heroVideo);
  }

  /* ---------------------------------------------------------------------
     16. Quote request modal
  --------------------------------------------------------------------- */
  var quoteOverlay = document.getElementById("quoteModalOverlay");
  var quoteForm = document.getElementById("quoteForm");
  var quoteSuccess = document.getElementById("quoteSuccess");
  var quoteCloseBtn = document.getElementById("quoteModalClose");
  var quoteLastFocused = null;

  function openQuoteModal(e) {
    if (e) e.preventDefault();
    if (!quoteOverlay) return;
    quoteLastFocused = document.activeElement;
    quoteOverlay.classList.add("open");
    document.body.classList.add("quote-modal-locked");
    var firstField = quoteForm ? quoteForm.querySelector("input, select, textarea") : null;
    if (firstField) setTimeout(function () { firstField.focus(); }, 250);
  }

  function closeQuoteModal() {
    if (!quoteOverlay) return;
    quoteOverlay.classList.remove("open");
    document.body.classList.remove("quote-modal-locked");
    if (quoteForm) { quoteForm.style.display = ""; quoteForm.reset(); }
    if (quoteSuccess) quoteSuccess.classList.remove("show");
    if (quoteLastFocused) quoteLastFocused.focus();
  }

  document.querySelectorAll(".js-quote-trigger").forEach(function (btn) {
    btn.addEventListener("click", openQuoteModal);
  });

  if (quoteCloseBtn) quoteCloseBtn.addEventListener("click", closeQuoteModal);

  if (quoteOverlay) {
    quoteOverlay.addEventListener("click", function (e) {
      if (e.target === quoteOverlay) closeQuoteModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && quoteOverlay && quoteOverlay.classList.contains("open")) closeQuoteModal();
  });

  var quoteSuccessCloseBtn = document.querySelector(".quote-success-close");
  if (quoteSuccessCloseBtn) quoteSuccessCloseBtn.addEventListener("click", closeQuoteModal);

  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var required = quoteForm.querySelectorAll("[required]");
      var valid = true;
      required.forEach(function (field) {
        field.classList.add("touched");
        if (!field.value.trim()) valid = false;
      });
      if (!valid) return;

      var submitBtn = quoteForm.querySelector(".quote-submit-btn");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending..."; }

      // TODO: replace this timeout with a real fetch() call to your backend/API endpoint
      setTimeout(function () {
        quoteForm.style.display = "none";
        if (quoteSuccess) quoteSuccess.classList.add("show");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Request"; }
      }, 700);
    });
  }
  
})();
