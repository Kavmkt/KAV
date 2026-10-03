/**
 * ============================================================================
 * KAV — MAIN JAVASCRIPT ORCHESTRATION (v5.1 Otimização Mobile Avançada)
 * ============================================================================
 * - Gestão unificada da CTA do WhatsApp (constante WHATSAPP_NUMBER).
 * - Menu mobile acessível (ARIA, ESC, clique fora, bloqueio de scroll de fundo).
 * - Botão flutuante de WhatsApp (FAB) no mobile após a rolagem inicial.
 * - Simulação realista de chat de atendimento IA em loop contínuo.
 * - FAQ interativo em acordeão com transições suaves.
 * - Nova Calculadora de Vendas Perdidas por Demora no Atendimento.
 * - Formulário de Análise Gratuita com integração transparente ao WhatsApp.
 * ============================================================================
 */

// [CONFIRMAR: Número de WhatsApp oficial da Kav com DDI e DDD, ex: 5511999999999]
const WHATSAPP_NUMBER = '5511999999999';

// Mensagens padrão estruturadas
const WHATSAPP_MSGS = {
  default: encodeURIComponent('Oi! Vim pelo site da Kav e quero conversar sobre o meu negócio.'),
  iaTest: encodeURIComponent('Quero ver o atendimento com IA funcionando'),
  calcCustom: (valor) => encodeURIComponent(`Oi! Fiz a simulação no site da Kav e vi que posso estar deixando de vender cerca de ${valor}/mês por demorar a responder. Quero conversar sobre o meu negócio.`),
  leadForm: (data) => encodeURIComponent(
    `Olá Kav! Pedi uma análise gratuita do meu negócio pelo site.\n\n` +
    `👤 *Nome:* ${data.name}\n` +
    `📱 *WhatsApp:* ${data.whatsapp}\n` +
    `🏢 *Negócio:* ${data.company || 'Não informado'}\n` +
    `🏷️ *Tipo de Negócio:* ${data.businessType || 'Geral'}\n` +
    `📧 *E-mail:* ${data.email || 'Não informado'}\n` +
    `💰 *Faturamento:* ${data.revenue || 'Não informado'}\n` +
    `🎯 *Maior Desafio:* ${data.challenge || 'Melhorar vendas e anúncios'}\n` +
    `🤖 *Interesse em IA no WhatsApp:* ${data.aiInterest ? 'Sim' : 'Não'}\n\n` +
    `Vim pelo site da Kav.`
  )
};

