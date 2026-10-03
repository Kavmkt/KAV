/**
 * ============================================================================
 * KAV — ABERTURA PLANETA (INTRO CONTROLLER)
 * ============================================================================
 * Abertura cinematográfica de ~3 segundos com visão da Terra vista do espaço,
 * logo Kav branco flutuante e frase de boas-vindas com transição contínua
 * para o hero da jornada.
 * ============================================================================
 */

const INTRO_CONFIG = {
  // Frase de abertura padrão e alternativas configuráveis
  phrase: "De cima, tudo faz mais sentido.",
  alternativePhrases: [
    "O seu mercado visto de cima.",
    "Todo grande negócio já foi um ponto no mapa.",
    "Do seu ponto no mapa ao topo.",
    "Vamos olhar o seu negócio de outro ângulo."
  ],

  // Tempos em milissegundos
  timings: {
    videoDuration: 3000,
    logoStart: 1000,
    logoEnd: 1800,
    phraseStart: 1600,
    phraseEnd: 2600,
    cueStart: 3000,
    maxVideoWait: 2500,     // Limite para acionar fallback estático se o vídeo demorar
    quickEntryDuration: 600 // Duração da animação rápida no fallback
  },

  // Flutuação contínua do logo
  floating: {
    distanceY: 6, // ±6px
    cycleDuration: 6000 // 6000ms = 6s
  },

  // Posições percentuais de referência
  layout: {
    logoTopPercent: 40,
    phraseTopPercent: 58,
    safeZoneWidthPercent: 60
  },

  // Caminhos dos assets
  assets: {
    videoMp4: 'assets/video/intro-planeta.mp4',
    videoWebm: 'assets/video/intro-planeta.webm',
    posterSvg: 'assets/video/intro-poster.svg',
    posterJpg: 'assets/video/intro-poster.jpg',
    posterWebp: 'assets/video/intro-poster.webp',
    logoSvg: 'assets/img/kav-logo-branco.svg'
  },

  // Modo debug (desligado em produção para manter o console limpo)
  debug: false
};

