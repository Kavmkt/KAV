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

## 🌍 Abertura imersiva (mesma cena do Hero Scroll)

* **Uma cena só:** a abertura (`#introSection`, vídeo `intro-planeta.mp4` + logo + boas-vindas) é uma camada dentro do viewport sticky do hero. Nos primeiros 100vh de scroll o planeta faz zoom e se dissolve, e o sapato já começa a pisar durante a dissolução (`video.introLeadSeconds` + `scroll.heroStartAt` em `js/hero-scroll.js`), sem corte entre "containers".
* **Sem HUD:** não há mais barra de progresso, abas "1 · Começo…" nem texto/botão no primeiro take; só vídeo e as inserções de texto dos passos.
* **Três barrinhas** no canto superior direito abrem um menu em tela cheia (`#immersiveMenu`) durante a abertura e o vídeo.
* **Menu real fixo (`.site-chrome`)** só aparece no fim da rolagem do hero (progresso > 95%).
* Código: `css/intro.css`, `js/intro.js` (menu/autoplay) e `updateIntro` em `js/hero-scroll.js` (zoom/dissolve; ajuste `scroll.introScreens`).
* **Fluidez do vídeo:** ao parar de rolar (ou rolar devagar), o vídeo do sapato continua tocando em câmera lenta, sem seek, até `video.driftMaxSeconds` à frente do scroll; rolando rápido ou subindo, volta ao modo scrub. Ajuste `driftRate` e `driftMaxSeconds` em `js/hero-scroll.js`.
* **Revelações imersivas:** abaixo do hero, títulos, cards, cases e blocos sobem com fade + leve blur em sequência (`css/reveal.css`, `js/reveal.js`; lista de elementos em `GROUPS`). Os números dos cases contam até o valor e as barras do gráfico crescem. Respeita `prefers-reduced-motion` e, se o usuário pular direto para uma seção, o que ficou acima aparece sem animação.
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
