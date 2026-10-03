/**
 * ============================================================================
 * KAV — EXPERIÊNCIA INTEGRADA (ABERTURA PLANETA + JORNADA SCROLL)
 * ============================================================================
 * Gerencia a experiência contínua e imersiva:
 * - Abertura cinematográfica (planeta, logo flutuante e frase)
 * - Transição suave (mergulho/zoom do planeta para a jornada)
 * - Scrub fluido do vídeo da jornada atrelado à rolagem
 * - Etapas cronológicas rigorosamente individuais (1 visível por vez)
 * ============================================================================
 */

const EXPERIENCE_CONFIG = {
  // Frase padrão da abertura e alternativas configuráveis
  phrase: "De cima, tudo faz mais sentido.",
  alternativePhrases: [
    "O seu mercado visto de cima.",
    "Todo grande negócio já foi um ponto no mapa.",
    "Do seu ponto no mapa ao topo.",
    "Vamos olhar o seu negócio de outro ângulo."
  ],

  // Tempos da Abertura Cinematográfica (em milissegundos)
  intro: {
    duration: 3000,
    logoStart: 1000,
    phraseStart: 1600,
    logoFloatStart: 1800,
    cueStart: 3000,
    maxWait: 2500
  },

  // Linha do tempo de scroll da jornada integrada (progresso normalizado 0 a 1)
  timeline: {
    // 0 a 0.08: Transição e mergulho do planeta para o início da jornada
    transitionEnd: 0.08,

    // Etapas da Jornada (Cronológicas, EXATAMENTE 1 bloco visível por vez)
    steps: [
      {
        id: 'step-1',
        act: 1,
        actLabel: '1 · Começo',
        minProgress: 0.08,
        maxProgress: 0.35,
        targetScroll: 0.18,
        position: 'bottom-left',
        badge: 'Passo 1',
        title: 'Primeiro, entendemos o seu cliente.',
        subtitle: 'Olhamos o seu mercado, os seus concorrentes e por que o cliente da sua região escolhe você, ou o vizinho.'
      },
      {
        id: 'step-2',
        act: 2,
        actLabel: '2 · Como funciona',
        minProgress: 0.38, // Gap de respiro: 0.35 a 0.38 garante que Step 1 sai antes de Step 2 entrar
        maxProgress: 0.68,
        targetScroll: 0.52,
        position: 'bottom-right',
        badge: 'Passo 2',
        title: 'Depois, fazemos você ser encontrado.',
        subtitle: 'Anúncios e conteúdo para mais gente da sua cidade conhecer e procurar o seu negócio. Cada real investido é acompanhado para você ver quanto gastou, quantos clientes chegaram e quanto vendeu.'
      },
      {
        id: 'step-3',
        act: 3,
        actLabel: '3 · Resultado',
        minProgress: 0.72, // Gap de respiro: 0.68 a 0.72 garante que Step 2 sai antes de Step 3 entrar
        maxProgress: 1.00,
        targetScroll: 0.88,
        position: 'bottom-center',
        badge: 'Resultado',
        title: 'Vamos levar o seu negócio ao topo?',
        subtitle: 'Análise gratuita do seu negócio, sem compromisso.',
        hasCta: true
      }
    ],

    // Pílulas de Navegação HUD Superior
    acts: [
      { id: 1, label: '1 · Começo', targetProgress: 0.18 },
      { id: 2, label: '2 · Como funciona', targetProgress: 0.52 },
      { id: 3, label: '3 · Resultado', targetProgress: 0.88 }
    ]
  },

  // Caminhos dos Assets
  assets: {
    introVideoMp4: 'assets/video/intro-planeta.mp4',
    journeyVideoMp4: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    logoSvg: 'assets/img/kav-logo-branco.svg'
  },

  debug: false
};

class KavIntegratedExperience {
  constructor(containerId = 'experience') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.stage = this.container.querySelector('.experience__stage');
    this.introVideo = document.getElementById('introVideo');
    this.journeyVideo = document.getElementById('journeyVideo');
    this.overlayIntro = this.container.querySelector('.overlay-intro');
    this.introPhrase = this.container.querySelector('.intro-phrase');
    this.overlaySteps = this.container.querySelector('.overlay-steps');
    this.scrollCue = this.container.querySelector('.scroll-cue');
    this.progressFill = this.container.querySelector('.exp-progress-fill');
    this.progressPercent = this.container.querySelector('.progress-percent-val');
    this.actBtns = this.container.querySelectorAll('.act-pill-btn');
    this.stepCards = this.container.querySelectorAll('.exp-story-step');

    this.isIntroCompleted = false;
    this.timeouts = [];
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  log(...args) {
    if (EXPERIENCE_CONFIG.debug) {
      console.log('[KavExperience]', ...args);
    }
  }

