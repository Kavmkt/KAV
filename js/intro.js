/**
 * KAV — Abertura: autoplay do vídeo do planeta e menu em tela cheia (três barrinhas)
 * enquanto o menu real está escondido. O zoom/dissolve da abertura roda em hero-scroll.js.
 */
(function () {
  'use strict';

  const video = document.getElementById('introVideo');
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    const tryPlay = () => {
      const layer = document.getElementById('introSection');
      if (layer && layer.style.opacity === '0') return;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();
    ['touchstart', 'pointerdown', 'scroll'].forEach((evt) =>
      window.addEventListener(evt, tryPlay, { passive: true, once: true }));
  }

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
