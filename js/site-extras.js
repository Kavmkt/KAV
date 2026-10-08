/* Aviso de cookies (LGPD), carregamento condicional de GTM/Pixel e barra fixa de WhatsApp.
 * IDs de medição: preencha abaixo quando existirem. Vazio = nada é carregado.
 * Os scripts só carregam depois do "Aceitar". */
(function () {
  var TRACKING = { gtm: '', pixel: '' };      // ex.: gtm: 'GTM-XXXXXXX', pixel: '1234567890'
  var KEY = 'kav_cookie_consent';
  var WA = 'https://wa.me/5511966405634?text=Oi!%20Vim%20pelo%20site%20da%20Kav%20e%20quero%20conversar%20sobre%20o%20meu%20neg%C3%B3cio.';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadTracking() {
    if (window.__kavTracking) return; window.__kavTracking = true;
    window.dataLayer = window.dataLayer || [];
    if (TRACKING.gtm) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(TRACKING.gtm);
      document.head.appendChild(s);
    }
    if (TRACKING.pixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', TRACKING.pixel); window.fbq('track', 'PageView');
    }
  }

  function showBar() {
    if (document.getElementById('ck-bar')) return;
    var d = document.createElement('div'); d.id = 'ck-bar'; d.className = 'ck-bar'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML = 'Usamos cookies de medição para entender quais anúncios trazem clientes. Eles só são ativados se você aceitar. <a href="/politica-de-privacidade/">Política de privacidade</a>' +
      '<div class="ck-actions"><button type="button" class="ck-accept">Aceitar</button><button type="button" class="ck-deny">Recusar</button></div>';
    document.body.appendChild(d); document.body.classList.add('has-cookie-bar');
    function close(v) { set(v); d.remove(); document.body.classList.remove('has-cookie-bar'); if (v === 'granted') loadTracking(); }
    d.querySelector('.ck-accept').onclick = function () { close('granted'); };
    d.querySelector('.ck-deny').onclick = function () { close('denied'); };
  }

  var c = get();
  if (c === 'granted') loadTracking(); else if (!c) showBar();

  // "Gerenciar cookies" no rodapé
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-manage]');
    if (t) { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (x) {} showBar(); }
  });

  // Barra fixa de WhatsApp (só aparece no celular, via CSS)
  var bar = document.createElement('a');
  bar.className = 'wa-bar'; bar.href = WA; bar.target = '_blank'; bar.rel = 'noopener noreferrer';
  bar.textContent = 'Falar no WhatsApp';
  bar.addEventListener('click', function () { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'whatsapp_click', origem: 'barra_fixa' }); if (typeof window.fbq === 'function') window.fbq('track', 'Contact'); });
  document.body.appendChild(bar);
  var isHome = document.body.classList.contains('hero-scroll-page') || !!document.getElementById('introSection');
  function toggle() {
    var show = isHome ? document.body.classList.contains('chrome-visible') : window.scrollY > 500;
    // some perto do formulário para não cobrir os campos
    var f = document.getElementById('analise');
    if (show && f) { var r = f.getBoundingClientRect(); if (r.top < window.innerHeight * 0.8 && r.bottom > 0) show = false; }
    bar.classList.toggle('show', show);
  }
  window.addEventListener('scroll', toggle, { passive: true }); toggle();
})();
