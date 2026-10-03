# KAV — Marketing e Performance com Tecnologia e Dados

> **Website Institucional de Alta Performance com Hero 3D Scroll-Driven e Foco em PMEs (Pequenas e Médias Empresas)**

Este repositório contém o código-fonte oficial do website institucional da **Kav**, desenvolvido com foco em velocidade extrema de carregamento, conformidade rigorosa com **SEO do Google**, segurança sem dependências vulneráveis e uma experiência cinematográfica de abertura por **rolagem contínua (Scroll-Driven Video)** narrando a jornada de aceleração com o **Núcleo HyperKav**.

---

## 🎬 A Experiência do Hero Scroll-Driven (Kav + HyperKav)

O início da home apresenta um plano contínuo em 3D cinematográfico (azul-marinho profundo `#0A1633`, laranja neon `#FF6A1A` e ciano `#6FD3FF`), onde o progresso do scroll do visitante controla com suavidade o avanço do vídeo:

* **Ato 1 — O Início (0% a 35%):** O empresário dá o primeiro passo, a câmera revela o mapa 3D dos concorrentes e a Kav entra em ação com um rastro de luz neon laranja, dando o primeiro salto de visibilidade.
* **Ato 2 — O Núcleo HyperKav (35% a 80%):** Conforme o rastro conecta os principais competidores, nascem gráficos, pesquisas, dados de campanhas e IA. A empresa mergulha no Núcleo HyperKav, onde dados brutos viram inteligência de negócio.
* **Ato 3 — O Sucesso (80% a 100%):** Uma rampa de luz ascende aos céus, ultrapassando os concorrentes e consolidando a empresa no topo do mercado.
* **Resiliência:** Se o vídeo MP4 ainda não tiver sido inserido na pasta ou se o navegador móvel restringir scrub rápido, um motor **Canvas 3D Procedural** entra em ação automaticamente renderizando a cena e o rastro de luz sem travar a navegação.
* **Acessibilidade:** Suporte completo a `prefers-reduced-motion` desativando a rolagem forçada e entregando uma versão estática limpa e acessível.

---

## ⚙️ Como Configurar e Ajustar o Hero (`js/hero-scroll.js`)

No topo de `js/hero-scroll.js`, existe o objeto `HERO_SCROLL_CONFIG`. Você pode editar tudo sem tocar na lógica do código:

```javascript
const HERO_SCROLL_CONFIG = {
  video: {
    src: 'assets/video/hero-scroll.mp4', // Caminho do seu MP4 renderizado
    altSrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
    poster: 'assets/video/hero-poster.svg',
    fallbackDuration: 24, // Duração em segundos se metadados demorarem
    lerpFactor: 0.08       // Suavidade do scroll (0.05 a 0.12)
  },
  scroll: {
    desktopHeight: '520vh', // Altura da rolagem no desktop
    mobileHeight: '380vh'   // Altura da rolagem no mobile
  },
  steps: [
    // Ajuste as faixas percentuais de cada momento do vídeo aqui:
    { minProgress: 0.00, maxProgress: 0.08, title: "...", subtitle: "..." },
    { minProgress: 0.08, maxProgress: 0.20, title: "...", subtitle: "..." },
    // ...
  ]
};
```

---

## 📌 Lista de Placeholders para Substituição

1. **Arquivo de Vídeo MP4:**  
   Basta colocar seu arquivo de vídeo renderizado na pasta `assets/video/hero-scroll.mp4` ou com o nome `Untitled_Scene_10-03_00_51_11_20261002215523.mp4`.
2. **Número de WhatsApp da Kav:**  
   No arquivo `js/main.js` (linha ~144) e no botão de CTA final, substitua `5511999999999` pelo WhatsApp comercial oficial da agência.
3. **E-mail de Contato:**  
   No rodapé de `index.html`, ajuste `contato@agenciakav.com.br` para o seu endereço preferido.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico:** Único `<h1>` de alta conversão, metatags Open Graph, Twitter Cards e Schema.org (`MarketingAgency`).
- **CSS3 Moderno:** Glassmorphism, CSS Grid, variáveis nativas, suporte a `prefers-reduced-motion` e responsividade mobile-first.
- **JavaScript ES6+:** Scrubbing de vídeo com interpolação linear (*lerp*) via `requestAnimationFrame` sem dependências externas pesadas.
- **Three.js & Canvas 2D/3D:** Modelos 3D de alta performance e fallback gráfico procedural.

---

## 🌐 Publicação no GitHub Pages

1. Acesse o repositório no GitHub: `https://github.com/Kavmkt/KAV`
2. Vá em **Settings** > **Pages** (no menu lateral esquerdo).
3. Na seção **Branch**, selecione `main` e a pasta `/ (root)`.
4. Clique em **Save**.
5. O site estará disponível em instantes em:  
   👉 `https://kavmkt.github.io/KAV/`

---

## 📁 Estrutura de Arquivos

```
KAV/
├── index.html            # Estrutura completa com o Hero Scroll-Driven integrado
├── robots.txt            # Diretrizes para indexadores do Google
├── sitemap.xml           # Mapeamento do site para SEO
├── assets/
│   └── video/
│       ├── hero-poster.svg  # Poster e abertura do vídeo em alta resolução
│       └── README.md        # Instruções de render e compressão do vídeo
├── css/
│   ├── hero-scroll.css   # Estilos exclusivos do viewport sticky e textos
│   └── style.css         # Estilização geral, componentes, formulários e dark tech
├── js/
│   ├── hero-scroll.js    # Motor de sincronização scroll -> vídeo e fallback
│   ├── three-scene.js    # Motor 3D Three.js do processo e núcleo HyperKav
│   └── main.js           # Orquestrador da UI, simulador de ROI e WhatsApp
└── README.md             # Documentação técnica do projeto
```

---

&copy; 2026 Kav. Todos os direitos reservados.