function getWhatsAppUrl(msgKey = 'default', customParam = null) {
  let text = WHATSAPP_MSGS.default;
  if (msgKey === 'iaTest') text = WHATSAPP_MSGS.iaTest;
  if (msgKey === 'calcCustom' && customParam) text = WHATSAPP_MSGS.calcCustom(customParam);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

document.addEventListener('DOMContentLoaded', () => {

  // 1. Inicializar todos os links primários de WhatsApp com o número e mensagem padrão
  document.querySelectorAll('.btn-whatsapp-trigger').forEach((btn) => {
    btn.setAttribute('href', getWhatsAppUrl('default'));
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });

  // Botão específico de teste da IA
  const btnIaTest = document.getElementById('btnIaTestWhatsApp');
  if (btnIaTest) {
    btnIaTest.setAttribute('href', getWhatsAppUrl('iaTest'));
    btnIaTest.setAttribute('target', '_blank');
    btnIaTest.setAttribute('rel', 'noopener noreferrer');
  }

  // 2. Menu de Navegação Mobile com Bloqueio de Fundo
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  function closeMobileMenu() {
    if (navMenu && mobileToggle) {
      navMenu.classList.remove('open');
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    // Fechar ao clicar em qualquer link
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Fechar com a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Fechar ao clicar fora do menu
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // 3. Botão Flutuante de WhatsApp (FAB) com ativação suave no scroll
  const mobileFab = document.getElementById('mobileWhatsappFab');
  if (mobileFab) {
    window.addEventListener('scroll', () => {
      // Exibe após rolar além da primeira tela (350px)
      if (window.scrollY > 350) {
        mobileFab.classList.add('visible');
      } else {
        mobileFab.classList.remove('visible');
      }
    }, { passive: true });
  }

  // 4. Simulação Dinâmica de Chat no Mockup de Celular (Seção WhatsApp)
  const phoneScreen = document.getElementById('phoneChatScreen');
  if (phoneScreen) {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const chatScript = [
      { sender: 'client', text: 'Oi! Qual o valor e o horário disponível para amanhã?', time: '14:20' },
      { sender: 'ia', text: 'Olá! Temos às 10h e às 15h. Posso reservar o melhor horário para você agora.', time: '14:20' },
      { sender: 'client', text: 'Pode agendar às 15h.', time: '14:21' },
      { sender: 'ia', text: 'Pronto! Horário reservado. Um especialista continuará com você para finalizar.', time: '14:21' }
    ];

    if (isReducedMotion) {
      phoneScreen.innerHTML = '';
      chatScript.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender}`;
        bubble.innerHTML = `${msg.text}<span class="msg-time">${msg.time}</span>`;
        phoneScreen.appendChild(bubble);
      });
    } else {
      let isChatRunning = true;

      const runChatLoop = async () => {
        while (isChatRunning) {
          phoneScreen.innerHTML = '';
          
          for (let i = 0; i < chatScript.length; i++) {
            const msg = chatScript[i];

            // Indicador de "digitando..."
            const typingBubble = document.createElement('div');
            typingBubble.className = 'typing-bubble';
            typingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
            phoneScreen.appendChild(typingBubble);
            phoneScreen.scrollTop = phoneScreen.scrollHeight;

            await new Promise(r => setTimeout(r, msg.sender === 'client' ? 700 : 1000));
            typingBubble.remove();

            // Mensagem real
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${msg.sender}`;
            bubble.innerHTML = `${msg.text}<span class="msg-time">${msg.time}</span>`;
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(8px)';
            phoneScreen.appendChild(bubble);

            requestAnimationFrame(() => {
              bubble.style.opacity = '1';
              bubble.style.transform = 'translateY(0)';
            });

            phoneScreen.scrollTop = phoneScreen.scrollHeight;
            await new Promise(r => setTimeout(r, 1200));
          }

          // Pausa antes de reiniciar o loop da conversa
          await new Promise(r => setTimeout(r, 4500));
        }
      };

      runChatLoop();
    }
  }

  // 5. FAQ Acordeão Interativo
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(other => {
          other.classList.remove('active');
          const btn = other.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 6. Nova Calculadora: "Quanto você pode estar perdendo por demorar a responder?"
  const calcMsgDia = document.getElementById('calcMsgDia');
  const calcTicketMedio = document.getElementById('calcTicketMedio');
  const calcTaxaDesistencia = document.getElementById('calcTaxaDesistencia');

  const msgDiaDisplay = document.getElementById('msgDiaDisplay');
  const ticketMedioDisplay = document.getElementById('ticketMedioDisplay');
  const taxaDesistenciaDisplay = document.getElementById('taxaDesistenciaDisplay');
  const calcPerdaValor = document.getElementById('calcPerdaValor');
  const calcWhatsappBtn = document.getElementById('calcWhatsappBtn');

  function updateLossCalculator() {
    if (!calcMsgDia || !calcTicketMedio || !calcTaxaDesistencia || !calcPerdaValor) return;

    const msgDia = parseInt(calcMsgDia.value, 10);
    const ticketMedio = parseFloat(calcTicketMedio.value);
    const desistenciaDeCadaDez = parseInt(calcTaxaDesistencia.value, 10);

    if (msgDiaDisplay) msgDiaDisplay.textContent = `${msgDia} mensagens / dia`;
    if (ticketMedioDisplay) {
      ticketMedioDisplay.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
      }).format(ticketMedio);
    }
    if (taxaDesistenciaDisplay) {
      taxaDesistenciaDisplay.textContent = `${desistenciaDeCadaDez} de cada 10 clientes`;
    }

    const msgMes = msgDia * 30;
    const clientesPerdidos = Math.round(msgMes * (desistenciaDeCadaDez / 10));
    const perdaEstimada = clientesPerdidos * ticketMedio;

    const perdaFormatada = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(perdaEstimada);

    calcPerdaValor.textContent = `${perdaFormatada} por mês`;

    if (calcWhatsappBtn) {
      calcWhatsappBtn.href = getWhatsAppUrl('calcCustom', perdaFormatada);
    }
  }

  if (calcMsgDia && calcTicketMedio && calcTaxaDesistencia) {
    calcMsgDia.addEventListener('input', updateLossCalculator);
    calcTicketMedio.addEventListener('input', updateLossCalculator);
    calcTaxaDesistencia.addEventListener('input', updateLossCalculator);
    updateLossCalculator();
  }

  // 7. Formulário de Análise Gratuita do Negócio
  const leadForm = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccessMessage');
  const directWhatsAppBtn = document.getElementById('directWhatsAppBtn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('leadName') ? document.getElementById('leadName').value.trim() : '';
      const whatsapp = document.getElementById('leadWhatsapp') ? document.getElementById('leadWhatsapp').value.trim() : '';
      const company = document.getElementById('leadCompany') ? document.getElementById('leadCompany').value.trim() : '';
      const email = document.getElementById('leadEmail') ? document.getElementById('leadEmail').value.trim() : '';
      const businessType = document.getElementById('leadBusinessType') ? document.getElementById('leadBusinessType').value : '';
      const revenue = document.getElementById('leadRevenue') ? document.getElementById('leadRevenue').value : '';
      const challenge = document.getElementById('leadChallenge') ? document.getElementById('leadChallenge').value.trim() : '';
      const aiInterest = document.getElementById('leadAiInterest') ? document.getElementById('leadAiInterest').checked : false;

      if (!name || !whatsapp) {
        alert('Por favor, preencha os campos obrigatórios (Seu Nome e WhatsApp).');
        return;
      }

      const formData = {
        name,
        whatsapp,
        company,
        email,
        businessType,
        revenue,
        challenge,
        aiInterest
      };

      const customMsg = WHATSAPP_MSGS.leadForm(formData);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${customMsg}`;

      if (directWhatsAppBtn) {
        directWhatsAppBtn.href = whatsappUrl;
      }

      leadForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.style.display = 'block';
        formSuccess.classList.add('active');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // 8. Elevação visual suave do cabeçalho ao rolar
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }

});