class KavIntroExperience {
  constructor(sectionId = 'intro') {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.video = this.section.querySelector('.intro__video');
    this.posterBg = this.section.querySelector('.intro__poster-bg');
    this.content = this.section.querySelector('.intro__content');
    this.logo = this.section.querySelector('.intro__logo');
    this.phrase = this.section.querySelector('.intro__phrase');
    this.cue = this.section.querySelector('.intro__cue');

    this.isCompleted = false;
    this.hasUserScrolled = false;
    this.timeouts = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  log(...args) {
    if (INTRO_CONFIG.debug) {
      console.log('[KavIntro]', ...args);
    }
  }

  init() {
    // 1. Atualizar o texto da frase a partir do INTRO_CONFIG
    if (this.phrase && INTRO_CONFIG.phrase) {
      this.phrase.textContent = INTRO_CONFIG.phrase;
    }

    // 2. Definir o poster como fallback visual no background
    if (this.posterBg) {
      this.posterBg.style.backgroundImage = `url('${INTRO_CONFIG.assets.posterSvg}')`;
    }

    // 3. Verificar se já foi visualizado na sessão atual
    let hasSeenIntro = false;
    try {
      hasSeenIntro = sessionStorage.getItem('kav_intro_seen') === 'true';
    } catch (e) {
      hasSeenIntro = false;
    }

    // 4. Se reduzido movimento ou segunda visita na sessão: ir direto para o estado final
    if (this.isReducedMotion || hasSeenIntro) {
      this.log('Movimento reduzido ou sessão já existente. Exibindo estado final.');
      this.applyFinalState(true);
      this.bindScrollEvents();
      return;
    }

    // 5. Iniciar sequência interativa de primeira visita
    this.bindEvents();
    this.startWatchdog();
    this.startPlayback();
  }

  bindEvents() {
    // Clique no cue "Role para começar" rola suavemente para o hero
    if (this.cue) {
      this.cue.addEventListener('click', () => {
        const heroSection = document.getElementById('heroScrollSection');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Interceptação de rolagem: se o usuário rolar a página antes dos 3s, pula para o estado final
    this.onInitialScroll = () => {
      if (!this.isCompleted && window.scrollY > 10) {
        this.log('Rolagem detectada durante a abertura. Avançando para o estado final.');
        this.skipToFinal();
      }
    };
    window.addEventListener('scroll', this.onInitialScroll, { passive: true });

    this.bindScrollEvents();
  }

  bindScrollEvents() {
    // Parallax suave do planeta e fade-out contínuo do conteúdo da abertura
    this.onParallaxScroll = () => {
      const scrollY = window.scrollY;
      const sectionHeight = this.section.offsetHeight || window.innerHeight;

      if (scrollY <= sectionHeight) {
        const progress = Math.max(0, Math.min(1, scrollY / sectionHeight));

        // 1. Parallax e zoom sutil do planeta (escala 1 -> 1.08)
        const scale = 1 + (progress * 0.08);
        if (this.video && !this.video.hidden) {
          this.video.style.transform = `translateZ(0) scale(${scale})`;
        }
        if (this.posterBg) {
          this.posterBg.style.transform = `translateZ(0) scale(${scale})`;
        }

        // 2. Fade-out e deslocamento suave do conteúdo (logo + frase)
        // Desaparece 100% até 45% do scroll para nunca sobrepor o texto do hero
        const contentOpacity = Math.max(0, 1 - (progress * 2.2));
        const contentTranslateY = -(progress * 35);
        if (this.content) {
          this.content.style.opacity = contentOpacity;
          this.content.style.transform = `translateZ(0) translateY(${contentTranslateY}px)`;
          this.content.style.pointerEvents = contentOpacity < 0.1 ? 'none' : 'auto';
        }

        // 3. Fade-out rápido do cue "Role para começar"
        if (this.cue) {
          const cueOpacity = Math.max(0, 1 - (progress * 5));
          this.cue.style.opacity = cueOpacity;
        }
      }
    };

    window.addEventListener('scroll', this.onParallaxScroll, { passive: true });
    this.onParallaxScroll();
  }

  startWatchdog() {
    // Se o vídeo não carregar ou atrasar mais de 2.5s, aciona o fallback estático
    const timer = setTimeout(() => {
      if (!this.isCompleted && (!this.video || this.video.readyState < 3)) {
        this.log('Watchdog acionado (timeout de 2.5s). Ativando fallback estático.');
        this.fallbackToStatic();
      }
    }, INTRO_CONFIG.timings.maxVideoWait);

    this.timeouts.push(timer);
  }

  startPlayback() {
    if (!this.video) {
      this.fallbackToStatic();
      return;
    }

    // Configurar atributos de reprodução segura
    this.video.muted = true;
    this.video.playsInline = true;

    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.log('Reprodução do vídeo iniciada.');
          this.scheduleChoreography();
        })
        .catch((err) => {
          this.log('Autoplay bloqueado pelo navegador:', err);
          this.fallbackToStatic();
        });
    }

    // Em caso de erro na tag de vídeo
    this.video.addEventListener('error', () => {
      this.log('Erro no carregamento do vídeo. Ativando fallback estático.');
      this.fallbackToStatic();
    }, { once: true });
  }

  scheduleChoreography() {
    const { timings } = INTRO_CONFIG;

    // 1000ms: Entrada do Logo com fade e escala
    const tLogo = setTimeout(() => {
      if (this.isCompleted) return;
      this.section.classList.add('logo-visible');
    }, timings.logoStart);
    this.timeouts.push(tLogo);

    // 1600ms: Entrada da Frase com fade e blur-in
    const tPhrase = setTimeout(() => {
      if (this.isCompleted) return;
      this.section.classList.add('phrase-visible');
    }, timings.phraseStart);
    this.timeouts.push(tPhrase);

    // 1800ms: Ativação da flutuação suave do logo
    const tFloat = setTimeout(() => {
      if (this.isCompleted) return;
      this.section.classList.add('logo-floating');
    }, timings.logoEnd);
    this.timeouts.push(tFloat);

    // 3000ms: Término do vídeo, congelamento no último frame e exibição do cue
    const tEnd = setTimeout(() => {
      if (this.isCompleted) return;
      this.freezeAndComplete();
    }, timings.videoDuration);
    this.timeouts.push(tEnd);
  }

  freezeAndComplete() {
    this.isCompleted = true;
    if (this.video) {
      try {
        this.video.pause();
      } catch (e) {}
    }

    this.section.classList.add('logo-visible', 'phrase-visible', 'logo-floating', 'cue-visible');

    try {
      sessionStorage.setItem('kav_intro_seen', 'true');
    } catch (e) {}
  }

  skipToFinal() {
    this.clearAllTimeouts();
    this.freezeAndComplete();
    if (this.video) {
      try {
        this.video.currentTime = this.video.duration || 3;
        this.video.pause();
      } catch (e) {}
    }
  }

  fallbackToStatic() {
    this.clearAllTimeouts();
    this.section.classList.add('is-static-fallback');
    this.applyFinalState(false);
  }

  applyFinalState(instant = true) {
    this.isCompleted = true;
    this.clearAllTimeouts();

    if (instant) {
      this.section.classList.add('is-completed', 'logo-floating');
    } else {
      // Entrada rápida de 600ms no fallback
      this.section.classList.add('logo-visible', 'phrase-visible', 'logo-floating', 'cue-visible');
    }

    try {
      sessionStorage.setItem('kav_intro_seen', 'true');
    } catch (e) {}
  }

  clearAllTimeouts() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new KavIntroExperience('intro');
});
