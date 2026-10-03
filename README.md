# KAV — Marketing para Pequenos e Médios Negócios

> **Website Institucional de Alta Performance com Hero Scroll-Driven, Atendimento com IA no WhatsApp e Foco em Vendas e Lucro.**

Este repositório contém o código-fonte oficial do website institucional da **Kav**, desenvolvido com foco em velocidade extrema de carregamento, conformidade rigorosa com **SEO do Google**, segurança sem dependências vulneráveis e uma experiência cinematográfica de abertura por **rolagem contínua (Scroll-Driven Video)** narrando a jornada de aceleração com o **HyperKav**.

---

## 🎬 A Experiência do Hero Scroll-Driven (Kav + HyperKav)

O início da home apresenta um plano contínuo guiado pela rolagem do visitante com 8 etapas:

* **1 · Começo:** Mapeamento do cliente e dos concorrentes da região, seguido pela conquista de visibilidade local.
* **2 · Como funciona:** Acompanhamento de cada real investido, método HyperKav para cuidar do dinheiro e atendimento inteligente 24h no WhatsApp.
* **3 · Resultado:** Cases reais (Almeida Cestas e PontoCar), com convite para análise gratuita do negócio.
* **Resiliência:** Se o vídeo MP4 ainda não tiver sido inserido na pasta ou se o navegador restringir scrub rápido, um motor **Canvas 3D Procedural** entra em ação automaticamente renderizando a cena sem travar a navegação.
* **Acessibilidade:** Suporte completo a `prefers-reduced-motion` desativando a rolagem forçada e entregando uma versão estática limpa e acessível.

---

## 🌍 Abertura imersiva (antes do Hero Scroll)

* **Tela cheia, sem menu:** vídeo `assets/video/intro-planeta.mp4` em loop, logo Kav (`assets/img/kav-logo-intro.png`) e texto de boas-vindas em branco.
* **Três barrinhas** no canto superior direito abrem um menu em tela cheia (`#immersiveMenu`), disponível durante a abertura e o vídeo do hero.
* **Menu real fixo (`.site-chrome`)** só aparece no fim da rolagem do hero (progresso > 95%); aí as três barrinhas e o HUD somem.
* Código: `css/intro.css` e `js/intro.js`; a regra de exibição do menu real fica em `updateStoryUI` (`js/hero-scroll.js`).
* Testes locais: use um servidor com suporte a HTTP Range (ex.: `npx http-server`), senão o scrub do vídeo não funciona.

---

## ⚙️ Principais Funcionalidades

1. **Atendimento com IA no WhatsApp 24/7:** Mockup de celular interativo com simulação de conversa em tempo real, demonstrando agendamento automático e suporte contínuo.
2. **Calculadora de Vendas Perdidas:** Permite ao comerciante e empresário simular quanto dinheiro deixa na mesa por demorar a responder clientes no WhatsApp.
3. **Casos Reais:** Almeida Cestas (ROAS de 2 para 6.5) e PontoCar (+7 mil contatos no WhatsApp).
4. **Formulário com Integração Direta:** Gera mensagem personalizada pronta para envio via WhatsApp oficial.

---

## 📌 Lista de Confirmações Pendentes

Consulte o arquivo `CONTEUDO-PENDENTE.md` para visualizar os itens que requerem dados internos da empresa (como o número oficial de WhatsApp comercial em `js/main.js`).
