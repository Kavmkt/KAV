/**
 * ============================================================================
 * KAV + HYPERKAV — HERO SCROLL-DRIVEN EXPERIENCE ENGINE
 * ============================================================================
 * Desenvolvido no padrão de engenharia de interação de alta fidelidade
 * (Apple, Stripe, Linear, Awwwards).
 *
 * O tempo e os frames do vídeo 3D avançam estritamente sincronizados ao scroll
 * do usuário, com suavização por interpolação (lerp) via requestAnimationFrame.
 *
 * Configurado especificamente para o arquivo:
 * 'Untitled_Scene_10-03_00_51_11_20261002215523.mp4' e 'hero-scroll.mp4'.
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * 1. ARQUIVO DE CONFIGURAÇÃO (EDITE AQUI SEM MEXER NA LÓGICA)
 * ----------------------------------------------------------------------------
 */
const HERO_SCROLL_CONFIG = {
  // Configuração dos arquivos de mídia
  video: {
    // Caminho primário: nome exato do arquivo renderizado enviado
    src: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    // Caminho secundário: nome padrão limpo caso renomeado
    altSrc: 'assets/video/hero-scroll.mp4',
    // Imagem do primeiro frame / poster de abertura instantânea
    poster: 'assets/video/hero-poster.svg',
    // Duração estimada em segundos (usada caso os metadados do vídeo demorem)
    fallbackDuration: 24,
    // Fator de suavização lerp (entre 0.04 e 0.12 - quanto menor, mais cinematográfico)
    lerpFactor: 0.08,
    // Fator de suavização para dispositivos móveis
    mobileLerpFactor: 0.12
  },

  // Altura da seção de scroll (define a quantidade de rolagem)
  scroll: {
    desktopHeight: '520vh', // ~100vh para cada 5s de vídeo
    mobileHeight: '380vh'   // Menor no mobile para rolagem fluida no polegar
  },

  // Marcadores dos 3 Atos (indicadores clicáveis no HUD superior)
  acts: [
    { id: 1, label: '1 · Início', targetProgress: 0.14 },
    { id: 2, label: '2 · Núcleo HyperKav', targetProgress: 0.56 },
    { id: 3, label: '3 · O Topo', targetProgress: 0.88 }
  ],

  // Faixas de scroll e textos de storytelling sincronizados com os 3 Atos
  // IMPORTANTE: Cada texto fica na lateral ou no terço inferior, NUNCA no centro.
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
  ],

  // Links e Placeholders de Ação
  placeholders: {
    // [PLACEHOLDER] Link de contato / WhatsApp
    primaryCtaText: 'Falar com a Kav',
    primaryCtaLink: '#diagnostico',
    // [PLACEHOLDER] Link para a seção do Núcleo HyperKav
    secondaryCtaText: 'Conhecer o HyperKav',
    secondaryCtaLink: '#hyperkav'
  }
};

