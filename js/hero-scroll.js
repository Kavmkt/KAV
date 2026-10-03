/**
 * ============================================================================
 * KAV + HYPERKAV — HERO SCROLL-DRIVEN EXPERIENCE ENGINE
 * ============================================================================
 * Desenvolvido no padrão de engenharia de interação de alta fidelidade
 * (Apple, Stripe, Linear, Awwwards).
 *
 * Sincroniza o vídeo 3D 'Untitled_Scene_10-03_00_51_11_20261002215523.mp4'
 * (25.4 MB) frame a frame com a rolagem do usuário, com aceleração por hardware
 * e fila de decodificação otimizada para evitar travamentos.
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    // Arquivo oficial enviado pelo usuário
    src: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    altSrc: 'assets/video/hero-scroll.mp4',
    poster: 'assets/video/hero-poster.svg',
    fallbackDuration: 24, // Duração de segurança caso os metadados demorem
    lerpFactor: 0.08,      // Inércia e fluidez no desktop
    mobileLerpFactor: 0.12 // Inércia mais ágil no mobile
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
      subtitle: 'Do ponto de partida ao topo do mercado, com um caminho claro.',
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
  ]
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

    // Estado interno
    this.rawProgress = 0;
    this.smoothProgress = 0;
    this.currentStepId = null;
    this.currentActId = 1;
    this.videoDuration = config.video.fallbackDuration;
    this.isVideoReady = false;
    this.useCanvasFallback = false;
    this.isReducedMotion = false;
    this.isRendering = false;

    // Fila otimizada de decodificação de frames
    this.isSeeking = false;
    this.pendingSeekTime = null;

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

    // Configurações cruciais para autoplay inline e scrubbing em todos os navegadores
    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    // Garantir visibilidade inicial do elemento de vídeo
    this.video.style.display = 'block';
    this.video.style.opacity = '1';

    // Se o elemento não tiver o src definido, define diretamente
    if (!this.video.src || this.video.src.indexOf('Untitled_Scene') === -1) {
      this.video.src = this.config.video.src;
    }

    // Fila de scrubbing suave ao receber evento 'seeked' do decodificador
    this.video.addEventListener('seeked', () => {
      this.isSeeking = false;
      if (this.pendingSeekTime !== null) {
        const nextTime = this.pendingSeekTime;
        this.pendingSeekTime = null;
        this.performVideoSeek(nextTime);
      }
    });

    // Callback de vídeo pronto para uso
    const onVideoReady = () => {
      this.isVideoReady = true;
      if (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
        this.videoDuration = this.video.duration;
      }

      // Desativa e esconde qualquer fallback para exibir o vídeo real
      this.useCanvasFallback = false;
      if (this.canvas) this.canvas.style.display = 'none';
      this.video.style.display = 'block';
      this.video.style.opacity = '1';

      // Forçar a pintura do primeiro frame do vídeo na tela
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

    // Se o vídeo já estiver com dados prontos no cache
    if (this.video.readyState >= 1) {
      onVideoReady();
    }

    // Desbloquear motor de decodificação no iOS Safari na primeira interação do usuário
    const unlockMobileVideo = () => {
      if (this.video && this.video.paused) {
        const promise = this.video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(() => {
            this.video.pause();
          }).catch(() => {});
        }
      }
      window.removeEventListener('touchstart', unlockMobileVideo);
      window.removeEventListener('scroll', unlockMobileVideo);
      window.removeEventListener('pointerdown', unlockMobileVideo);
    };

    window.addEventListener('touchstart', unlockMobileVideo, { passive: true, once: true });
    window.addEventListener('scroll', unlockMobileVideo, { passive: true, once: true });
    window.addEventListener('pointerdown', unlockMobileVideo, { passive: true, once: true });

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

    // Timeout de segurança: nunca deixa o preloader preso para o visitante
    setTimeout(() => {
      this.hideLoader();
    }, 2800);

    try {
      this.video.load();
    } catch (e) {
      console.warn(e);
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

    // Cliques nos botões de Ato no HUD superior
    this.actButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const actId = parseInt(btn.dataset.act, 10);
        const actConfig = this.config.acts.find(a => a.id === actId);
        if (actConfig) {
          this.scrollToProgress(actConfig.targetProgress);
        }
      });
    });

    // Clique na dica de scroll
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
        // Suavização por interpolação linear (lerp)
        const isMobile = window.innerWidth <= 768;
        const factor = isMobile ? this.config.video.mobileLerpFactor : this.config.video.lerpFactor;
        this.smoothProgress += (this.rawProgress - this.smoothProgress) * factor;

        // Atualizar o frame do vídeo
        this.updateVideoScrub(this.smoothProgress);

        // Se o canvas fallback estiver ativo
        if (this.useCanvasFallback && this.drawCanvasFrame) {
          this.drawCanvasFrame(this.smoothProgress);
        }

        // Sincronizar textos e HUD
        this.updateStoryUI(this.smoothProgress);
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  performVideoSeek(targetTime) {
    if (!this.video) return;

    if (!this.isSeeking) {
      this.isSeeking = true;
      try {
        if (typeof this.video.fastSeek === 'function') {
          this.video.fastSeek(targetTime);
        } else {
          this.video.currentTime = targetTime;
        }
      } catch (e) {
        try { this.video.currentTime = targetTime; } catch (err) {}
      }
    } else {
      this.pendingSeekTime = targetTime;
    }
  }

  updateVideoScrub(progress) {
    if (!this.video || this.useCanvasFallback) return;

    const duration = (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0)
      ? this.video.duration
      : this.videoDuration;

    const targetTime = Math.max(0, Math.min(duration, progress * duration));

    if (Math.abs(this.video.currentTime - targetTime) > 0.015) {
      this.performVideoSeek(targetTime);
    }
  }

  updateStoryUI(progress) {
    // Barra e numeração do progresso
    const percentInt = Math.round(progress * 100);
    if (this.progressFill) {
      this.progressFill.style.width = `${progress * 100}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${percentInt}%`;
    }

    // Passo de texto ativo
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

    // Indicador de Ato ativo
    if (activeStep && activeStep.act !== this.currentActId) {
      this.currentActId = activeStep.act;
      this.actButtons.forEach((btn) => {
        const btnAct = parseInt(btn.dataset.act, 10);
        btn.classList.toggle('active', btnAct === activeStep.act);
      });
    }

    // Dica de rolagem
    if (this.scrollHint) {
      this.scrollHint.style.opacity = progress > 0.06 ? '0' : '1';
      this.scrollHint.style.pointerEvents = progress > 0.06 ? 'none' : 'auto';
    }

    // Transição de opacidade do Header
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

      // Fundo azul-marinho cinematográfico
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h));
      bgGrad.addColorStop(0, '#102244');
      bgGrad.addColorStop(0.5, '#0A1633');
      bgGrad.addColorStop(1, '#050B1A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid 3D de perspectiva
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

      // Rastro de Luz Neon Laranja
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