  init() {
    // 1. Configurar texto da frase a partir de EXPERIENCE_CONFIG
    if (this.introPhrase && EXPERIENCE_CONFIG.phrase) {
      this.introPhrase.textContent = EXPERIENCE_CONFIG.phrase;
    }

    // 2. Verificar se a intro já foi vista na sessão atual
    let hasSeenIntro = false;
    try {
      hasSeenIntro = sessionStorage.getItem('kav_intro_completed') === 'true';
    } catch (e) {
      hasSeenIntro = false;
    }

    if (this.isReducedMotion || hasSeenIntro) {
      this.log('Modo direto ativado (sessão anterior ou prefers-reduced-motion).');
      this.fastForwardIntro();
    } else {
      this.startIntroSequence();
    }

    // 3. Inicializar controle de rolagem e scrub
    this.bindEvents();
    this.startRenderLoop();
  }

  startIntroSequence() {
    if (!this.introVideo) {
      this.fastForwardIntro();
      return;
    }

    this.introVideo.muted = true;
    this.introVideo.playsInline = true;

    // Iniciar reprodução do vídeo do planeta
    const playPromise = this.introVideo.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.log('Reprodução do vídeo de introdução iniciada.');
          this.scheduleChoreography();
        })
        .catch((err) => {
          this.log('Autoplay bloqueado pelo navegador:', err);
          this.fastForwardIntro();
        });
    }

    // Watchdog de segurança para conexões lentas
    const watchdog = setTimeout(() => {
      if (!this.isIntroCompleted && (!this.introVideo || this.introVideo.readyState < 3)) {
        this.log('Watchdog de segurança acionado.');
        this.fastForwardIntro();
      }
    }, EXPERIENCE_CONFIG.intro.maxWait);
    this.timeouts.push(watchdog);
  }

  scheduleChoreography() {
    const { intro } = EXPERIENCE_CONFIG;

    // 1000ms: Entrada suave do Logo
    const tLogo = setTimeout(() => {
      if (this.isIntroCompleted) return;
      if (this.overlayIntro) this.overlayIntro.classList.add('logo-visible');
    }, intro.logoStart);
    this.timeouts.push(tLogo);

    // 1600ms: Entrada da Frase com blur-in
    const tPhrase = setTimeout(() => {
      if (this.isIntroCompleted) return;
      if (this.overlayIntro) this.overlayIntro.classList.add('phrase-visible');
    }, intro.phraseStart);
    this.timeouts.push(tPhrase);

    // 1800ms: Início da flutuação suave do logo
    const tFloat = setTimeout(() => {
      if (this.isIntroCompleted) return;
      if (this.overlayIntro) this.overlayIntro.classList.add('logo-floating');
    }, intro.logoFloatStart);
    this.timeouts.push(tFloat);

    // 3000ms: Fim do vídeo, congelamento no último frame e exibição do indicador de scroll
    const tEnd = setTimeout(() => {
      if (this.isIntroCompleted) return;
      this.freezeIntroAndShowCue();
    }, intro.duration);
    this.timeouts.push(tEnd);
  }

  freezeIntroAndShowCue() {
    this.isIntroCompleted = true;
    if (this.introVideo) {
      try {
        this.introVideo.pause();
      } catch (e) {}
    }

    if (this.overlayIntro) {
      this.overlayIntro.classList.add('logo-visible', 'phrase-visible', 'logo-floating');
    }
    if (this.scrollCue) {
      this.scrollCue.classList.add('is-visible');
    }

    try {
      sessionStorage.setItem('kav_intro_completed', 'true');
    } catch (e) {}
  }

  fastForwardIntro() {
    this.isIntroCompleted = true;
    this.clearAllTimeouts();

    if (this.introVideo) {
      try {
        this.introVideo.currentTime = this.introVideo.duration || 3;
        this.introVideo.pause();
      } catch (e) {}
    }

    if (this.overlayIntro) {
      this.overlayIntro.classList.add('logo-visible', 'phrase-visible', 'logo-floating');
    }
    if (this.scrollCue) {
      this.scrollCue.classList.add('is-visible');
    }

    try {
      sessionStorage.setItem('kav_intro_completed', 'true');
    } catch (e) {}
  }

  clearAllTimeouts() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  bindEvents() {
    // Clique no cue "Role para começar" rola suavemente até o início da etapa 1
    if (this.scrollCue) {
      this.scrollCue.addEventListener('click', () => {
        this.scrollToProgress(0.12);
      });
    }

    // Pílulas de Navegação (Começo, Como funciona, Resultado)
    this.actBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actId = parseInt(btn.getAttribute('data-act'), 10);
        const actData = EXPERIENCE_CONFIG.timeline.acts.find(a => a.id === actId);
        if (actData) {
          this.scrollToProgress(actData.targetProgress);
        }
      });
    });

    // Listener de Scroll da Janela
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });

    this.handleScroll();
  }

  handleScroll() {
    const rect = this.container.getBoundingClientRect();
    const containerHeight = this.container.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = containerHeight - windowHeight;

    if (scrollableDistance <= 0) return;

    // Se o usuário rolou nos primeiros instantes, conclui a intro imediatamente
    if (!this.isIntroCompleted && window.scrollY > 15) {
      this.fastForwardIntro();
    }

    const scrolled = -rect.top;
    this.targetProgress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
  }

  scrollToProgress(prog) {
    const containerTop = this.container.offsetTop;
    const containerHeight = this.container.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = containerHeight - windowHeight;

    const targetY = containerTop + (prog * scrollableDistance);
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }

  startRenderLoop() {
    const render = () => {
      // Interpolação suave (lerp) para scrub perfeito sem engasgos
      const lerp = 0.12;
      this.currentProgress += (this.targetProgress - this.currentProgress) * lerp;

      if (Math.abs(this.targetProgress - this.currentProgress) < 0.0005) {
        this.currentProgress = this.targetProgress;
      }

      this.updateVisuals(this.currentProgress);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  updateVisuals(progress) {
    const { transitionEnd } = EXPERIENCE_CONFIG.timeline;

    // =========================================================================
    // 1. TRANSIÇÃO PLANETA -> JORNADA (0 a transitionEnd: ~8%)
    // =========================================================================
    if (progress <= transitionEnd) {
      const transNorm = progress / transitionEnd; // 0 a 1

      // Zoom sutil do planeta (escala 1 -> 1.08)
      const planetScale = 1 + (transNorm * 0.08);
      if (this.introVideo) {
        this.introVideo.style.transform = `translateZ(0) scale(${planetScale})`;
        this.introVideo.style.opacity = Math.max(0, 1 - (transNorm * 1.2));
      }

      // Crossfade de entrada para o vídeo da jornada
      if (this.journeyVideo) {
        this.journeyVideo.style.opacity = Math.min(1, transNorm * 1.2);
      }

      // Desaparecimento suave do logo e da frase (100% invisíveis aos 6% de scroll)
      if (this.overlayIntro) {
        const introOpacity = Math.max(0, 1 - (progress * 16));
        const introTranslateY = -(progress * 300);
        this.overlayIntro.style.opacity = introOpacity;
        this.overlayIntro.style.transform = `translateZ(0) translateY(${introTranslateY}px)`;
        this.overlayIntro.style.pointerEvents = introOpacity > 0.1 ? 'auto' : 'none';
      }

      // Ocultar imediatamente o cue de scroll ao rolar
      if (this.scrollCue) {
        const cueOpacity = Math.max(0, 1 - (progress * 25));
        this.scrollCue.style.opacity = cueOpacity;
        this.scrollCue.style.pointerEvents = cueOpacity > 0.1 ? 'auto' : 'none';
      }

      // Overlay das etapas oculto na abertura
      if (this.overlaySteps) {
        this.overlaySteps.classList.remove('active');
      }

    } else {
      // Após a transição (progress > transitionEnd):
      if (this.introVideo) {
        this.introVideo.style.opacity = '0';
      }
      if (this.journeyVideo) {
        this.journeyVideo.style.opacity = '1';
      }
      if (this.overlayIntro) {
        this.overlayIntro.style.opacity = '0';
        this.overlayIntro.style.pointerEvents = 'none';
      }
      if (this.scrollCue) {
        this.scrollCue.style.opacity = '0';
        this.scrollCue.style.pointerEvents = 'none';
      }
      if (this.overlaySteps) {
        this.overlaySteps.classList.add('active');
      }
    }

    // =========================================================================
    // 2. SCRUB DO VÍDEO DA JORNADA (progress de transitionEnd a 1.0)
    // =========================================================================
    if (this.journeyVideo && this.journeyVideo.duration && progress >= transitionEnd) {
      const journeyNorm = (progress - transitionEnd) / (1.0 - transitionEnd);
      const targetTime = journeyNorm * this.journeyVideo.duration;

      // Atualiza apenas se a diferença for perceptível para poupar CPU
      if (Math.abs(this.journeyVideo.currentTime - targetTime) > 0.04) {
        this.journeyVideo.currentTime = targetTime;
      }
    }

    // =========================================================================
    // 3. PROGRESSO VISUAL E ATUALIZAÇÃO DO HUD SUPERIOR
    // =========================================================================
    const displayProgress = Math.round(progress * 100);
    if (this.progressFill) {
      this.progressFill.style.width = `${displayProgress}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${displayProgress}%`;
    }

    // Identificar ato ativo para acender a pílula correspondente
    let currentAct = 1;
    if (progress > 0.35 && progress <= 0.70) currentAct = 2;
    if (progress > 0.70) currentAct = 3;

    this.actBtns.forEach(btn => {
      const btnAct = parseInt(btn.getAttribute('data-act'), 10);
      btn.classList.toggle('active', btnAct === currentAct);
    });

    // =========================================================================
    // 4. EXATAMENTE 1 BLOCO DE ETAPA VISÍVEL POR VEZ (COM GAPS DE RESPIRO)
    // =========================================================================
    EXPERIENCE_CONFIG.timeline.steps.forEach(step => {
      const el = document.getElementById(step.id);
      if (!el) return;

      const shouldBeVisible = (progress >= step.minProgress && progress <= step.maxProgress);
      el.classList.toggle('is-visible', shouldBeVisible);
    });
  }
}

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new KavIntegratedExperience('experience');
});
