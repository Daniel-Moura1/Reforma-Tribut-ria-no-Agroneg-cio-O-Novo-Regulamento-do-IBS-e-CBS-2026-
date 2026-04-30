/* ============================================================
 * GUIA COMPLETO DO IBS E CBS — LANDING V2
 * Funcionalidades:
 *   - Countdown 24h (persistente via localStorage)
 *   - Reveal animations (Intersection Observer)
 *   - FAQ accordion
 *   - Sticky mobile bar (aparece após scroll)
 *   - Smooth scroll para anchors
 *   - Nav scrolled state
 * ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 1. COUNTDOWN — 24h persistente
  // ============================================================
  const COUNTDOWN_KEY = 'guia_ibs_cbs_offer_end';
  const cdH = document.getElementById('cdH');
  const cdM = document.getElementById('cdM');
  const cdS = document.getElementById('cdS');

  function initCountdown() {
    if (!cdH || !cdM || !cdS) return;

    let endTime;
    try {
      const stored = localStorage.getItem(COUNTDOWN_KEY);
      if (stored) endTime = parseInt(stored, 10);
    } catch (e) { /* localStorage indisponível */ }

    const now = Date.now();
    if (!endTime || endTime < now) {
      // 24h a partir de agora
      endTime = now + 24 * 60 * 60 * 1000;
      try { localStorage.setItem(COUNTDOWN_KEY, String(endTime)); } catch (e) {}
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function tick() {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        cdH.textContent = '00';
        cdM.textContent = '00';
        cdS.textContent = '00';
        // Reseta para próximas 24h
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        try { localStorage.setItem(COUNTDOWN_KEY, String(endTime)); } catch (e) {}
        return;
      }
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      cdH.textContent = pad(hours);
      cdM.textContent = pad(minutes);
      cdS.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  // ============================================================
  // 2. REVEAL ANIMATIONS — Intersection Observer
  // ============================================================
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback — mostra tudo
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    els.forEach(el => observer.observe(el));
  }

  // ============================================================
  // 3. FAQ ACCORDION
  // ============================================================
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });
    // Abre primeiro por padrão
    items[0]?.classList.add('open');
  }

  // ============================================================
  // 4. STICKY MOBILE BAR — aparece após scrollar 600px
  // ============================================================
  function initStickyMobile() {
    const bar = document.getElementById('stickyMobile');
    if (!bar) return;

    let lastShown = false;
    function update() {
      const shouldShow = window.scrollY > 600;
      if (shouldShow !== lastShown) {
        bar.classList.toggle('is-visible', shouldShow);
        lastShown = shouldShow;
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ============================================================
  // 5. NAV SCROLLED STATE
  // ============================================================
  function initNavScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    let lastState = false;
    function update() {
      const scrolled = window.scrollY > 80;
      if (scrolled !== lastState) {
        nav.classList.toggle('scrolled', scrolled);
        lastState = scrolled;
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ============================================================
  // 6. SMOOTH SCROLL para links internos (com offset do nav)
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('mainNav')?.offsetHeight || 80;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    initCountdown();
    initReveal();
    initFAQ();
    initStickyMobile();
    initNavScroll();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
