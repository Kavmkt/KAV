# KAV — Agência de Performance & Marketing Digital

> **Website Institucional de Alta Performance com Experiência 3D Interativa e Foco em PMEs (Pequenas e Médias Empresas)**

Este repositório contém o código-fonte oficial do novo website institucional da **KAV**, desenvolvido com foco em velocidade de carregamento, conformidade rigorosa com **SEO do Google**, segurança sem dependências vulneráveis e uma narrativa visual em **3D com Three.js** que apresenta a jornada de aceleração de uma PME.

---

## 🚀 Destaques da Arquitetura

1. **Jornada 3D Interativa para PMEs:**
   - **Etapa 01: Estruturação & Análise de Mercado** — Visualização 3D de topografia em wireframe, radar de varredura e beacons de oportunidades de mercado.
   - **Etapa 02: O Núcleo HyperKav** — Laboratório tecnológico proprietário da KAV representado por um núcleo quântico pulsante com anéis orbitais e nuvem de partículas de dados analíticos.
   - **Etapa 03: Escalada Gradual de Crescimento** — Vetor exponencial ascendente com pilares hexagonais e anéis de aceleração de tração contínua.
   - **Interatividade Total:** Arraste 3D no mouse/touchscreen, modo de rotação autônoma, troca instantânea de foco e fallback em Canvas 2D caso o WebGL não esteja disponível.

2. **SEO & Prontidão para Campanhas:**
   - Metatags Open Graph e Twitter Cards completas.
   - Marcação Semântica e Dados Estruturados Schema.org (`MarketingAgency`).
   - `sitemap.xml` e `robots.txt` inclusos.
   - Layout de conversão otimizado para tráfego pago (Google Ads e Meta Ads).

3. **Simulador de ROI e Potencial de Escala:**
   - Ferramenta interativa onde o empresário simula o crescimento do seu negócio em 6 meses com base no faturamento atual e segmento.

4. **Geração de Leads com WhatsApp Integrado:**
   - Formulário de captura com validação em tempo real e redirecionamento automático com mensagem pré-formatada para atendimento instantâneo.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico:** Acessibilidade, velocidade e SEO técnico.
- **CSS3 Moderno:** Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`), responsividade mobile-first e temas escuros de alto contraste.
- **JavaScript ES6+:** Código limpo, modular, sem frameworks pesados para garantir pontuação máxima no Google PageSpeed / Lighthouse.
- **Three.js (WebGL):** Renderização gráfica 3D com transições suaves via interpolação linear (*lerp*).

---

## 🌐 Como Publicar no GitHub Pages

Para publicar este site gratuitamente no **GitHub Pages**:

1. Acesse o repositório no GitHub: `https://github.com/Kavmkt/KAV`
2. Vá em **Settings** (Configurações) > **Pages** (no menu lateral esquerdo).
3. Na seção **Branch**, selecione `main` e a pasta `/ (root)`.
4. Clique em **Save**.
5. O site estará disponível em instantes no endereço:  
   👉 `https://kavmkt.github.io/KAV/`

---

## 📁 Estrutura de Arquivos

```
KAV/
├── index.html            # Estrutura principal da página institucional e landing page
├── robots.txt            # Diretrizes para indexadores do Google
├── sitemap.xml           # Mapeamento do site para SEO
├── css/
│   └── style.css         # Folha de estilos responsiva com glassmorphism e neon
├── js/
│   ├── three-scene.js    # Motor gráfico 3D da jornada e laboratório HyperKav
│   └── main.js           # Orquestração da UI, simulador PME e captação de leads
└── README.md             # Documentação técnica do projeto
```

---

&copy; 2026 KAV. Todos os direitos reservados.
