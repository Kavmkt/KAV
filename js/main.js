/**
 * KAV Marketing Digital & Performance
 * Core Main Interactions, 3D Orchestration, ROI Simulator & Lead Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Engine
  const experience3D = new KAV3DExperience('canvas3DContainer');

  // 2. Stage Syncing (Tabs + Story Cards)
  const stageTabs = document.querySelectorAll('.stage-tab');
  const storyCards = document.querySelectorAll('.story-card');

  function setActiveStage(stageNum) {
    const num = parseInt(stageNum, 10);

    // Update 3D Scene
    if (experience3D && typeof experience3D.setStage === 'function') {
      experience3D.setStage(num);
    }

    // Update Tabs
    stageTabs.forEach((tab) => {
      const tabStage = parseInt(tab.dataset.stage, 10);
      tab.classList.toggle('active', tabStage === num);
    });

    // Update Story Cards
    storyCards.forEach((card) => {
      const cardStage = parseInt(card.dataset.stage, 10);
      card.classList.toggle('active', cardStage === num);
    });
  }

  // Click on tabs
  stageTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveStage(tab.dataset.stage);
    });
  });

  // Click on story cards
  storyCards.forEach((card) => {
    card.addEventListener('click', () => {
      setActiveStage(card.dataset.stage);
    });
  });

  // 3. Mobile Navigation Menu
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // 4. Interactive ROI & Growth Simulator for SMEs
  const faturamentoSlider = document.getElementById('calcFaturamento');
  const faturamentoDisplay = document.getElementById('faturamentoDisplay');
  const segmentoSelect = document.getElementById('calcSegmento');
  const projecaoDisplay = document.getElementById('projecaoFaturamento');
  const crescimentoDisplay = document.getElementById('crescimentoPercentual');
  const reducaoCACDisplay = document.getElementById('reducaoCAC');

  const segmentMultipliers = {
    ecommerce: { multiplier: 2.9, cacReduction: 38, percentStr: '+190%' },
    servicos: { multiplier: 2.7, cacReduction: 35, percentStr: '+170%' },
    saude: { multiplier: 2.6, cacReduction: 32, percentStr: '+160%' },
    educacao: { multiplier: 3.2, cacReduction: 42, percentStr: '+220%' },
    local: { multiplier: 2.4, cacReduction: 30, percentStr: '+140%' }
  };

  function updateCalculator() {
    if (!faturamentoSlider || !projecaoDisplay) return;

    const faturamentoAtual = parseFloat(faturamentoSlider.value);
    const segmento = segmentoSelect.value;
    const config = segmentMultipliers[segmento] || segmentMultipliers.servicos;

    const faturamentoFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(faturamentoAtual);

    faturamentoDisplay.textContent = `${faturamentoFormatado} / mês`;

    const projecaoValor = faturamentoAtual * config.multiplier;
    const projecaoFormatada = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(projecaoValor);

    projecaoDisplay.textContent = `${projecaoFormatada} / mês`;
    crescimentoDisplay.textContent = config.percentStr;
    reducaoCACDisplay.textContent = `-${config.cacReduction}%`;
  }

  if (faturamentoSlider && segmentoSelect) {
    faturamentoSlider.addEventListener('input', updateCalculator);
    segmentoSelect.addEventListener('change', updateCalculator);
    updateCalculator(); // Initial calculation
  }

  // 5. Lead Form Submission & WhatsApp Link Builder
  const leadForm = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccessMessage');
  const directWhatsAppBtn = document.getElementById('directWhatsAppBtn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('leadName').value.trim();
      const company = document.getElementById('leadCompany').value.trim();
      const email = document.getElementById('leadEmail').value.trim();
      const whatsapp = document.getElementById('leadWhatsapp').value.trim();
      const revenue = document.getElementById('leadRevenue').value;
      const challenge = document.getElementById('leadChallenge').value.trim();

      // Format WhatsApp Message for direct conversion
      const rawMessage = `Olá KAV! Gostaria de agendar uma Sessão Estratégica para minha empresa.\n\n` +
        `👤 *Nome:* ${name}\n` +
        `🏢 *Empresa:* ${company}\n` +
        `📧 *E-mail:* ${email}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `💰 *Faturamento Atual:* ${revenue}\n` +
        `🎯 *Principal Desafio:* ${challenge || 'Acelerar vendas e previsibilidade'}\n\n` +
        `Vim através do site e me interessei pelo Núcleo HyperKav!`;

      // Official WhatsApp Number for KAV Agency
      const phoneKav = '5511999999999'; // Can be adjusted in config
      const encodedMsg = encodeURIComponent(rawMessage);
      const whatsappUrl = `https://wa.me/${phoneKav}?text=${encodedMsg}`;

      if (directWhatsAppBtn) {
        directWhatsAppBtn.href = whatsappUrl;
      }

      // Hide form and display success card
      leadForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('active');
      }

      console.log('Lead KAV gravado:', { name, company, email, whatsapp, revenue, challenge });
    });
  }

  // 6. Header backdrop glow & sticky elevation
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
});
