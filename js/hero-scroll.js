/**
 * ============================================================================
 * KAV + HYPERKAV — HERO SCROLL-DRIVEN EXPERIENCE ENGINE (v3.0 Robust)
 * ============================================================================
 * Desenvolvido no padrão de engenharia de alta performance:
 * - Scrub com interpolação contínua (lerp) via requestAnimationFrame.
 * - Fila de seek não-bloqueante com sincronização via evento 'seeked' (100% compatível com iOS/Safari/Chrome).
 * - Monitoramento em tempo real de buffer (buffered/progress) com indicador de carregamento.
 * - Detecção automática de conexão (Save-Data, redes lentas) e seleção responsiva de arquivo.
 * - Fallback automático inteligente para Canvas / Poster caso o vídeo falhe ou demore.
 * - Suporte nativo a prefers-reduced-motion.
 * - Modo debug silencioso (ativado apenas com ?debug=true).
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    desktopSrc: 'assets/video/hero-desktop.mp4',
    mobileSrc: 'assets/video/hero-mobile.mp4',
    legacySrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    posterWebp: 'assets/video/hero-poster.webp',
    posterSvg: 'assets/video/hero-poster.svg',
    fallbackDuration: 24, // segundos estimados caso duration ainda seja desconhecida
    lerpFactor: 0.08,     // suavidade no desktop
    mobileLerpFactor: 0.12 // agilidade no mobile
  },

  scroll: {
    desktopHeight: '500vh',
    mobileHeight: '380vh'
  },

  acts: [
    { id: 1, label: '1 · Início', targetProgress: 0.14 },
    { id: 2, label: '2 · Núcleo HyperKav', targetProgress: 0.56 },
    { id: 3, label: '3 · Sucesso', targetProgress: 0.88 }
  ],

  steps: [
    {
      id: 'step-opening',
      act: 1,
      minProgress: 0.0,
      maxProgress: 0.08,
      position: 'bottom-center',
      showScrollHint: true,
      badge: null,
      title: 'Marketing e performance que levam o seu negócio ao topo.',
      subtitle: 'Todo negócio começa em algum ponto do mapa. Role para ver para onde ele pode ir.'
    },
    {
      id: 'step-kav-enters',
      act: 1,
      minProgress: 0.08,
      maxProgress: 0.20,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 01 • O INÍCIO',
      title: 'A Kav entra em campo.',
      subtitle: 'Mapeamos o seu mercado, os seus concorrentes e o que realmente move os clientes da sua região.'
    },
    {
      id: 'step-first-leap',
      act: 1,
      minProgress: 0.20,
      maxProgress: 0.35,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'TRAÇÃO INICIAL',
      title: 'O primeiro salto é ganhar visibilidade.',
      subtitle: 'Posicionamento, presença digital e campanhas que tiram seu negócio do anonimato.'
    },
    {
      id: 'step-data-appears',
      act: 2,
      minProgress: 0.35,
      maxProgress: 0.50,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 02 • INTELIGÊNCIA',
      title: 'Cada campanha vira inteligência.',
      subtitle: 'Pesquisas, métricas e relatórios mostram o que os maiores do seu mercado fazem e onde existe espaço para você passar na frente.'
    },
    {
      id: 'step-hyperkav-core',
      act: 2,
      minProgress: 0.50,
      maxProgress: 0.65,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'NÚCLEO HYPERKAV',
      title: 'Seu negócio está pronto para entrar no núcleo.',
      subtitle: 'O HyperKav é o núcleo de tecnologia, pesquisa e estratégia da Kav, onde dados viram decisão.'
    },
    {
      id: 'step-transformation',
      act: 2,
      minProgress: 0.65,
      maxProgress: 0.80,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'TRANSFORMAÇÃO',
      title: 'Estratégia, tecnologia e criatividade juntas.',
      subtitle: 'Tráfego, conteúdo, automação e análise em um só sistema, desenhado para o seu negócio.'
    },
    {
      id: 'step-the-summit',
      act: 3,
      minProgress: 0.80,
      maxProgress: 0.92,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 03 • O TOPO',
      title: 'Acima da concorrência. Com método.',
      subtitle: 'Do ponto de partida ao topo do mercado, com um caminho claro e previsível.'
    },
    {
      id: 'step-cta-finale',
      act: 3,
      minProgress: 0.92,
      maxProgress: 1.00,
      position: 'bottom-center',
      showScrollHint: false,
      badge: 'KAV + HYPERKAV',
      title: 'Vamos levar o seu negócio ao topo?',
      subtitle: 'Do ponto perdido ao topo do mercado — com método, dados e tecnologia.',
      isFinalCTA: true
    }
  ]
};

class KavHeroScrollExperience {
  constructor(sectionId, config) {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.config = config;
    this.debug = window.location.search.includes('debug=true') || window.KAV_DEBUG === true;

    this.video = this.section.querySelector('.hero-scroll-video');
    this.canvas = this.section.querySelector('.hero-fallback-canvas');
    this.stickyContainer = this.section.querySelector('.hero-sticky-viewport');
    this.progressBar = this.section.querySelector('.hero-scroll-progress-bar');
    this.progressFill = this.section.querySelector('.progress-fill');
    this.progressPercent = this.section.querySelector('.progress-percent-val');
    this.scrollHint = this.section.querySelector('.hero-scroll-hint');
    this.actButtons = this.section.querySelectorAll('.act-pill-btn');
    this.textSteps = this.section.querySelectorAll('.hero-story-step');
    this.loader = this.section.querySelector('.hero-loader');
    this.bufferBar = this.section.querySelector('.hero-buffer-bar');

    // Estado da rolagem e renderização
    this.rawProgress = 0;
    this.smoothProgress = 0;
    this.currentStepId = null;
    this.currentActId = 1;
    this.videoDuration = config.video.fallbackDuration;
    this.isVideoReady = false;
    this.useCanvasFallback = false;
    this.isReducedMotion = false;
    this.isRendering = false;

    // Fila de seek precisa
    this.isSeeking = false;
    this.pendingSeekTime = null;
    this.lastRenderedTime = -1;

    this.init();
  }

  log(...args) {
    if (this.debug) {
      console.log('[KavHero]', ...args);
    }
  }

  init() {
    this.checkReducedMotion();
    this.applySectionHeight();
    this.selectVideoSource();
    this.setupVideoEvents();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mediaQuery.matches;
    if (this.isReducedMotion) {
      this.log('Modo prefers-reduced-motion ativo. Desativando scrub contínuo.');
      this.section.classList.add('reduced-motion-mode');
    }
  }

  applySectionHeight() {
    const isMobile = window.innerWidth <= 768;
    this.section.style.height = isMobile 
      ? this.config.scroll.mobileHeight 
      : this.config.scroll.desktopHeight;
  }

  selectVideoSource() {
    if (!this.video) return;

    // Detecção de rede lenta ou economia de dados (Save-Data)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g');
    const isMobile = window.innerWidth <= 768;

    let targetSrc = this.config.video.desktopSrc;
    if (isSlowConnection || isMobile) {
      targetSrc = this.config.video.mobileSrc;
    }

    // Configuração de atributos essenciais para reprodução inline e desbloqueio mobile
    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    // Se a fonte principal ainda for o vídeo renderizado enviado
    if (!this.video.src || this.video.src === '') {
      // Prioridade: arquivo responsivo -> fallback legado do upload
      this.video.src = targetSrc;
    }
  }

  setupVideoEvents() {
    if (!this.video) return;

    // Sincronização via 'seeked' para evitar fila acumulada de frames
    this.video.addEventListener('seeked', () => {
      this.isSeeking = false;
      if (this.pendingSeekTime !== null) {
        const nextTime = this.pendingSeekTime;
        this.pendingSeekTime = null;
        this.applyDirectSeek(nextTime);
      }
    });

    // Monitoramento do carregamento e buffer real
    const onBufferProgress = () => {
      if (this.video.buffered && this.video.buffered.length > 0 && this.video.duration) {
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        const percent = Math.min(100, Math.round((bufferedEnd / this.video.duration) * 100));
        if (this.bufferBar) {
          this.bufferBar.style.width = `${percent}%`;
        }
        this.log(`Buffer carregado: ${percent}%`);
      }
    };
    this.video.addEventListener('progress', onBufferProgress);

    const onReady = () => {
      if (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
        this.videoDuration = this.video.duration;
      }
      this.isVideoReady = true;
      this.log(`Vídeo pronto. Duração: ${this.videoDuration.toFixed(2)}s | readyState: ${this.video.readyState}`);

      // Pintar primeiro frame
      try {
        if (this.video.currentTime === 0) {
          this.video.currentTime = 0.001;
        }
      } catch (e) {}

      this.hideLoader();
    };

    this.video.addEventListener('loadedmetadata', onReady);
    this.video.addEventListener('loadeddata', onReady);
    this.video.addEventListener('canplay', onReady);
    this.video.addEventListener('canplaythrough', onReady);

    if (this.video.readyState >= 2) {
      onReady();
    }

    // Fallback de erro resiliente
    this.video.addEventListener('error', () => {
      this.log('Erro ao carregar o vídeo. Tentando fallback legado...');
      if (this.video.src.indexOf('Untitled_Scene') === -1) {
        this.video.src = this.config.video.legacySrc;
        try { this.video.load(); } catch (e) {}
      } else {
        this.activateFallbackMode();
      }
    });

    // Timeout de segurança: se o vídeo não carregar em 4.5 segundos, ativa fallback
    setTimeout(() => {
      if (!this.isVideoReady && (!this.video.readyState || this.video.readyState < 2)) {
        this.log('Timeout de carregamento do vídeo excedido. Ativando fallback.');
        this.activateFallbackMode();
      }
      this.hideLoader();
    }, 4500);

    // Desbloqueio mobile no primeiro gesto
    const unlockMobile = () => {
      if (this.video && this.video.paused) {
        const p = this.video.play();
        if (p && typeof p.then === 'function') {
          p.then(() => this.video.pause()).catch(() => {});
        }
      }
      ['touchstart', 'scroll', 'pointerdown', 'wheel'].forEach(evt => {
        window.removeEventListener(evt, unlockMobile);
      });
    };
    ['touchstart', 'scroll', 'pointerdown', 'wheel'].forEach(evt => {
      window.addEventListener(evt, unlockMobile, { passive: true, once: true });
    });
  }

  activateFallbackMode() {
    this.useCanvasFallback = true;
    if (this.video) this.video.style.display = 'none';
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.initProceduralFallback();
    }
    this.hideLoader();
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('fade-out');
      setTimeout(() => {
        if (this.loader) this.loader.style.display = 'none';
      }, 350);
    }
  }

  setupEventListeners() {
    window.addEventListener('scroll', () => {
      this.handleScroll();
      this.hideLoader();
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.applySectionHeight();
      if (this.useCanvasFallback && this.resizeCanvas) {
        this.resizeCanvas();
      }
    });

    this.actButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const actId = parseInt(btn.dataset.act, 10);
        const actConfig = this.config.acts.find(a => a.id === actId);
        if (actConfig) {
          this.scrollToProgress(actConfig.targetProgress);
        }
      });
    });

    if (this.scrollHint) {
      this.scrollHint.addEventListener('click', () => {
        this.scrollToProgress(0.12);
      });
    }
  }

  handleScroll() {
    if (this.isReducedMotion) return;

    const rect = this.section.getBoundingClientRect();
    const sectionHeight = this.section.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = sectionHeight - windowHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    this.rawProgress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
  }

  scrollToProgress(targetProg) {
    const sectionTop = this.section.offsetTop;
    const sectionHeight = this.section.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = sectionHeight - windowHeight;

    const targetScrollY = sectionTop + (targetProg * scrollableDistance);
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }

  startRenderLoop() {
    this.isRendering = true;

    const render = () => {
      if (!this.isRendering) return;

      if (!this.isReducedMotion) {
        const isMobile = window.innerWidth <= 768;
        const factor = isMobile ? this.config.video.mobileLerpFactor : this.config.video.lerpFactor;
        
        // Interpolação suave (lerp)
        this.smoothProgress += (this.rawProgress - this.smoothProgress) * factor;

        // Atualização de vídeo ou canvas
        if (!this.useCanvasFallback && this.video) {
          this.updateVideoFrame(this.smoothProgress);
        } else if (this.useCanvasFallback && this.drawCanvasFrame) {
          this.drawCanvasFrame(this.smoothProgress);
        }

        this.updateStoryUI(this.smoothProgress);
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  /**
   * MOTOR DE SCRUB PRECISO E FLUIDO
   * Aplica busca no frame correto com throttle pelo ciclo do hardware
   */
  updateVideoFrame(progress) {
    if (!this.video || !this.isVideoReady && this.video.readyState < 2) return;

    const duration = (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0)
      ? this.video.duration
      : this.videoDuration;

    const targetTime = Math.max(0, Math.min(duration, progress * duration));

    // Apenas busca se houver mudança perceptível de tempo (> 0.02s)
    if (Math.abs(targetTime - this.lastRenderedTime) > 0.02) {
      this.lastRenderedTime = targetTime;
      this.applyDirectSeek(targetTime);
    }
  }

  applyDirectSeek(targetTime) {
    if (!this.video) return;

    if (!this.isSeeking) {
      this.isSeeking = true;
      try {
        this.video.currentTime = targetTime;
      } catch (e) {
        this.isSeeking = false;
      }
    } else {
      this.pendingSeekTime = targetTime;
    }
  }

  updateStoryUI(progress) {
    const percentInt = Math.round(progress * 100);
    if (this.progressFill) {
      this.progressFill.style.width = `${progress * 100}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${percentInt}%`;
    }

    // Identificar passo ativo
    const activeStep = this.config.steps.find((step) => {
      return progress >= step.minProgress && progress < step.maxProgress;
    }) || this.config.steps[this.config.steps.length - 1];

    if (activeStep && activeStep.id !== this.currentStepId) {
      this.currentStepId = activeStep.id;

      this.textSteps.forEach((el) => {
        const isCurrent = el.dataset.stepId === activeStep.id;
        el.classList.toggle('active', isCurrent);
      });
    }

    // Atualizar ato nos botões superiores
    if (activeStep && activeStep.act !== this.currentActId) {
      this.currentActId = activeStep.act;
      this.actButtons.forEach((btn) => {
        const btnAct = parseInt(btn.dataset.act, 10);
        btn.classList.toggle('active', btnAct === activeStep.act);
      });
    }

    // Indicador "Role para explorar" some suavemente após o início
    if (this.scrollHint) {
      this.scrollHint.style.opacity = progress > 0.06 ? '0' : '1';
      this.scrollHint.style.pointerEvents = progress > 0.06 ? 'none' : 'auto';
    }

    // Elevação do header
    const header = document.getElementById('header');
    if (header) {
      if (progress > 0.95) {
        header.classList.add('header-scrolled-past');
      } else {
        header.classList.remove('header-scrolled-past');
      }
    }
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
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, Math.max(w, h));
      bgGrad.addColorStop(0, '#102244');
      bgGrad.addColorStop(0.5, '#0A1633');
      bgGrad.addColorStop(1, '#050B1A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid perspectivo
      ctx.save();
      ctx.strokeStyle = 'rgba(111, 211, 255, 0.14)';
      ctx.lineWidth = 1;
      const vpY = cy - 40;
      for (let x = -w * 0.4; x <= w * 1.4; x += w * 0.1) {
        ctx.beginPath();
        ctx.moveTo(cx, vpY);
        ctx.lineTo(x, h + 200);
        ctx.stroke();
      }
      ctx.restore();

      // Trajetória de luz laranja de ascensão
      ctx.save();
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#FF6A1A';
      ctx.strokeStyle = '#FF6A1A';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      const startX = cx - 240;
      const startY = h - 160;
      const curX = startX + (progress * 480);
      const curY = startY - (Math.pow(progress, 1.4) * (h - 260));

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cx - 50 + (progress * 80), startY - 120 - (progress * 150), curX, curY);
      ctx.stroke();

      // Ponto focal
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(curX, curY, 8 + Math.sin(progress * 20) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFA048';
      ctx.beginPath();
      ctx.arc(curX, curY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.kavHeroExperience = new KavHeroScrollExperience('heroScrollSection', HERO_SCROLL_CONFIG);
});
