/**
 * ============================================================================
 * KAV + HYPERKAV — ULTRA-SMOOTH HERO SCROLL-DRIVEN EXPERIENCE ENGINE
 * ============================================================================
 * Desenvolvido no padrão de engenharia de interação de alta fidelidade
 * (Apple, Stripe, Linear, Awwwards).
 *
 * Elimina completamente engasgos e travamentos:
 * 1. Não usa fastSeek() (que causava snap exclusivo para keyframes, pulando de 4 em 4s).
 * 2. Motor Híbrido de Playback (Forward Continuous Playback):
 *    - Ao rolar para frente, o vídeo REPRODUZ em taxa dinâmica (0.6x a 3.5x)
 *      proporcional à velocidade da rolagem, decodificando 60fps pela GPU.
 *    - Ao parar a rolagem ou alcançar o alvo, pausa exatamente no frame.
 * 3. Busca Direta sem Fila Bloqueante (Reverse Seek):
 *    - Ao rolar para trás, faz busca direta precisa com throttle de frame.
 * 4. Desbloqueio universal em mobile (iOS Safari / Android) no primeiro gesto.
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    // Arquivo oficial enviado pelo usuário
    src: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    altSrc: 'assets/video/hero-scroll.mp4',
    poster: 'assets/video/hero-poster.svg',
    fallbackDuration: 24, // Duração de referência em segundos
    lerpFactor: 0.08,      // Suavidade no desktop
    mobileLerpFactor: 0.12 // Agilidade no mobile
  },

  scroll: {
    desktopHeight: '520vh',
    mobileHeight: '380vh'
  },

  acts: [
    { id: 1, label: '1 · Início', targetProgress: 0.14 },
    { id: 2, label: '2 · Núcleo HyperKav', targetProgress: 0.56 },
    { id: 3, label: '3 · O Topo', targetProgress: 0.88 }
  ],

  // Sincronia perfeita com as etapas da Kav e o Núcleo HyperKav
  steps: [
    {
      id: 'step-opening',
      act: 1,
      minProgress: 0.0,
      maxProgress: 0.08,
      position: 'bottom-center',
      showScrollHint: true,
      title: 'Todo negócio começa em algum ponto do mapa.',
      subtitle: 'Role para ver para onde ele pode ir.',
      badge: null
    },
    {
      id: 'step-kav-enters',
      act: 1,
      minProgress: 0.08,
      maxProgress: 0.20,
      position: 'bottom-left',
      showScrollHint: false,
      title: 'A Kav entra em campo.',
      subtitle: 'Mapeamos o seu mercado, os seus concorrentes e o que realmente move os clientes da sua região.',
      badge: 'ATO 01 • O INÍCIO'
    },
    {
      id: 'step-first-leap',
      act: 1,
      minProgress: 0.20,
      maxProgress: 0.35,
      position: 'bottom-right',
      showScrollHint: false,
      title: 'O primeiro salto é ganhar visibilidade.',
      subtitle: 'Posicionamento, presença digital e campanhas que tiram seu negócio do anonimato.',
      badge: 'TRAÇÃO INICIAL'
    },
    {
      id: 'step-data-appears',
      act: 2,
      minProgress: 0.35,
      maxProgress: 0.50,
      position: 'bottom-left',
      showScrollHint: false,
      title: 'Cada campanha vira inteligência.',
      subtitle: 'Pesquisas, métricas e relatórios mostram o que os maiores do seu mercado fazem e onde existe espaço para você passar na frente.',
      badge: 'ATO 02 • INTELIGÊNCIA'
    },
    {
      id: 'step-hyperkav-core',
      act: 2,
      minProgress: 0.50,
      maxProgress: 0.65,
      position: 'bottom-left',
      showScrollHint: false,
      title: 'Seu negócio está pronto para entrar no núcleo.',
      subtitle: 'O HyperKav é o núcleo de tecnologia, pesquisa e estratégia da Kav, onde dados viram decisão.',
      badge: 'NÚCLEO HYPERKAV'
    },
    {
      id: 'step-transformation',
      act: 2,
      minProgress: 0.65,
      maxProgress: 0.80,
      position: 'bottom-right',
      showScrollHint: false,
      title: 'Estratégia, tecnologia e criatividade, trabalhando juntas.',
      subtitle: 'Tráfego, conteúdo, automação e análise em um só sistema, desenhado para o seu negócio.',
      badge: 'TRANSFORMAÇÃO'
    },
    {
      id: 'step-the-summit',
      act: 3,
      minProgress: 0.80,
      maxProgress: 0.92,
      position: 'bottom-left',
      showScrollHint: false,
      title: 'Acima da concorrência. Com método.',
      subtitle: 'Do ponto de partida ao topo do mercado, com um caminho claro e previsível.',
      badge: 'ATO 03 • O TOPO'
    },
    {
      id: 'step-cta-finale',
      act: 3,
      minProgress: 0.92,
      maxProgress: 1.00,
      position: 'bottom-center',
      showScrollHint: false,
      title: 'Vamos levar o seu negócio ao topo?',
      subtitle: 'Do ponto perdido ao topo do mercado — com método, dados e tecnologia.',
      badge: 'KAV + HYPERKAV',
      isFinalCTA: true
    }
  ],

  placeholders: {
    primaryCtaText: 'Falar com a Kav',
    primaryCtaLink: '#diagnostico',
    secondaryCtaText: 'Conhecer o HyperKav',
    secondaryCtaLink: '#hyperkav'
  }
};

class KavHeroScrollExperience {
  constructor(sectionId, config) {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.config = config;
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

    // Estado da rolagem
    this.rawProgress = 0;
    this.smoothProgress = 0;
    this.currentStepId = null;
    this.currentActId = 1;
    this.videoDuration = config.video.fallbackDuration;
    this.isVideoReady = false;
    this.useCanvasFallback = false;
    this.isReducedMotion = false;
    this.isRendering = false;

    // Estado do motor contínuo de vídeo
    this.isPlaying = false;
    this.playPromise = null;
    this.isSeeking = false;
    this.pendingSeekTime = null;
    this.lastScrollTimestamp = performance.now();

    this.init();
  }

  init() {
    this.checkReducedMotion();
    this.applySectionHeight();
    this.setupVideo();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mediaQuery.matches;
    if (this.isReducedMotion) {
      this.section.classList.add('reduced-motion-mode');
    }
  }

  applySectionHeight() {
    const isMobile = window.innerWidth <= 768;
    this.section.style.height = isMobile 
      ? this.config.scroll.mobileHeight 
      : this.config.scroll.desktopHeight;
  }

  setupVideo() {
    if (!this.video) return;

    // Configurações universais para aceleração gráfica sem bloqueio de autoplay
    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    this.video.style.display = 'block';
    this.video.style.opacity = '1';

    if (!this.video.src || this.video.src.indexOf('Untitled_Scene') === -1) {
      this.video.src = this.config.video.src;
    }

    // Ouvinte para busca precisa ao rolar para trás
    this.video.addEventListener('seeked', () => {
      this.isSeeking = false;
      if (this.pendingSeekTime !== null) {
        const nextTime = this.pendingSeekTime;
        this.pendingSeekTime = null;
        this.directSeek(nextTime);
      }
    });

    const onVideoReady = () => {
      this.isVideoReady = true;
      if (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
        this.videoDuration = this.video.duration;
      }

      this.useCanvasFallback = false;
      if (this.canvas) this.canvas.style.display = 'none';
      this.video.style.display = 'block';
      this.video.style.opacity = '1';

      // Forçar a pintura inicial do primeiro frame
      try {
        if (this.video.currentTime === 0) {
          this.video.currentTime = 0.001;
        }
      } catch (e) {}

      this.hideLoader();
    };

    this.video.addEventListener('loadedmetadata', onVideoReady);
    this.video.addEventListener('loadeddata', onVideoReady);
    this.video.addEventListener('canplay', onVideoReady);
    this.video.addEventListener('canplaythrough', onVideoReady);

    if (this.video.readyState >= 1) {
      onVideoReady();
    }

    // Desbloqueio imediato no primeiro gesto do usuário
    const unlockMobile = () => {
      if (this.video && this.video.paused) {
        const p = this.video.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            this.video.pause();
          }).catch(() => {});
        }
      }
      window.removeEventListener('touchstart', unlockMobile);
      window.removeEventListener('scroll', unlockMobile);
      window.removeEventListener('pointerdown', unlockMobile);
      window.removeEventListener('wheel', unlockMobile);
    };

    window.addEventListener('touchstart', unlockMobile, { passive: true, once: true });
    window.addEventListener('scroll', unlockMobile, { passive: true, once: true });
    window.addEventListener('pointerdown', unlockMobile, { passive: true, once: true });
    window.addEventListener('wheel', unlockMobile, { passive: true, once: true });

    // Tratamento de erro resiliente
    let triedAlt = false;
    this.video.addEventListener('error', () => {
      if (!triedAlt && this.config.video.altSrc) {
        triedAlt = true;
        this.video.src = this.config.video.altSrc;
        try { this.video.load(); } catch (e) {}
        return;
      }
      if (!this.isVideoReady) {
        this.activateCanvasFallback();
        this.hideLoader();
      }
    });

    // Ocultar loader rapidamente
    setTimeout(() => {
      this.hideLoader();
    }, 2200);

    try {
      this.video.load();
    } catch (e) {}
  }

  safePlay(rate = 1.0) {
    if (!this.video) return;
    this.video.playbackRate = rate;

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.playPromise = this.video.play();
      if (this.playPromise !== undefined) {
        this.playPromise.then(() => {
          this.playPromise = null;
        }).catch(() => {
          this.playPromise = null;
          this.isPlaying = false;
        });
      }
    }
  }

  safePause() {
    if (!this.video) return;

    if (this.isPlaying) {
      if (this.playPromise !== null) {
        this.playPromise.then(() => {
          this.video.pause();
          this.isPlaying = false;
          this.playPromise = null;
        }).catch(() => {
          this.isPlaying = false;
          this.playPromise = null;
        });
      } else {
        this.video.pause();
        this.isPlaying = false;
      }
    }
  }

  directSeek(targetTime) {
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

  activateCanvasFallback() {
    this.useCanvasFallback = true;
    if (this.video) this.video.style.display = 'none';
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.initCanvasFallbackRenderer();
    }
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('fade-out');
      setTimeout(() => {
        if (this.loader) this.loader.style.display = 'none';
      }, 300);
    }
  }

  setupEventListeners() {
    window.addEventListener('scroll', () => {
      this.handleScroll();
      this.lastScrollTimestamp = performance.now();
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
        this.smoothProgress += (this.rawProgress - this.smoothProgress) * factor;

        // Atualização do vídeo sem travamento
        this.updateVideoScrub(this.smoothProgress);

        if (this.useCanvasFallback && this.drawCanvasFrame) {
          this.drawCanvasFrame(this.smoothProgress);
        }

        this.updateStoryUI(this.smoothProgress);
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  /**
   * MOTOR DE FLUIDEZ ULTRA-PRECISO:
   * Combina Playback Rate dinâmico para avançar suavemente (60fps contínuos)
   * e busca direta precisa para retroceder, eliminando qualquer travamento.
   */
  updateVideoScrub(progress) {
    if (!this.video || this.useCanvasFallback) return;

    const duration = (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0)
      ? this.video.duration
      : this.videoDuration;

    const targetTime = Math.max(0, Math.min(duration, progress * duration));
    const currentTime = this.video.currentTime;
    const diff = targetTime - currentTime;

    const now = performance.now();
    const timeSinceScroll = now - this.lastScrollTimestamp;

    // Rolando para frente:
    if (diff > 0.04) {
      if (diff > 1.4) {
        // Salto longo: busca direta
        this.safePause();
        this.directSeek(targetTime);
      } else {
        // Reprodução fluida nativa proporcional ao scroll
        const rate = Math.min(3.8, Math.max(0.65, diff * 4.8));
        this.safePlay(rate);
      }
    } 
    // Rolando para trás:
    else if (diff < -0.04) {
      this.safePause();
      this.directSeek(targetTime);
    } 
    // Alvo atingido ou rolagem parada:
    else {
      if (timeSinceScroll > 100 || Math.abs(diff) < 0.02) {
        this.safePause();
      }
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

    if (activeStep && activeStep.act !== this.currentActId) {
      this.currentActId = activeStep.act;
      this.actButtons.forEach((btn) => {
        const btnAct = parseInt(btn.dataset.act, 10);
        btn.classList.toggle('active', btnAct === activeStep.act);
      });
    }

    if (this.scrollHint) {
      this.scrollHint.style.opacity = progress > 0.06 ? '0' : '1';
      this.scrollHint.style.pointerEvents = progress > 0.06 ? 'none' : 'auto';
    }

    const header = document.getElementById('header');
    if (header) {
      if (progress > 0.95) {
        header.classList.add('header-scrolled-past');
      } else {
        header.classList.remove('header-scrolled-past');
      }
    }
  }

  initCanvasFallbackRenderer() {
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

      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h));
      bgGrad.addColorStop(0, '#102244');
      bgGrad.addColorStop(0.5, '#0A1633');
      bgGrad.addColorStop(1, '#050B1A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.strokeStyle = 'rgba(111, 211, 255, 0.12)';
      ctx.lineWidth = 1;

      const vpY = cy - 40;
      for (let x = -w * 0.4; x <= w * 1.4; x += w * 0.1) {
        ctx.beginPath();
        ctx.moveTo(cx, vpY);
        ctx.lineTo(x, h + 200);
        ctx.stroke();
      }

      const gridOffset = (progress * 180) % 50;
      for (let y = vpY + 30; y <= h; y += 45 + ((y - vpY) * 0.15)) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset * 0.3);
        ctx.lineTo(w, y + gridOffset * 0.3);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#FF6A1A';
      ctx.strokeStyle = '#FF6A1A';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      const startX = cx - 240;
      const startY = h - 160;
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const curX = startX + (progress * 480);
      const curY = startY - (Math.pow(progress, 1.4) * (h - 260));

      ctx.quadraticCurveTo(
        cx - 50 + (progress * 80),
        startY - 120 - (progress * 150),
        curX,
        curY
      );
      ctx.stroke();

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
