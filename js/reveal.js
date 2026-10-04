/**
 * KAV — Revelações imersivas: os elementos sobem e aparecem (fade + translate + leve blur)
 * quando entram na tela, em sequência (stagger), casando com a linguagem da abertura.
 * Também conta os números dos cases e libera as barras do gráfico.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const STEP = 90; // ms entre irmãos

  // [seletor, variante, atraso base em ms]
  const GROUPS = [
    // Cabeçalhos de seção: etiqueta → título → descrição
    ['.section-header > *', '', 0],
    // Faixa de diferenciais
    ['.metrics-summary-bar .metric-card', '', 0],
    // O jeito Kav
    ['.hyperkav-text > *', '', 0],
    ['.hyperkav-grid > :not(.hyperkav-text)', 'block', 150],
    // WhatsApp
    ['.whatsapp-text > *', '', 0],
    ['.whatsapp-phone-wrapper', 'block', 200],
    ['.wa-benefit-card', '', 0],
    ['.faq-item', '', 0],
    // Cases: container sobe e, por dentro, cada item entra em sequência
    ['.case-showcase', 'block', 0],
    ['.cs-panel--blue > :not(.cs-stats), .cs-panel--dark > :not(.cs-stats)', '', 260],
    ['.cs-stat', '', 520],
    ['.cs-frame', '', 380],
    ['.cs-mock-card', '', 300],
    // Marcas e segmentos
    ['.brand-card', '', 0],
    ['.sector-card', '', 0],
    // Demais blocos
    ['.comparison-table-wrapper', 'block', 0],
    ['.calc-wrapper', 'block', 0],
    ['.team-card-wrapper', 'block', 0],
    ['.cta-card', 'block', 0],
    ['.footer-content > *', '', 0]
  ];

  document.documentElement.classList.add('rv-ready');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      // Pulou direto (menu/âncora/scroll rápido): o que ficou acima da tela aparece sem animação
      if (!entry.isIntersecting) {
        if (entry.boundingClientRect.bottom < 0) {
          io.unobserve(el);
          el.classList.remove('rv', 'rv-in', 'rv-block');
          el.style.removeProperty('--rv-d');
          el.setAttribute('data-seen', '');
          el.querySelectorAll('[data-count]').forEach(countUp);
          if (el.hasAttribute('data-count')) countUp(el);
        }
        return;
      }
      io.unobserve(el);
      el.classList.add('rv-in');
      el.setAttribute('data-seen', '');
      el.addEventListener('animationend', function done(e) {
        if (e.target !== el || e.animationName !== 'rvIn') return;
        el.removeEventListener('animationend', done);
        el.classList.remove('rv', 'rv-in', 'rv-block');
        el.style.removeProperty('--rv-d');
      });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const seen = new WeakSet();
  GROUPS.forEach(([selector, variant, base]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (seen.has(el) || el.closest('.hero-scroll-section')) return;
      seen.add(el);
      const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(selector));
      const idx = Math.min(siblings.indexOf(el), 6);
      el.classList.add('rv');
      if (variant) el.classList.add('rv-' + variant);
      el.style.setProperty('--rv-d', (base + idx * STEP) + 'ms');
      io.observe(el);
    });
  });

  // Cada número conta quando ELE entra na tela (não quando o container pai aparece)
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        if (entry.boundingClientRect.bottom < 0) { countIO.unobserve(entry.target); entry.target.textContent = entry.target.dataset.final; }
        return;
      }
      countIO.unobserve(entry.target);
      countUp(entry.target);
    });
  }, { threshold: 0.6 });

  // --- Contagem dos números (ex.: +716%, 3x, +7 mil, +1,6k) ------------------------
  const NUM_RE = /(\d+(?:[.,]\d+)?)/;

  document.querySelectorAll('.cs-num, .cs-mock-up').forEach((el) => {
    if (el.children.length || !NUM_RE.test(el.textContent)) return; // pula "2 → 6.5"
    const text = el.textContent;
    const m = text.match(NUM_RE);
    el.dataset.count = m[1];
    el.dataset.pre = text.slice(0, m.index);
    el.dataset.post = text.slice(m.index + m[1].length);
    el.dataset.final = text;
    el.textContent = el.dataset.pre + '0' + el.dataset.post;
    countIO.observe(el);
  });

  function countUp(el) {
    if (!el.dataset.final || el.dataset.counting) return;
    el.dataset.counting = '1';
    const raw = el.dataset.count;
    const comma = raw.includes(',');
    const target = parseFloat(raw.replace(',', '.'));
    const decimals = (raw.split(/[.,]/)[1] || '').length;
    const start = performance.now() + 350; // espera a subida do elemento
    const dur = 1500;
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - start) / dur));
      const eased = 1 - Math.pow(1 - t, 3);
      let v = (target * eased).toFixed(decimals);
      if (comma) v = v.replace('.', ',');
      el.textContent = el.dataset.pre + v + el.dataset.post;
      if (t < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.final;
    };
    requestAnimationFrame(tick);
  }
})();
