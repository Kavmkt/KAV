# Diretório de Vídeos do Hero Scroll-Driven — KAV + HyperKav

Este diretório contém os arquivos de mídia da experiência de rolagem 3D cinematográfica da home.

## Como Adicionar ou Atualizar o Vídeo

1. **Nome do Arquivo:**
   O script está pré-configurado para carregar automaticamente qualquer um dos seguintes nomes:
   * `hero-scroll.mp4` (nome padrão limpo)
   * `Untitled_Scene_10-03_00_51_11_20261002215523.mp4` (nome do arquivo enviado pelo cliente)
   * `hero-scroll.webm` (versão WebM opcional para máxima compatibilidade)

2. **Como trocar o arquivo:**
   Basta colocar seu arquivo de vídeo MP4 renderizado aqui nesta pasta (`assets/video/`) com o nome `hero-scroll.mp4` ou com o nome original do render.
   Se quiser mudar o nome ou caminho do arquivo, você pode alterar diretamente a propriedade `videoSrc` no topo do arquivo `js/hero-scroll.js`:
   ```javascript
   const HERO_SCROLL_CONFIG = {
     video: {
       src: 'assets/video/hero-scroll.mp4',
       altSrc: 'assets/video/Untitled_Scene_10-03_00_51_11_20261002215523.mp4',
       poster: 'assets/video/hero-poster.svg',
       // ...
     }
   }
   ```

3. **Dicas para o scrub ficar 100% liso (nível Apple):**
   * O ideal para scrub de vídeo no navegador é que o arquivo MP4 tenha GOP / keyframe interval curto (ex.: 1 keyframe a cada 5–10 frames ou all-intra `GOP=1`).
   * No Blender / After Effects / Premiere: renderize em H.264, 1920×1080 a 30fps ou 60fps com taxa constante de bits (CBR ~8-12 Mbps).
   * Comando de conversão via ffmpeg (se desejar otimizar o arquivo para resposta instantânea ao scroll):
     ```bash
     ffmpeg -i input.mp4 -vcodec libx264 -crf 20 -g 6 -pix_fmt yuv420p -an assets/video/hero-scroll.mp4
     ```

4. **Fallback Inteligente:**
   Enquanto o arquivo de vídeo MP4 não for colocado na pasta, ou caso o dispositivo móvel bloqueie scrubbing de vídeo ou esteja em modo de economia de energia, o sistema ativa automaticamente o **Canvas 3D Procedural** em azul-marinho e laranja neon, garantindo que o visitante nunca veja uma tela preta ou travada!
