/**
 * KAV — Abertura imersiva: parallax de saída, pausa do vídeo fora da tela
 * e menu em tela cheia (três barrinhas) enquanto o menu real está escondido.
 */
(function () {
  'use strict';

  const section = document.getElementById('introSection');
  if (!section) return;

  const video = document.getElementById('introVideo');
  const content = document.getElementById('introContent');
  const cue = document.getElementById('introCue');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Vídeo: garante autoplay mudo e economiza CPU quando sai da tela -------------
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    const tryPlay = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    tryPlay();
    ['touchstart', 'pointerdown', 'scroll'].forEach((evt) =>
      window.addEventListener(evt, tryPlay, { passive: true, once: true }));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) tryPlay(); else video.pause();
        });
      }, { threshold: 0.05 }).observe(section);
    }
  }

  // --- Saída suave do conteúdo conforme o usuário começa a rolar -------------------
  if (!reduced) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, window.scrollY / vh));
      if (p >= 1) return;
      if (content) {
        content.style.opacity = String(Math.max(0, 1 - p * 1.7));
        content.style.transform = `translateY(${-p * 70}px) scale(${1 - p * 0.05})`;
      }
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 5));
      if (video) video.style.transform = `scale(${1 + p * 0.14})`;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  // --- Menu imersivo (três barrinhas) ----------------------------------------------
  const toggle = document.getElementById('immersiveToggle');
  const menu = document.getElementById('immersiveMenu');
  if (!toggle || !menu) return;

  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  // Sem travar o body: o overlay cobre a tela e engole a roda do mouse
  menu.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
  });
  menu.addEventListener('click', (e) => {
    if (e.target === menu || e.target.classList.contains('immersive-menu-inner')) setMenu(false);
  });

  // Se o menu real assumir o topo, fecha o imersivo
  new MutationObserver(() => {
    if (document.body.classList.contains('chrome-visible')) setMenu(false);
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
