/**
 * ============================================================================
 * KAV — HERO SCROLL-DRIVEN EXPERIENCE ENGINE (v5.0 Revisão Estratégica)
 * ============================================================================
 * - Zero telas de bloqueio: Carrega e exibe título + CTA no primeiro milissegundo.
 * - Linguagem 100% voltada ao dono de pequenos e médios negócios.
 * - 8 etapas contínuas com transições sem sobreposição (deadband gaps).
 * - Scrub fluido de vídeo com proteção contra congelamento (watchdog de 100ms).
 * - Suporte a prefers-reduced-motion e dispositivos móveis simples.
 * ============================================================================
 */

const HERO_SCROLL_CONFIG = {
  video: {
    desktopSrc: 'assets/video/hero-desktop.mp4',
    mobileSrc: 'assets/video/hero-mobile.mp4',
    legacySrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    posterSvg: 'assets/video/hero-poster.svg',
    fallbackDuration: 24,
    lerpFactor: 0.10,      // suavidade no desktop
    mobileLerpFactor: 0.16 // agilidade no mobile
  },

  scroll: {
    desktopHeight: '520vh',
    mobileHeight: '400vh'
  },

  acts: [
    { id: 1, label: '1 · Começo', targetProgress: 0.15 },
    { id: 2, label: '2 · Como funciona', targetProgress: 0.55 },
    { id: 3, label: '3 · Resultado', targetProgress: 0.88 }
  ],

  // 8 Etapas da Jornada com margens deliberadas de respiro (gaps) para evitar qualquer sobreposição
  steps: [
    {
      id: 'step-opening',
      act: 1,
      minProgress: 0.00,
      maxProgress: 0.06,  // Sai completamente aos 6%
      position: 'bottom-center',
      showScrollHint: true,
      badge: null,
      title: 'Leve o seu negócio ao topo da sua região.',
      subtitle: 'Anúncios, conteúdo e atendimento no WhatsApp para pequenos e médios negócios venderem mais.'
    },
    // GAP: 0.06 -> 0.09 (Respiro total: H1 e hint 100% ocultos, centro livre)
    {
      id: 'step-entender',
      act: 1,
      minProgress: 0.09,  // Entra aos 9%
      maxProgress: 0.18,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'Passo 1',
      title: 'Primeiro, entendemos o seu cliente.',
      subtitle: 'Olhamos o seu mercado, os seus concorrentes e por que o cliente da sua região escolhe você, ou o vizinho.'
    },
    // GAP: 0.18 -> 0.21 (Respiro)
    {
      id: 'step-encontrado',
      act: 1,
      minProgress: 0.21,
      maxProgress: 0.31,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'Passo 2',
      title: 'Depois, fazemos você ser encontrado.',
      subtitle: 'Anúncios e conteúdo para mais gente da sua cidade conhecer e procurar o seu negócio.'
    },
    // GAP: 0.31 -> 0.34 (Respiro)
    {
      id: 'step-acompanhado',
      act: 2,
      minProgress: 0.34,
      maxProgress: 0.45,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'Passo 3',
      title: 'Cada real investido é acompanhado.',
      subtitle: 'Você vê quanto gastou, quantos clientes chegaram e quanto vendeu. Sem número bonito que não vira venda.'
    },
    // GAP: 0.45 -> 0.48 (Respiro)
    {
      id: 'step-hyperkav',
      act: 2,
      minProgress: 0.48,
      maxProgress: 0.59,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'Passo 4',
      title: 'O HyperKav é o nosso jeito de cuidar do seu dinheiro.',
      subtitle: 'Acompanhamos tudo todos os dias e ajustamos o que não está dando resultado.'
    },
    // GAP: 0.59 -> 0.62 (Respiro)
    {
      id: 'step-atendimento',
      act: 2,
      minProgress: 0.62,
      maxProgress: 0.73,
      position: 'bottom-right',
      showScrollHint: false,
      badge: 'Passo 5',
      title: 'E ninguém fica sem resposta.',
      subtitle: 'Atendimento com inteligência artificial no WhatsApp: responde em segundos, de dia ou de madrugada, e passa para a sua equipe fechar a venda.'
    },
    // GAP: 0.73 -> 0.76 (Respiro)
    {
      id: 'step-prova',
      act: 3,
      minProgress: 0.76,
      maxProgress: 0.88,
      position: 'bottom-left',
      showScrollHint: false,
      badge: 'Passo 6',
      title: 'Cada R$ 1 investido virou R$ 6,50.',
      subtitle: 'Foi o que fizemos com a Almeida Cestas. Com a PontoCar, +7 mil contatos no WhatsApp e o faturamento dobrou.'
    },
    // GAP: 0.88 -> 0.91 (Respiro)
    {
      id: 'step-final',
      act: 3,
      minProgress: 0.91,
      maxProgress: 1.01,
      position: 'bottom-center',
      showScrollHint: false,
      badge: 'Resultado',
      title: 'Vamos levar o seu negócio ao topo?',
      subtitle: 'Análise gratuita do seu negócio, sem compromisso.'
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

    // Fila de seek precisa com proteção contra travamento (Watchdog)
    this.isSeeking = false;
    this.pendingSeekTime = null;
    this.lastRenderedTime = -1;
    this.seekWatchdog = null;

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
      // Sem scrub: o hero vira conteúdo estático, então o menu real já fica disponível
      document.body.classList.add('chrome-visible');
    }
  }

  applySectionHeight() {
    const isMobile = window.innerWidth <= 768;
    this.section.style.height = isMobile 
      ? this.config.scroll.mobileHeight 
      : this.config.scroll.desktopHeight;
  }

  setupVideoEvents() {
    if (!this.video) return;

    // Atributos vitais para autoplay inline no iOS / WebKit
    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    // Se o elemento não tiver uma fonte válida ativa, carrega o arquivo principal confirmado (HTTP 200)
    if (!this.video.src || this.video.src === '') {
      this.video.src = this.config.video.legacySrc;
    }

    // Libera a fila de seek quando o frame foi decodificado
    const onSeekComplete = () => {
      this.isSeeking = false;
      if (this.seekWatchdog) {
        clearTimeout(this.seekWatchdog);
        this.seekWatchdog = null;
      }
      if (this.pendingSeekTime !== null) {
        const nextTime = this.pendingSeekTime;
        this.pendingSeekTime = null;
        this.applyDirectSeek(nextTime);
      }
    };

    this.video.addEventListener('seeked', onSeekComplete);

    // Eventos que indicam espera ou interrupção: NUNCA deixa isSeeking preso em true!
    ['waiting', 'stalled', 'abort', 'suspend'].forEach(evt => {
      this.video.addEventListener(evt, () => {
        if (this.isSeeking && !this.seekWatchdog) {
          this.seekWatchdog = setTimeout(() => {
            this.isSeeking = false;
            this.seekWatchdog = null;
          }, 80);
        }
      });
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
      }
    };
    this.video.addEventListener('progress', onBufferProgress);

    // Ativação IMEDIATA assim que os metadados existirem (duração conhecida)
    const onMetadataReady = () => {
      if (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0) {
        this.videoDuration = this.video.duration;
        this.isVideoReady = true;
        this.log(`Vídeo pronto. Duração: ${this.videoDuration.toFixed(2)}s | readyState: ${this.video.readyState}`);

        // Aquece o decodificador no primeiro milissegundo
        try {
          if (this.video.currentTime === 0) {
            this.video.currentTime = 0.001;
          }
        } catch (e) {}
      }
    };

    this.video.addEventListener('loadedmetadata', onMetadataReady);
    this.video.addEventListener('loadeddata', onMetadataReady);
    this.video.addEventListener('canplay', onMetadataReady);
    this.video.addEventListener('canplaythrough', onMetadataReady);

    if (this.video.readyState >= 1) {
      onMetadataReady();
    }

    // Tratamento de falhas de rede resiliente
    this.video.addEventListener('error', (e) => {
      this.log('Falha de carregamento no vídeo:', e);
      if (this.video.src && this.video.src.indexOf('Untitled_Scene') === -1) {
        this.log('Redirecionando para o vídeo principal...');
        this.video.src = this.config.video.legacySrc;
        try { this.video.load(); } catch (err) {}
      } else {
        this.activateFallbackMode();
      }
    });

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
   * MOTOR DE SCRUB PRECISO E FLUIDO (Zero Congelamento)
   */
  updateVideoFrame(progress) {
    if (!this.video) return;

    const duration = (this.video.duration && !isNaN(this.video.duration) && this.video.duration > 0)
      ? this.video.duration
      : this.videoDuration;

    if (!duration || duration <= 0) return;

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

      // Watchdog de segurança: NUNCA permite que isSeeking fique travado em true por mais de 100ms
      if (this.seekWatchdog) {
        clearTimeout(this.seekWatchdog);
      }
      this.seekWatchdog = setTimeout(() => {
        if (this.isSeeking) {
          this.isSeeking = false;
          this.seekWatchdog = null;
          if (this.pendingSeekTime !== null) {
            const next = this.pendingSeekTime;
            this.pendingSeekTime = null;
            this.applyDirectSeek(next);
          }
        }
      }, 100);

      try {
        if ('fastSeek' in this.video) {
          this.video.fastSeek(targetTime);
        } else {
          this.video.currentTime = targetTime;
        }
      } catch (e) {
        this.isSeeking = false;
      }
    } else {
      // Guarda a última posição solicitada pelo usuário durante a rolagem
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

    // Identificar passo ativo respeitando as margens de respiro (gaps)
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
    // Menu real (topo fixo) só entra no fim do vídeo; nas telas anteriores existe apenas o menu imersivo
    const chromeVisible = progress > 0.95;
    document.body.classList.toggle('chrome-visible', chromeVisible);
    const header = document.getElementById('header');
    if (header) {
      header.classList.toggle('header-scrolled-past', chromeVisible);
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
