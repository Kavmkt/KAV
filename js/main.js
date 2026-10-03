/**
 * KAV Marketing Digital & Performance
 * Core Main Interactions: Mobile Navigation, SME ROI Simulator & Lead Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Menu
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on navigation link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Interactive ROI & Growth Simulator for SMEs (Estimativa Ilustrativa)
  const faturamentoSlider = document.getElementById('calcFaturamento');
  const faturamentoDisplay = document.getElementById('faturamentoDisplay');
  const segmentoSelect = document.getElementById('calcSegmento');
  const projecaoDisplay = document.getElementById('projecaoFaturamento');
  const crescimentoDisplay = document.getElementById('crescimentoPercentual');
  const reducaoCACDisplay = document.getElementById('reducaoCAC');

  // Multiplicadores conservadores e realistas para PMEs (sem promessas exageradas)
  const segmentMultipliers = {
    ecommerce: { multiplier: 1.8, cacReduction: 25, percentStr: '+80%' },
    servicos: { multiplier: 1.6, cacReduction: 20, percentStr: '+60%' },
    saude: { multiplier: 1.5, cacReduction: 18, percentStr: '+50%' },
    educacao: { multiplier: 1.7, cacReduction: 22, percentStr: '+70%' },
    local: { multiplier: 1.4, cacReduction: 15, percentStr: '+40%' }
  };

  function updateCalculator() {
    if (!faturamentoSlider || !projecaoDisplay || !segmentoSelect) return;

    const faturamentoAtual = parseFloat(faturamentoSlider.value);
    const segmento = segmentoSelect.value;
    const config = segmentMultipliers[segmento] || segmentMultipliers.servicos;

    const faturamentoFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(faturamentoAtual);

    if (faturamentoDisplay) {
      faturamentoDisplay.textContent = `${faturamentoFormatado} / mês`;
    }

    const projecaoValor = faturamentoAtual * config.multiplier;
    const projecaoFormatada = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(projecaoValor);

    projecaoDisplay.textContent = `${projecaoFormatada} / mês`;
    if (crescimentoDisplay) {
      crescimentoDisplay.textContent = config.percentStr;
    }
    if (reducaoCACDisplay) {
      reducaoCACDisplay.textContent = `Até -${config.cacReduction}%`;
    }
  }

  if (faturamentoSlider && segmentoSelect) {
    faturamentoSlider.addEventListener('input', updateCalculator);
    segmentoSelect.addEventListener('change', updateCalculator);
    updateCalculator(); // Execução inicial
  }

  // 3. Lead Form Submission & WhatsApp Link Builder
  const leadForm = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccessMessage');
  const directWhatsAppBtn = document.getElementById('directWhatsAppBtn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('leadName') ? document.getElementById('leadName').value.trim() : '';
      const company = document.getElementById('leadCompany') ? document.getElementById('leadCompany').value.trim() : '';
      const email = document.getElementById('leadEmail') ? document.getElementById('leadEmail').value.trim() : '';
      const whatsapp = document.getElementById('leadWhatsapp') ? document.getElementById('leadWhatsapp').value.trim() : '';
      const revenue = document.getElementById('leadRevenue') ? document.getElementById('leadRevenue').value : '';
      const challenge = document.getElementById('leadChallenge') ? document.getElementById('leadChallenge').value.trim() : '';

      // Validação básica
      if (!name || !email || !whatsapp) {
        alert('Por favor, preencha os campos obrigatórios (Nome, E-mail e WhatsApp).');
        return;
      }

      // Mensagem estruturada para envio direto via WhatsApp
      const rawMessage = `Olá Kav! Gostaria de solicitar um diagnóstico estratégico para minha empresa.\n\n` +
        `👤 *Nome:* ${name}\n` +
        `🏢 *Empresa:* ${company || 'Não informado'}\n` +
        `📧 *E-mail:* ${email}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `💰 *Faturamento Médio:* ${revenue}\n` +
        `🎯 *Principal Desafio:* ${challenge || 'Estruturação de marketing e vendas'}\n\n` +
        `Vim através do site da Kav.`;

      // Número oficial da agência Kav (configurável)
      const phoneKav = '5511999999999'; // Substituir pelo número comercial oficial
      const encodedMsg = encodeURIComponent(rawMessage);
      const whatsappUrl = `https://wa.me/${phoneKav}?text=${encodedMsg}`;

      if (directWhatsAppBtn) {
        directWhatsAppBtn.href = whatsappUrl;
      }

      // Transição suave para mensagem de confirmação
      leadForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.style.display = 'block';
        formSuccess.classList.add('active');
      }
    });
  }

  // 4. Header backdrop elevation on scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }
});
