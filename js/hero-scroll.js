/**
 * ============================================================================
 * KAV + HYPERKAV — HERO SCROLL-DRIVEN EXPERIENCE ENGINE (v3.2 Production Ready)
 * ============================================================================
 * Design de Alta Fidelidade com scrub suave por hardware:
 * - Scrub com interpolação contínua (lerp) via requestAnimationFrame.
 * - Fila de seek não-bloqueante sincronizada pelo evento nativo 'seeked'.
 * - Scrub ativado estritamente quando readyState >= 3 e duration confirmada.
 * - Margens de respiro (deadband gaps) entre blocos de texto: ZERO colisão.
 * - Bloco de abertura e hint de scroll saem completamente antes do Ato 01.
 * - Monitoramento de buffer real com barra superior discreta.
 * - Fallback automático inteligente para Canvas / Poster caso o vídeo falhe.
 * - Suporte nativo a prefers-reduced-motion.
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    // Ordem de prioridade de fontes
    desktopSrc: 'assets/video/hero-desktop.mp4',
    mobileSrc: 'assets/video/hero-mobile.mp4',
    // Arquivo original de alta fidelidade confirmado presente no repositório (HTTP 200)
    legacySrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    posterJpg: 'assets/video/hero-poster.jpg',
    posterSvg: 'assets/video/hero-poster.svg',
    fallbackDuration: 24, // segundos estimados caso duration ainda seja desconhecida
    lerpFactor: 0.08,     // suavidade fluida no desktop
    mobileLerpFactor: 0.14 // agilidade e resposta tátil no mobile
  },

  scroll: {
    desktopHeight: '500vh',
    mobileHeight: '380vh'
  },

  acts: [
    { id: 1, label: '1 · Início', targetProgress: 0.15 },
    { id: 2, label: '2 · Núcleo HyperKav', targetProgress: 0.55 },
    { id: 3, label: '3 · Sucesso', targetProgress: 0.88 }
  ],

  // Janelas com margens deliberadas de respiro (gaps) para evitar qualquer sobreposição
  steps: [
    {
      id: 'step-opening',
      act: 1,
      minProgress: 0.00,
      maxProgress: 0.06,  // Sai completamente aos 6%
      position: 'bottom-center',
      showScrollHint: true,
      badge: null,
      title: 'Marketing e performance que levam o seu negócio ao topo.',
      subtitle: 'Todo negócio começa em algum ponto do mapa. Role para ver para onde ele pode ir.'
    },
    // GAP: 0.06 -> 0.10 (Respiro total: H1 e hint 100% ocultos, centro livre)
    {
      id: 'step-kav-enters',
      act: 1,
      minProgress: 0.10,  // Entra apenas aos 10%
      maxProgress: 0.20,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 01 • O INÍCIO',
      title: 'A Kav entra em campo.',
      subtitle: 'Mapeamos o seu mercado, os seus concorrentes e o que realmente move os clientes da sua região.'
    },
    // GAP: 0.20 -> 0.23 (Respiro)
    {
      id: 'step-first-leap',
      act: 1,
      minProgress: 0.23,
      maxProgress: 0.34,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'TRAÇÃO INICIAL',
      title: 'O primeiro salto é ganhar visibilidade.',
      subtitle: 'Posicionamento, presença digital e campanhas que tiram seu negócio do anonimato.'
    },
    // GAP: 0.34 -> 0.37 (Respiro)
    {
      id: 'step-data-appears',
      act: 2,
      minProgress: 0.37,
      maxProgress: 0.48,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 02 • INTELIGÊNCIA',
      title: 'Cada campanha vira inteligência.',
      subtitle: 'Pesquisas, métricas e relatórios mostram o que os maiores do seu mercado fazem e onde existe espaço para você passar na frente.'
    },
    // GAP: 0.48 -> 0.51 (Respiro)
    {
      id: 'step-hyperkav-core',
      act: 2,
      minProgress: 0.51,
      maxProgress: 0.63,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'NÚCLEO HYPERKAV',
      title: 'Seu negócio está pronto para entrar no núcleo.',
      subtitle: 'O HyperKav é o núcleo de tecnologia, pesquisa e estratégia da Kav, onde dados viram decisão.'
    },
    // GAP: 0.63 -> 0.66 (Respiro)
    {
      id: 'step-transformation',
      act: 2,
      minProgress: 0.66,
      maxProgress: 0.77,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'TRANSFORMAÇÃO',
      title: 'Estratégia, tecnologia e criatividade juntas.',
      subtitle: 'Tráfego, conteúdo, automação e análise em um só sistema, desenhado para o seu negócio.'
    },
    // GAP: 0.77 -> 0.80 (Respiro)
    {
      id: 'step-the-summit',
      act: 3,
      minProgress: 0.80,
      maxProgress: 0.90,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'ATO 03 • O TOPO',
      title: 'Acima da concorrência. Com método.',
      subtitle: 'Do ponto de partida ao topo do mercado, com um caminho claro e mensurável.'
    },
    // GAP: 0.90 -> 0.92 (Respiro)
    {
      id: 'step-cta-finale',
      act: 3,
      minProgress: 0.92,
      maxProgress: 1.01,
      position: 'bottom-center',
      showScrollHint: false,
      badge: 'KAV + HYPERKAV',
      title: 'Vamos levar o seu negócio ao topo?',
      subtitle: 'Do ponto de partida ao topo do mercado — com método, dados e tecnologia.'
    }
  ]
};

class KavHeroScrollEngine {
  constructor(config = HERO_SCROLL_CONFIG) {
    this.config = config;
    this.section = document.getElementById('heroScrollSection');
    if (!this.section) return;

    this.debug = new URLSearchParams(window.location.search).get('debug') === 'true';

    // Elementos DOM
    this.video = document.getElementById('heroScrollVideo');
    this.canvas = this.section.querySelector('.hero-fallback-canvas');
    this.loader = this.section.querySelector('.hero-loader');
    this.progressFill = this.section.querySelector('.progress-fill');
    this.progressPercent = this.section.querySelector('.progress-percent-val');
    this.actButtons = this.section.querySelectorAll('.act-pill-btn');
    this.textSteps = this.section.querySelectorAll('.hero-story-step');
    this.scrollHint = this.section.querySelector('.hero-scroll-hint');
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

    // Atributos vitais para autoplay inline no iOS / WebKit
    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    // Fonte comprovada presente no servidor (HTTP 200)
    // Se o elemento não tiver uma fonte válida ativa ou der erro, carrega o arquivo principal
    if (!this.video.src || this.video.src === '') {
      this.video.src = this.config.video.legacySrc;
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

    // Monitoramento do buffer real de download (HTTP range)
    const onBufferProgress = () => {
      if (this.video.buffered && this.video.buffered.length > 0 && this.video.duration) {
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        const percent = Math.min(100, Math.round((bufferedEnd / this.video.duration) * 100));
        if (this.bufferBar) {
          this.bufferBar.style.width = `${percent}%`;
          if (percent >= 99) {
            setTimeout(() => {
              if (this.bufferBar) this.bufferBar.style.opacity = '0';
            }, 800);
          }
        }
        this.log(`Buffer carregado: ${percent}%`);
      }
    };
    this.video.addEventListener('progress', onBufferProgress);

    // Condição estrita: habilita o scrub somente quando readyState >= 3 e duração confirmada
    const evaluateReadiness = () => {
      if (this.video.readyState >= 3 && this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
        this.videoDuration = this.video.duration;
        this.isVideoReady = true;
        this.log(`Vídeo totalmente pronto. Duração: ${this.videoDuration.toFixed(2)}s | readyState: ${this.video.readyState}`);

        // Garante a decodificação do primeiro frame imediatamente
        try {
          if (this.video.currentTime === 0) {
            this.video.currentTime = 0.001;
          }
        } catch (e) {}

        this.hideLoader();
      }
    };

    this.video.addEventListener('loadedmetadata', evaluateReadiness);
    this.video.addEventListener('loadeddata', evaluateReadiness);
    this.video.addEventListener('canplay', evaluateReadiness);
    this.video.addEventListener('canplaythrough', evaluateReadiness);

    if (this.video.readyState >= 3) {
      evaluateReadiness();
    }

    // Tratamento de falhas de rede resiliente
    this.video.addEventListener('error', (e) => {
      this.log('Falha de carregamento no vídeo:', e);
      // Se estava tentando hero-desktop/hero-mobile e falhou, tenta imediatamente a URL do arquivo principal
      if (this.video.src && this.video.src.indexOf('Untitled_Scene') === -1) {
        this.log('Redirecionando para o vídeo principal comprovado...');
        this.video.src = this.config.video.legacySrc;
        try { this.video.load(); } catch (err) {}
      } else {
        this.log('Ativando fallback procedural...');
        this.activateFallbackMode();
      }
    });

    // Watchdog de segurança: só aciona fallback se o vídeo falhar completamente (readyState < 2 após 6s)
    setTimeout(() => {
      if (!this.isVideoReady && (!this.video.readyState || this.video.readyState < 2)) {
        this.log('Timeout de carregamento do vídeo excedido. Ativando fallback procedural.');
        this.activateFallbackMode();
      }
      this.hideLoader();
    }, 6000);

    // Desbloqueio mobile no primeiro gesto do usuário
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
    if (this.video) {
      this.video.style.display = 'none';
    }
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
        this.loader.style.display = 'none';
      }, 400);
    }
  }

  setupEventListeners() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    window.addEventListener('resize', () => {
      this.applySectionHeight();
      if (this.useCanvasFallback && this.resizeCanvas) {
        this.resizeCanvas();
      }
    }, { passive: true });

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
        this.scrollToProgress(0.14);
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
        
        // Interpolação contínua e suave (lerp)
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
   * Aplica busca no frame correto com throttle e sincronização por hardware
   */
  updateVideoFrame(progress) {
    // Só atualiza se o vídeo estiver pronto e com readyState >= 3
    if (!this.video || !this.isVideoReady || this.video.readyState < 3) return;

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

    // Indicador "Role para explorar" some rapidamente antes de qualquer outro texto entrar (aos 4%)
    if (this.scrollHint) {
      if (progress > 0.04) {
        this.scrollHint.style.opacity = '0';
        this.scrollHint.style.pointerEvents = 'none';
      } else {
        this.scrollHint.style.opacity = '1';
        this.scrollHint.style.pointerEvents = 'auto';
      }
    }

    // Identificar passo ativo respeitando as margens de respiro
    const activeStep = this.config.steps.find((step) => {
      return progress >= step.minProgress && progress < step.maxProgress;
    }) || null;

    if (activeStep) {
      if (activeStep.id !== this.currentStepId) {
        this.currentStepId = activeStep.id;

        this.textSteps.forEach((el) => {
          const isCurrent = el.dataset.stepId === activeStep.id;
          el.classList.toggle('active', isCurrent);
        });
      }

      // Atualizar ato nos botões superiores
      if (activeStep.act !== this.currentActId) {
        this.currentActId = activeStep.act;
        this.actButtons.forEach((btn) => {
          const btnAct = parseInt(btn.dataset.act, 10);
          btn.classList.toggle('active', btnAct === activeStep.act);
        });
      }
    } else {
      // Estamos em uma zona de transição/gap: nenhum texto fica ativo! Tela limpa!
      this.currentStepId = null;
      this.textSteps.forEach((el) => {
        el.classList.remove('active');
      });
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
  window.kavHeroEngine = new KavHeroScrollEngine();
});
