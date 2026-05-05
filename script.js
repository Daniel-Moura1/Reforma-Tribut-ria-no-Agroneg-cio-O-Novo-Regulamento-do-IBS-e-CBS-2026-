(function () {
  'use strict';

  // ── COUNTDOWN 24h (persistente) ──────────────────────────────
  const COUNTDOWN_KEY = 'guia_ibs_cbs_offer_end';

  function initCountdown() {
    const cdH = document.getElementById('cdH');
    const cdM = document.getElementById('cdM');
    const cdS = document.getElementById('cdS');
    if (!cdH || !cdM || !cdS) return;

    let endTime;
    try {
      const stored = localStorage.getItem(COUNTDOWN_KEY);
      if (stored) endTime = parseInt(stored, 10);
    } catch (_) {}

    const now = Date.now();
    if (!endTime || endTime < now) {
      endTime = now + 24 * 60 * 60 * 1000;
      try { localStorage.setItem(COUNTDOWN_KEY, String(endTime)); } catch (_) {}
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        try { localStorage.setItem(COUNTDOWN_KEY, String(endTime)); } catch (_) {}
        return;
      }
      const total = Math.floor(remaining / 1000);
      cdH.textContent = pad(Math.floor(total / 3600));
      cdM.textContent = pad(Math.floor((total % 3600) / 60));
      cdS.textContent = pad(total % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  // ── REVEAL ANIMATIONS ────────────────────────────────────────
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    els.forEach(el => observer.observe(el));
  }

  // ── FAQ ACCORDION ─────────────────────────────────────────────
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');

    function toggle(item) {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        const q = item.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'true');
      }
    }

    items.forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => toggle(item));
      q.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(item); }
      });
    });
  }

  // ── STICKY MOBILE BAR ─────────────────────────────────────────
  function initStickyMobile() {
    const bar = document.getElementById('stickyMobile');
    if (!bar) return;

    let visible = false;
    function update() {
      const should = window.scrollY > 300;
      if (should !== visible) {
        bar.classList.toggle('is-visible', should);
        bar.setAttribute('aria-hidden', String(!should));
        visible = should;
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── NAV SCROLLED STATE ────────────────────────────────────────
  function initNavScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    let scrolled = false;
    function update() {
      const should = window.scrollY > 80;
      if (should !== scrolled) {
        nav.classList.toggle('scrolled', should);
        scrolled = should;
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── SCROLL PROGRESS BAR ───────────────────────────────────────
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = pct.toFixed(1) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  // ── SMOOTH SCROLL ─────────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('mainNav')?.offsetHeight || 64;
        const y    = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  // ── PROBLEMA ACCORDION (mobile only) ─────────────────────────
  function initProblemaAccordion() {
    const cards = document.querySelectorAll('.problema-card');
    if (!cards.length) return;

    const mq = window.matchMedia('(max-width: 768px)');

    function toggle(card) {
      if (!mq.matches) return;
      const isOpen = card.classList.contains('is-open');
      cards.forEach(c => {
        c.classList.remove('is-open');
        c.querySelector('h3')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        card.classList.add('is-open');
        card.querySelector('h3')?.setAttribute('aria-expanded', 'true');
      }
    }

    cards.forEach(card => {
      const h3 = card.querySelector('h3');
      if (!h3) return;

      card.addEventListener('click', () => toggle(card));
      h3.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(card); }
      });
    });

    // Ao voltar para desktop: limpa estados e restaura tabindex
    mq.addEventListener('change', e => {
      cards.forEach(c => {
        c.classList.remove('is-open');
        const h3 = c.querySelector('h3');
        if (h3) {
          h3.removeAttribute('aria-expanded');
          h3.setAttribute('tabindex', e.matches ? '0' : '-1');
        }
      });
    });

    // Define tabindex inicial correto
    const isMobile = mq.matches;
    cards.forEach(c => {
      c.querySelector('h3')?.setAttribute('tabindex', isMobile ? '0' : '-1');
    });
  }

  // ── RIPPLE NO CLIQUE ──────────────────────────────────────────
  function initRipple() {
    const style = document.createElement('style');
    style.textContent = '@keyframes ripple-anim{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(style);

    document.querySelectorAll('.btn-primary, .btn-oferta, .sm-cta').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect   = this.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement('span');
        ripple.style.cssText = [
          'position:absolute', 'border-radius:50%', 'pointer-events:none',
          'width:' + size + 'px', 'height:' + size + 'px',
          'left:' + (e.clientX - rect.left - size / 2) + 'px',
          'top:'  + (e.clientY - rect.top  - size / 2) + 'px',
          'background:rgba(255,255,255,.18)', 'transform:scale(0)',
          'animation:ripple-anim .55s ease forwards'
        ].join(';');
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    initCountdown();
    initReveal();
    initFAQ();
    initProblemaAccordion();
    initStickyMobile();
    initNavScroll();
    initScrollProgress();
    initSmoothScroll();
    initRipple();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
