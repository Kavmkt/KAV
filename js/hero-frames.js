/**
 * KAV — Sequência de quadros do hero para celular.
 *
 * Em vez de "pular" (seek) num MP4 de 24 MB, o que trava o decodificador do telefone, o celular
 * desenha quadros WebP leves (~7 MB no total) num <canvas>: trocar de quadro é instantâneo, então
 * o scroll com o dedo fica fluido. Quadros intermediários são misturados (crossfade) para suavizar.
 *
 * Os quadros são gerados por `tools/extract-frames.html` (ver README) e descritos por
 * `assets/frames/manifest.json`. Trocou o vídeo? Rode a extração de novo.
 */
class KavFrameSeq {
  constructor(canvas, baseUrl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.base = baseUrl;
    this.m = null;
    this.imgs = [];
    this.ready = false;
    this.lastKey = '';
    this.firstLoaded = null;
  }

  async init() {
    const res = await fetch(`${this.base}/manifest.json`);
    if (!res.ok) throw new Error('sem manifest');
    this.m = await res.json();
    this.canvas.width = this.m.width;
    this.canvas.height = this.m.height;
    this.imgs = new Array(this.m.count).fill(null);
    this.load();
    this.ready = true;
    return this.m;
  }

  get duration() { return this.m ? this.m.duration : 0; }

  url(i) {
    const m = this.m;
    return `${this.base}/${m.prefix}${String(i).padStart(m.pad, '0')}.${m.ext}`;
  }

  // Ordem "grossa → fina": primeiro 1 a cada 8, depois 1 a cada 4, 2 e o restante.
  // Assim a jornada inteira já fica navegável rápido e o resto vai refinando.
  load() {
    const n = this.m.count;
    const order = [];
    const seen = new Set();
    [8, 4, 2, 1].forEach((step) => {
      for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    });
    let next = 0;
    const worker = async () => {
      while (next < order.length) {
        const i = order[next++];
        await new Promise((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => { this.imgs[i] = img; if (this.firstLoaded === null) this.firstLoaded = i; this.lastKey = ''; resolve(); };
          img.onerror = resolve;
          img.src = this.url(i);
        });
      }
    };
    const conc = 6;
    for (let k = 0; k < conc; k++) worker();
  }

  nearest(i) {
    // quadro carregado mais próximo (preferindo os anteriores, para não "adiantar" a cena)
    for (let d = 0; d < this.m.count; d++) {
      if (i - d >= 0 && this.imgs[i - d]) return this.imgs[i - d];
      if (i + d < this.m.count && this.imgs[i + d]) return this.imgs[i + d];
    }
    return null;
  }

  // t em segundos de vídeo
  draw(t) {
    if (!this.ready) return;
    const f = Math.max(0, Math.min(this.m.count - 1, t * this.m.fps));
    const i0 = Math.floor(f);
    const a = Math.round((f - i0) * 16) / 16; // quantiza a mistura para não redesenhar à toa
    const key = `${i0}:${a}:${this.imgs[i0] ? 1 : 0}${this.imgs[i0 + 1] ? 1 : 0}`;
    if (key === this.lastKey) return;
    this.lastKey = key;

    const A = this.nearest(i0);
    if (!A) return;
    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    ctx.drawImage(A, 0, 0);
    if (a > 0 && i0 + 1 < this.m.count) {
      const B = this.imgs[i0 + 1];
      if (B) { ctx.globalAlpha = a; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; }
    }
  }
}