/**
 * ----------------------------------------------------------------------------
 * 2. CLASSE CONTROLADORA DA EXPERIÊNCIA HERO SCROLL-DRIVEN
 * ----------------------------------------------------------------------------
 */
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

    this.init();
  }

  init() {
    // 1. Detectar preferência por movimento reduzido (Acessibilidade)
    this.checkReducedMotion();

    // 2. Ajustar altura da seção de scroll
    this.applySectionHeight();

    // 3. Inicializar vídeo e fallbacks
    this.setupVideo();

    // 4. Configurar eventos de scroll, redimensionamento e cliques
    this.setupEventListeners();

    // 5. Iniciar loop de renderização (rAF)
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

    this.video.defaultMuted = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.disablePictureInPicture = true;

    // Se o elemento não tiver src explícito, associar o caminho primário do render
    if (!this.video.currentSrc && !this.video.src) {
      this.video.src = this.config.video.src;
    }

    // Callback disparado quando os dados do vídeo estão prontos
    const onVideoReady = () => {
      this.isVideoReady = true;
      if (this.video.duration && !isNaN(this.video.duration)) {
        this.videoDuration = this.video.duration;
      }
      
      // Se estava em modo fallback temporário, restaura o vídeo em tela cheia
      if (this.useCanvasFallback) {
        this.useCanvasFallback = false;
        if (this.canvas) this.canvas.style.display = 'none';
        this.video.style.display = 'block';
      }
      
      this.hideLoader();
    };

    this.video.addEventListener('loadedmetadata', onVideoReady);
    this.video.addEventListener('loadeddata', onVideoReady);
    this.video.addEventListener('canplay', onVideoReady);
    this.video.addEventListener('canplaythrough', onVideoReady);

    // Fallback inteligente para caminho alternativo
    let triedAlt = false;
    const handleError = () => {
      if (!triedAlt && this.config.video.altSrc) {
        triedAlt = true;
        this.video.src = this.config.video.altSrc;
        try {
          this.video.load();
        } catch (e) {
          console.warn(e);
        }
        return;
      }
      // Se nem o alternativo existir localmente, ativa o canvas procedural sem quebrar a UI
      this.activateCanvasFallback();
      this.hideLoader();
    };

    this.video.addEventListener('error', handleError);

    // Timeout de tolerância de 5 segundos para conexões mais lentas
    setTimeout(() => {
      if (!this.isVideoReady && !this.useCanvasFallback) {
        this.activateCanvasFallback();
        this.hideLoader();
      }
    }, 5000);

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
        this.loader.style.display = 'none';
      }, 400);
    }
  }

  setupEventListeners() {
    // Scroll passivo para garantir 60fps/120fps (sem lag de layout)
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    // Redimensionamento de janela
    window.addEventListener('resize', () => {
      this.applySectionHeight();
      if (this.useCanvasFallback && this.resizeCanvas) {
        this.resizeCanvas();
      }
    });

    // Cliques nos botões dos Atos (rolar até o momento exato do vídeo)
    this.actButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const actId = parseInt(btn.dataset.act, 10);
        const actConfig = this.config.acts.find(a => a.id === actId);
        if (actConfig) {
          this.scrollToProgress(actConfig.targetProgress);
        }
      });
    });

    // Clique no indicador de scroll para iniciar a descida
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

    // Progresso relativo normalizado entre 0 e 1
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

        // Atualizar vídeo de forma contínua e sem jitter
        this.updateVideoScrub(this.smoothProgress);

        // Se o canvas fallback estiver ativo, desenha o frame procedural
        if (this.useCanvasFallback && this.drawCanvasFrame) {
          this.drawCanvasFrame(this.smoothProgress);
        }

        // Sincronizar textos, progresso HUD e Atos
        this.updateStoryUI(this.smoothProgress);
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  updateVideoScrub(progress) {
    if (!this.video || !this.isVideoReady || this.useCanvasFallback) return;

    const targetTime = progress * this.videoDuration;

    // Evita chamadas desnecessárias se o delta de tempo for desprezível
    if (Math.abs(this.video.currentTime - targetTime) > 0.02) {
      if (typeof this.video.fastSeek === 'function') {
        try {
          this.video.fastSeek(targetTime);
        } catch (e) {
          this.video.currentTime = targetTime;
        }
      } else {
        this.video.currentTime = targetTime;
      }
    }
  }

  updateStoryUI(progress) {
    // 1. Atualizar barra e percentual do progresso
    const percentInt = Math.round(progress * 100);
    if (this.progressFill) {
      this.progressFill.style.width = `${progress * 100}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${percentInt}%`;
    }

    // 2. Determinar o passo de texto ativo
    const activeStep = this.config.steps.find((step) => {
      return progress >= step.minProgress && progress < step.maxProgress;
    }) || this.config.steps[this.config.steps.length - 1];

    if (activeStep && activeStep.id !== this.currentStepId) {
      this.currentStepId = activeStep.id;

      // Alternar classes ativas com animação suave de opacidade e translação
      this.textSteps.forEach((el) => {
        const isCurrent = el.dataset.stepId === activeStep.id;
        el.classList.toggle('active', isCurrent);
      });
    }

    // 3. Atualizar o Ato ativo (1, 2 ou 3)
    if (activeStep && activeStep.act !== this.currentActId) {
      this.currentActId = activeStep.act;
      this.actButtons.forEach((btn) => {
        const btnAct = parseInt(btn.dataset.act, 10);
        btn.classList.toggle('active', btnAct === activeStep.act);
      });
    }

    // 4. Mostrar/ocultar dica de scroll (some a partir de 7% de rolagem)
    if (this.scrollHint) {
      this.scrollHint.style.opacity = progress > 0.07 ? '0' : '1';
      this.scrollHint.style.pointerEvents = progress > 0.07 ? 'none' : 'auto';
    }

    // 5. Controlar background do header ao ultrapassar a hero
    const header = document.getElementById('header');
    if (header) {
      if (progress > 0.95) {
        header.classList.add('header-scrolled-past');
      } else {
        header.classList.remove('header-scrolled-past');
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 3. RENDERIZADOR PROCEDURAL CANVAS 3D (FALLBACK RESILIENTE)
   * --------------------------------------------------------------------------
   * Garante visual cinematográfico em azul-marinho (#0A1633), laranja neon
   * (#FF6A1A) e ciano (#6FD3FF) caso o arquivo de vídeo ainda não esteja no servidor.
   */
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

      // Fundo azul-marinho profundo cinematográfico
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h));
      bgGrad.addColorStop(0, '#102244');
      bgGrad.addColorStop(0.5, '#0A1633');
      bgGrad.addColorStop(1, '#050B1A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid de perspectiva 3D em wireframe
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

      // Linhas transversais com deslocamento baseado no progresso
      const gridOffset = (progress * 180) % 50;
      for (let y = vpY + 30; y <= h; y += 45 + ((y - vpY) * 0.15)) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset * 0.3);
        ctx.lineTo(w, y + gridOffset * 0.3);
        ctx.stroke();
      }
      ctx.restore();

      // Prédios / Comércios concorrentes (em tons de azul escuro)
      ctx.save();
      ctx.fillStyle = 'rgba(14, 35, 71, 0.7)';
      ctx.strokeStyle = 'rgba(28, 61, 115, 0.6)';
      ctx.lineWidth = 1.5;

      const buildingPositions = [
        { x: cx - 380, w: 90, h: 180 },
        { x: cx - 220, w: 80, h: 220 },
        { x: cx - 110, w: 70, h: 150 },
        { x: cx + 120, w: 85, h: 210 },
        { x: cx + 240, w: 100, h: 260 },
        { x: cx + 370, w: 80, h: 170 }
      ];

      buildingPositions.forEach((b) => {
        const by = vpY + 60;
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeRect(b.x, by, b.w, b.h);
      });
      ctx.restore();

      // Rastro de Luz Neon Laranja da Kav em Ação (Coração do Storytelling)
      ctx.save();
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#FF6A1A';
      ctx.strokeStyle = '#FF6A1A';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      ctx.beginPath();
      // O rastro nasce do pequeno negócio (à esquerda/baixo) e sobe até o topo
      const startX = cx - 240;
      const startY = h - 160;

      ctx.moveTo(startX, startY);

      // Trajetória calculada por curva Bézier controlada pelo progresso
      const curX = startX + (progress * 480);
      const curY = startY - (Math.pow(progress, 1.4) * (h - 260));

      ctx.quadraticCurveTo(
        cx - 50 + (progress * 80),
        startY - 120 - (progress * 150),
        curX,
        curY
      );
      ctx.stroke();

      // Cabeça do rastro de luz pulsante (A Kav guiando o cliente)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(curX, curY, 8 + Math.sin(progress * 20) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFA048';
      ctx.beginPath();
      ctx.arc(curX, curY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Núcleo HyperKav no centro (emerge no Ato 2: 35% a 80%)
      if (progress >= 0.30) {
        ctx.save();
        const coreAlpha = Math.min(1, (progress - 0.30) * 3);
        ctx.globalAlpha = coreAlpha;
        ctx.translate(cx, vpY);

        // Anel orbital de dados
        ctx.strokeStyle = '#6FD3FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 90, 35, progress * 4, 0, Math.PI * 2);
        ctx.stroke();

        // Núcleo geométrico HyperKav
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF6A1A';
        ctx.fillStyle = '#FF6A1A';
        ctx.beginPath();
        ctx.arc(0, 0, 22 + Math.sin(progress * 15) * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Rampa ascendente de luz ao topo (Ato 3: 80% a 100%)
      if (progress >= 0.78) {
        ctx.save();
        const topAlpha = Math.min(1, (progress - 0.78) * 4);
        ctx.globalAlpha = topAlpha;
        const beamGrad = ctx.createLinearGradient(cx, cy, cx, 0);
        beamGrad.addColorStop(0, 'rgba(255, 106, 26, 0.4)');
        beamGrad.addColorStop(1, 'rgba(111, 211, 255, 0.8)');
        ctx.fillStyle = beamGrad;
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx, 0);
        ctx.lineTo(cx + 30, cy);
        ctx.fill();
        ctx.restore();
      }
    };
  }
}

// Inicializar automaticamente ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  window.kavHeroExperience = new KavHeroScrollExperience('heroScrollSection', HERO_SCROLL_CONFIG);
});
