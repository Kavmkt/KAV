/**
 * ============================================================================
 * KAV — HERO EM ETAPAS TRAVADAS (v6)
 * ============================================================================
 * Problema do modelo anterior: o vídeo era "pulado" (seek) a cada pixel de scroll,
 * o que trava (frames congelados, principalmente no celular), e o scroll livre deixava
 * o visitante passar dos textos rápido demais e se perder ao voltar.
 *
 * Modelo atual:
 *  - A jornada é uma lista de ETAPAS (`stages`), cada uma com um texto e um ponto do vídeo.
 *  - Um gesto (roda do mouse, deslize, tecla, ponto lateral) avança UMA etapa por vez.
 *    O scroll "trava" de verdade em cada texto e não dá para pular nem se perder.
 *  - Entre etapas o vídeo TOCA de verdade (reprodução nativa, sem seek) em velocidade
 *    controlada, desacelerando ao chegar. Em cada texto ele segue em câmera lenta.
 *  - Voltar usa um único seek, escondido por um "rebobinar" visual de 0,3s.
 *  - A posição real do scroll acompanha a etapa (menu, âncoras e botão voltar funcionam).
 *  - Ao fim da última etapa o scroll é liberado para o resto do site.
 *  - prefers-reduced-motion: tudo vira conteúdo estático.
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    legacySrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    fallbackDuration: 28,
    introMs: 2400,        // planeta → primeiro texto (dissolução + vídeo tocando)
    stepMs: 1500,         // duração mínima de uma etapa para a seguinte
    maxMs: 4200,          // teto (pulos de várias etapas pelos pontos laterais)
    maxRate: 2.4,         // velocidade máxima do vídeo entre etapas (desktop)
    mobileMaxRate: 2,     // idem no celular
    backMs: 900,          // voltar uma etapa
    holdRate: 0.3,        // câmera lenta enquanto o texto está na tela
    holdMaxSeconds: 1.6   // quanto o vídeo pode avançar em câmera lenta após chegar
  },

  // Cada etapa: id do texto (data-step-id) e o tempo do vídeo (s) em que ela fica.
  // Trocou o vídeo? Ajuste só os `time` (e adicione/remova etapas aqui e no HTML).
  stages: [
    { id: 'intro',            step: null,               time: 0 },
    { id: 'entender',         step: 'step-entender',    time: 5.6 },
    { id: 'encontrado',       step: 'step-encontrado',  time: 8.6 },
    { id: 'acompanhado',      step: 'step-acompanhado', time: 11.8 },
    { id: 'hyperkav',         step: 'step-hyperkav',    time: 15.3 },
    { id: 'atendimento',      step: 'step-atendimento', time: 18.8 },
    { id: 'prova',            step: 'step-prova',       time: 22.3 },
    { id: 'final',            step: 'step-final',       time: 26.0 }
  ]
};

class KavHeroStages {
  constructor(config = HERO_SCROLL_CONFIG) {
    this.cfg = config;
    this.section = document.getElementById('heroScrollSection');
    if (!this.section) return;

    this.debug = new URLSearchParams(window.location.search).get('debug') === 'true';
    this.stages = config.stages;
    this.N = this.stages.length;
    this.LAST = this.N - 1;

    this.video = document.getElementById('heroScrollVideo');
    this.canvas = this.section.querySelector('.hero-fallback-canvas');
    this.mediaWrap = this.section.querySelector('.hero-media-wrapper');
    this.viewport = this.section.querySelector('.hero-sticky-viewport');
    this.textSteps = this.section.querySelectorAll('.hero-story-step');
    this.introLayer = document.getElementById('introSection');
    this.introVideo = document.getElementById('introVideo');
    this.introContent = document.getElementById('introContent');
    this.introCue = document.getElementById('introCue');

    this.stage = 0;             // etapa lógica atual (já é o destino durante uma transição)
    this.mode = 'stage';        // 'stage' = travado nas etapas | 'free' = scroll liberado (resto do site)
    this.busy = false;          // transição em andamento
    this.animating = false;     // animação de scroll programática em andamento
    this.tr = null;             // transição ativa
    this.cooldownUntil = 0;
    this.lastWheelAt = 0;
    this.lastWheelAbs = 0;
    this.playTarget = null;     // tempo-alvo do vídeo durante uma transição "tocar"
    this.playBase = 1;
    this.holdOn = false;        // câmera lenta ativa
    this.videoDuration = config.video.fallbackDuration;
    this.useCanvasFallback = false;
    this.isReducedMotion = false;
    this.visualP = 0;           // progresso visual (0..1) usado só pelo canvas de fallback
    this.introP = 0;
    this.introAnim = null;
    this.introHidden = false;
    this.isCoarse = window.matchMedia('(pointer: coarse)').matches;

    this.init();
  }

  log(...a) { if (this.debug) console.log('[KavHero]', ...a); }

  // ---------------------------------------------------------------- helpers
  get vh() { return window.innerHeight; }
  sectionTop() { return this.section.getBoundingClientRect().top + window.scrollY; }
  anchor(i) { return this.sectionTop() + i * this.vh; }
  timeOf(i) { return this.stages[i].time; }
  // Etapa mais próxima de uma posição de scroll (robusto a viewport ainda sem tamanho)
  stageAt(y) {
    const raw = (y - this.sectionTop()) / this.vh;
    if (!isFinite(raw)) return 0;
    return Math.max(0, Math.min(this.LAST, Math.round(raw)));
  }
  menuOpen() { const m = document.getElementById('immersiveMenu'); return !!(m && m.classList.contains('open')); }
  maxRate() { return window.innerWidth <= 768 ? this.cfg.video.mobileMaxRate : this.cfg.video.maxRate; }

  // ---------------------------------------------------------------- init
  init() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mq.matches;
    if (this.isReducedMotion) {
      this.section.classList.add('reduced-motion-mode');
      document.body.classList.add('chrome-visible');
      return;
    }

    if (!this.vh) {
      // Aba aberta em segundo plano / janela ainda sem tamanho: espera ter dimensões
      const wait = () => { if (this.vh) { window.removeEventListener('resize', wait); this.start(); } };
      window.addEventListener('resize', wait);
      return;
    }
    this.start();
  }

  start() {
    this.applySectionHeight();
    this.buildUI();
    this.setupVideo();
    this.setupInput();
    this.setLocked(true);
    this.syncFromScroll(true);
    this.startLoop();
  }

  applySectionHeight() {
    this.section.style.height = `${this.N * this.vh}px`;
  }

  setLocked(on) {
    document.body.classList.toggle('hero-locked', on);
    // Dentro do hero o scroll é nosso (instantâneo); fora dele volta o suave do site
    document.documentElement.style.scrollBehavior = on ? 'auto' : '';
  }

  // ---------------------------------------------------------------- UI (pontos + dica)
  buildUI() {
    const dots = document.createElement('nav');
    dots.className = 'stage-dots';
    dots.setAttribute('aria-label', 'Passos da jornada');
    this.dotBtns = this.stages.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'stage-dot';
      b.setAttribute('aria-label', i === 0 ? 'Início' : `Ir para o passo ${i}`);
      b.addEventListener('click', () => { if (this.mode === 'stage' && !this.busy && i !== this.stage) this.goTo(i); });
      dots.appendChild(b);
      return b;
    });
    this.viewport.appendChild(dots);

    const cue = document.createElement('div');
    cue.className = 'stage-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = `<span>${this.isCoarse ? 'Deslize para continuar' : 'Role para continuar'}</span>` +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    this.viewport.appendChild(cue);
    this.cue = cue;
    this.updateDots();
  }

  updateDots() {
    if (!this.dotBtns) return;
    this.dotBtns.forEach((b, i) => {
      b.classList.toggle('active', i === this.stage);
      b.classList.toggle('done', i < this.stage);
    });
  }

  armCue() {
    clearTimeout(this.cueTimer);
    this.cue.classList.remove('show');
    if (this.stage === 0 || this.stage === this.LAST || this.mode !== 'stage') return;
    this.cueTimer = setTimeout(() => this.cue.classList.add('show'), 3500);
  }

  // ---------------------------------------------------------------- vídeo
  setupVideo() {
    const v = this.video;
    if (!v) return;
    v.defaultMuted = true;
    v.muted = true;
    v.playsInline = true;
    v.loop = false;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.disablePictureInPicture = true;
    if (!v.src) v.src = this.cfg.video.legacySrc;

    const onMeta = () => {
      if (v.duration && !isNaN(v.duration) && v.duration > 0) this.videoDuration = v.duration;
    };
    ['loadedmetadata', 'loadeddata', 'canplay'].forEach((e) => v.addEventListener(e, onMeta));
    if (v.readyState >= 1) onMeta();

    v.addEventListener('error', () => {
      this.log('Falha no vídeo, usando canvas');
      this.activateFallbackMode();
    });

    // Destrava reprodução programática no iOS/Android no primeiro gesto
    const unlock = () => {
      const p = v.play();
      if (p && p.then) p.then(() => { if (this.playTarget === null && !this.holdOn) v.pause(); }).catch(() => {});
      ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach((e) => window.removeEventListener(e, unlock));
    };
    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach((e) =>
      window.addEventListener(e, unlock, { passive: true, once: true }));
  }

  activateFallbackMode() {
    this.useCanvasFallback = true;
    if (this.video) this.video.style.display = 'none';
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.initProceduralFallback();
    }
  }

  seekTo(t) {
    const v = this.video;
    if (!v || this.useCanvasFallback) return;
    this.playTarget = null;
    this.holdOn = false;
    try { v.pause(); } catch (e) {}
    try { v.currentTime = Math.max(0, Math.min(this.videoDuration - 0.05, t)); } catch (e) {}
  }

  playTo(t, ms) {
    const v = this.video;
    if (!v || this.useCanvasFallback) return false;
    const dist = t - v.currentTime;
    if (dist <= 0.05) { this.seekTo(t); return false; }
    this.holdOn = false;
    this.playTarget = t;
    // 1.25x compensa a desaceleração no fim, para chegar perto do tempo planejado
    this.playBase = Math.max(0.6, Math.min(this.maxRate(), (dist / (ms / 1000)) * 1.25));
    v.playbackRate = this.playBase;
    const p = v.play();
    if (p && p.catch) p.catch(() => { this.playTarget = null; this.seekTo(t); });
    return true;
  }

  // ---------------------------------------------------------------- entrada (gestos)
  setupInput() {
    window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    window.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onResize(), { passive: true });
  }

  onWheel(e) {
    if (this.mode !== 'stage' || this.menuOpen() || e.ctrlKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();

    const now = performance.now();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    const abs = Math.abs(d);
    // Um "gesto novo" começa após uma pausa, ou quando o impulso volta a crescer
    // (ignora a cauda de inércia do trackpad, que gerava saltos de várias etapas)
    const fresh = now - this.lastWheelAt > 160 || (abs > this.lastWheelAbs * 1.6 && abs > 25);
    this.lastWheelAt = now;
    this.lastWheelAbs = abs;

    if (this.busy || now < this.cooldownUntil || !fresh || abs < 6) return;
    this.intent(d > 0 ? 1 : -1);
  }

  onKey(e) {
    if (this.mode !== 'stage' || this.menuOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    let dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') dir = 1;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
    else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') dir = e.shiftKey ? -1 : 1;
    else if (e.key === 'Home') { e.preventDefault(); if (!this.busy && this.stage !== 0) this.goTo(0); return; }
    if (!dir) return;
    e.preventDefault();
    if (!this.busy && performance.now() >= this.cooldownUntil) this.intent(dir);
  }

  onTouchStart(e) {
    if (this.mode !== 'stage' || this.menuOpen() || e.touches.length !== 1) { this.touch = null; return; }
    const t = e.touches[0];
    this.touch = { y0: t.clientY, y: t.clientY, t0: performance.now() };
  }

  onTouchMove(e) {
    if (!this.touch || this.mode !== 'stage' || this.menuOpen()) return;
    if (e.cancelable) e.preventDefault();
    this.touch.y = e.touches[0].clientY;
  }

  onTouchEnd() {
    const t = this.touch;
    this.touch = null;
    if (!t || this.mode !== 'stage' || this.busy || performance.now() < this.cooldownUntil) return;
    const dy = t.y0 - t.y;
    const dt = Math.max(1, performance.now() - t.t0);
    if (Math.abs(dy) > 38 || (Math.abs(dy) > 16 && Math.abs(dy) / dt > 0.35)) this.intent(dy > 0 ? 1 : -1);
  }

  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.applySectionHeight();
      if (this.mode === 'stage' && !this.busy) this.jumpScroll(this.anchor(this.stage));
    }, 120);
  }

  // Scroll que não veio de nós (barra de rolagem, âncora do menu, voltar do navegador…)
  onScroll() {
    if (this.animating || this.busy) return;
    const y = window.scrollY;
    const lastA = this.anchor(this.LAST);

    if (this.mode === 'free') {
      if (y < lastA - 2) this.reenter(this.stageAt(y));
      return;
    }
    if (y > lastA + 6) {
      this.mode = 'free';
      this.setLocked(false);
      this.stage = this.LAST;
      this.pauseHold();
      this.showStep(this.LAST);
      this.setChrome(true);
      return;
    }
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.settle(), 180);
  }

  settle() {
    if (this.busy || this.animating || this.mode !== 'stage') return;
    const idx = this.stageAt(window.scrollY);
    if (idx === this.stage) {
      if (Math.abs(window.scrollY - this.anchor(idx)) > 2) this.animateScroll(this.anchor(idx), 280);
    } else {
      this.goTo(idx);
    }
  }

  // Posição inicial / recarga no meio da página
  syncFromScroll(initial) {
    const y = window.scrollY;
    const lastA = this.anchor(this.LAST);
    if (y > lastA + 6) {
      this.mode = 'free';
      this.setLocked(false);
      this.stage = this.LAST;
      this.setStageInstant(this.LAST);
      return;
    }
    const idx = this.stageAt(y);
    this.stage = idx;
    this.setStageInstant(idx);
    this.jumpScroll(this.anchor(idx));
  }

  setStageInstant(i) {
    this.stage = i;
    this.introP = i === 0 ? 0 : 1;
    this.updateIntro(this.introP);
    this.updateDots();
    this.setChrome(i === this.LAST || this.mode === 'free');
    const apply = () => {
      this.seekTo(this.timeOf(i));
      this.showStep(i);
      if (i > 0) this.startHold();
    };
    if (this.video && this.video.readyState < 1) {
      this.video.addEventListener('loadedmetadata', apply, { once: true });
      this.showStep(i);
    } else {
      apply();
    }
    this.armCue();
  }

  // Voltou para dentro do hero (rolando para cima ou pelo link "Início"): trava na etapa mais próxima
  reenter(idx) {
    this.mode = 'stage';
    this.setLocked(true);
    this.stage = idx;
    this.jumpScroll(this.anchor(idx));
    this.setStageInstant(idx);
  }

  // ---------------------------------------------------------------- navegação
  intent(dir) {
    const target = this.stage + dir;
    if (target < 0) return;
    if (target > this.LAST) { this.exitToSite(); return; }
    this.goTo(target);
  }

  exitToSite() {
    this.busy = true;
    this.pauseHold();
    this.animateScroll(this.anchor(this.LAST) + this.vh, 900, () => {
      this.mode = 'free';
      this.busy = false;
      this.setLocked(false);
    });
  }

  goTo(target) {
    if (this.busy || target === this.stage) return;
    const from = this.stage;
    const forward = target > from;
    const v = this.cfg.video;
    const T = this.timeOf(target);
    const cur = this.video && !this.useCanvasFallback ? this.video.currentTime : this.timeOf(from);

    let ms;
    if (!forward) ms = v.backMs;
    else if (from === 0) ms = v.introMs;
    else ms = Math.min(v.maxMs, Math.max(v.stepMs, ((T - cur) / this.maxRate()) * 1000 * 1.15));
    if (from === 0 && forward) ms = Math.max(ms, ((T - cur) / this.maxRate()) * 1000 * 1.15);
    ms = Math.min(v.maxMs, ms);

    this.busy = true;
    this.stage = target;
    this.pauseHold();
    this.hideSteps();
    clearTimeout(this.cueTimer);
    this.cue.classList.remove('show');
    this.updateDots();
    if (from === this.LAST) this.setChrome(false);

    this.tr = { to: target, from, ms, start: performance.now(), shown: false, kind: forward ? 'play' : 'seek' };

    // Scroll real acompanha a etapa (menu, âncoras e voltar do navegador continuam coerentes)
    this.animateScroll(this.anchor(target), ms);

    // Abertura (planeta): dissolve junto
    if (from === 0 && forward) this.animateIntro(0, 1, ms);
    else if (target === 0) this.animateIntro(1, 0, ms);

    if (forward) {
      if (!this.playTo(T, ms)) { /* sem vídeo: só texto/transição */ }
    } else {
      this.mediaWrap && this.mediaWrap.classList.add('rewinding');
      this.seekTo(T);
      setTimeout(() => this.mediaWrap && this.mediaWrap.classList.remove('rewinding'), Math.min(450, ms * 0.5));
    }

    // Trava de segurança: nunca fica preso numa transição
    clearTimeout(this.safetyTimer);
    this.safetyTimer = setTimeout(() => this.finish(), ms * 1.7 + 400);
  }

  finish() {
    const tr = this.tr;
    if (!tr) return;
    clearTimeout(this.safetyTimer);
    this.tr = null;
    this.busy = false;
    this.cooldownUntil = performance.now() + 260;

    const T = this.timeOf(tr.to);
    if (this.video && !this.useCanvasFallback) {
      if (this.playTarget !== null) { this.video.pause(); this.playTarget = null; }
      if (Math.abs(this.video.currentTime - T) > 0.3) this.seekTo(T);
    }
    this.introP = tr.to === 0 ? 0 : 1;
    this.updateIntro(this.introP);
    this.jumpScroll(this.anchor(tr.to));
    if (!tr.shown) this.showStep(tr.to);
    this.setChrome(tr.to === this.LAST);
    if (tr.to > 0) this.startHold();
    this.armCue();
  }

  // ---------------------------------------------------------------- texto, chrome, câmera lenta
  hideSteps() { this.textSteps.forEach((el) => el.classList.remove('active')); }

  showStep(i) {
    const id = this.stages[i].step;
    this.textSteps.forEach((el) => el.classList.toggle('active', el.dataset.stepId === id));
  }

  setChrome(on) { document.body.classList.toggle('chrome-visible', !!on); }

  startHold() { this.holdOn = this.stage > 0; }

  pauseHold() {
    this.holdOn = false;
    if (this.video && this.playTarget === null && !this.video.paused) this.video.pause();
  }

  // ---------------------------------------------------------------- animações de scroll e abertura
  jumpScroll(y) {
    this.animating = true;
    window.scrollTo(0, y);
    // libera após o evento de scroll gerado por nós
    requestAnimationFrame(() => requestAnimationFrame(() => { this.animating = false; }));
  }

  animateScroll(to, ms, done) {
    const from = window.scrollY;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    this.animating = true;
    clearTimeout(this.scrollTimer);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) { requestAnimationFrame(step); }
      else { this.animating = false; if (done) done(); }
    };
    requestAnimationFrame(step);
    // Se a aba estiver em segundo plano (rAF pausado), garante o destino
    this.scrollTimer = setTimeout(() => {
      if (this.animating) { window.scrollTo(0, to); this.animating = false; if (done) done(); }
    }, ms + 500);
  }

  animateIntro(from, to, ms) {
    this.introAnim = { from, to, t0: performance.now(), ms };
  }

  updateIntro(p) {
    if (!this.introLayer) return;
    const smooth = (a, b, x) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    if (p >= 1) {
      if (!this.introHidden) {
        this.introHidden = true;
        this.introLayer.style.opacity = '0';
        if (this.introVideo) this.introVideo.pause();
      }
      return;
    }
    this.introHidden = false;
    if (this.introVideo && this.introVideo.paused) {
      const pl = this.introVideo.play();
      if (pl && pl.catch) pl.catch(() => {});
    }
    this.introLayer.style.opacity = String(1 - smooth(0.3, 1, p));
    if (this.introContent) {
      const c = smooth(0, 0.35, p);
      this.introContent.style.opacity = String(1 - c);
      this.introContent.style.transform = `translateY(${-c * 60}px) scale(${1 - c * 0.05})`;
    }
    if (this.introCue) this.introCue.style.opacity = String(1 - smooth(0, 0.12, p));
    if (this.introVideo) this.introVideo.style.transform = `scale(${1 + smooth(0, 1, p) * 0.9})`;
  }

  // ---------------------------------------------------------------- loop (vídeo + abertura + canvas)
  startLoop() {
    const tick = () => {
      const now = performance.now();

      // Abertura
      if (this.introAnim) {
        const a = this.introAnim;
        const t = Math.min(1, (now - a.t0) / a.ms);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        this.introP = a.from + (a.to - a.from) * e;
        this.updateIntro(this.introP);
        if (t >= 1) this.introAnim = null;
      }

      const v = this.video;
      if (v && !this.useCanvasFallback) {
        if (this.playTarget !== null) {
          // Tocando até o ponto da etapa, desacelerando na chegada
          const rem = this.playTarget - v.currentTime;
          if (rem <= 0.04 || v.ended) {
            v.pause();
            this.playTarget = null;
          } else {
            const rate = Math.max(0.45, Math.min(this.playBase, rem * 1.8));
            if (Math.abs(v.playbackRate - rate) > 0.04) v.playbackRate = rate;
          }
        } else if (this.holdOn) {
          // Câmera lenta com o texto na tela: nunca fica congelado
          const next = this.stage < this.LAST ? this.timeOf(this.stage + 1) - 0.4 : this.videoDuration - 0.05;
          const cap = Math.min(this.timeOf(this.stage) + this.cfg.video.holdMaxSeconds, next);
          if (v.currentTime < cap - 0.03) {
            if (v.playbackRate !== this.cfg.video.holdRate) v.playbackRate = this.cfg.video.holdRate;
            if (v.paused && v.readyState >= 3) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
          } else if (!v.paused) {
            v.pause();
          }
        }
      }

      // Transição: mostra o texto um pouco antes de chegar e conclui quando o vídeo chega
      if (this.tr) {
        const el = now - this.tr.start;
        if (!this.tr.shown && el >= this.tr.ms * 0.68) { this.showStep(this.tr.to); this.tr.shown = true; }
        const videoArrived = this.tr.kind === 'seek' || this.playTarget === null || this.useCanvasFallback;
        if (el >= this.tr.ms && videoArrived) this.finish();
      }

      if (this.useCanvasFallback && this.drawCanvasFrame) {
        const goal = this.stage / this.LAST;
        this.visualP += (goal - this.visualP) * 0.06;
        this.drawCanvasFrame(this.visualP);
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  initProceduralFallback() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    this.resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    this.resizeCanvas();

    this.drawCanvasFrame = (progress) => {
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Fundo azul-marinho profundo da marca
      ctx.fillStyle = '#050B1A';
      ctx.fillRect(0, 0, w, h);

      // Linhas de perspectiva tridimensional
      ctx.save();
      ctx.strokeStyle = 'rgba(111, 211, 255, 0.12)';
      ctx.lineWidth = 1;

      const vanishingY = h * (0.35 + progress * 0.1);
      const vanishingX = w * 0.5;

      for (let i = -12; i <= 12; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(vanishingX + (i * w * 0.12), h);
        ctx.stroke();
      }

      // Linhas horizontais com recuo visual
      const numRings = 14;
      for (let j = 1; j <= numRings; j++) {
        const ringProg = ((j / numRings) + progress * 0.5) % 1;
        const y = vanishingY + Math.pow(ringProg, 2.2) * (h - vanishingY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();

      // Núcleo energético laranja HyperKav no ponto de fuga
      const coreRadius = 8 + (progress * 18);
      const gradient = ctx.createRadialGradient(vanishingX, vanishingY, 2, vanishingX, vanishingY, coreRadius * 2.8);
      gradient.addColorStop(0, '#FFA048');
      gradient.addColorStop(0.35, '#FF6A1A');
      gradient.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(vanishingX, vanishingY, coreRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Ponto de luz focal
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(vanishingX, vanishingY, coreRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
  }
}

// Inicialização automática protegida
document.addEventListener('DOMContentLoaded', () => {
  window.kavHeroEngine = new KavHeroStages();
});
