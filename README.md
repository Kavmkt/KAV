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

## 🌍 Hero em etapas travadas (abertura + vídeo + textos)

O hero é uma jornada de **8 etapas** (`stages` em `js/hero-scroll.js`): abertura (planeta) + 7 textos.

* **Scroll que trava de verdade:** cada gesto (roda do mouse, deslize no celular, setas/PageDown/Espaço ou pontos laterais) avança **uma** etapa. Não dá para pular textos nem se perder; voltar é um gesto para o outro lado. Rajadas e inércia do trackpad contam como um gesto só.
* **Vídeo fluido:** entre etapas o vídeo **toca de verdade** (reprodução nativa, sem seek por pixel, que era o que travava), em velocidade controlada e desacelerando ao chegar. Com o texto na tela ele segue em câmera lenta. Voltar usa um único seek, escondido por um "rebobinar" visual de 0,3s.
* **Orientação:** pontos laterais mostram em que passo o visitante está (clicáveis) e, após ~3,5s parado, aparece a dica "Role/Deslize para continuar".
* **Sem armadilha:** depois do último texto, mais um gesto libera o site; rolando para cima o hero volta a travar na etapa certa. Menu, âncoras, barra de rolagem e botão voltar continuam funcionando (o scroll real acompanha a etapa).
* **Abertura:** o planeta (`#introSection`) faz zoom e dissolve no vídeo do sapato durante a 1ª transição.
* **Menu real fixo (`.site-chrome`)** só aparece na última etapa; antes disso há só as três barrinhas (`#immersiveMenu`).
* **Trocou o vídeo?** Ajuste só os `time` (s) de cada etapa em `stages` (e velocidades em `video`: `maxRate`, `introMs`, `holdRate`...). Para ficar ainda mais liso, exporte o vídeo com quadro-chave curto (comando em `assets/video/README.md`).
* **Acessibilidade:** com `prefers-reduced-motion` o hero vira conteúdo estático, sem travas.
* **Revelações abaixo do hero:** títulos, cards, cases e blocos sobem com fade + leve blur em sequência (`css/reveal.css`, `js/reveal.js`); números dos cases contam até o valor.
* Testes locais: use um servidor com suporte a HTTP Range (ex.: `npx http-server`).

---

## ⚙️ Principais Funcionalidades

1. **Atendimento com IA no WhatsApp 24/7:** Mockup de celular interativo com simulação de conversa em tempo real, demonstrando agendamento automático e suporte contínuo.
2. **Calculadora de Vendas Perdidas:** Permite ao comerciante e empresário simular quanto dinheiro deixa na mesa por demorar a responder clientes no WhatsApp.
3. **Casos Reais:** Almeida Cestas (ROAS de 2 para 6.5) e PontoCar (+7 mil contatos no WhatsApp).
4. **Formulário com Integração Direta:** Gera mensagem personalizada pronta para envio via WhatsApp oficial.

---

## 📌 Lista de Confirmações Pendentes

Consulte o arquivo `CONTEUDO-PENDENTE.md` para visualizar os itens que requerem dados internos da empresa (como o número oficial de WhatsApp comercial em `js/main.js`).
