/** Redimensiona no navegador para caber nos limites de upload (≈1024px, JPEG). */
export async function shrink(file: File, max = 1024): Promise<File> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error("Não consegui ler essa imagem.");
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar."))), "image/jpeg", 0.88),
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Falha ao carregar a imagem."));
    i.src = src;
  });
}

/** Converte a imagem gerada (data URL) num arquivo JPEG leve para servir de referência às outras vistas. */
export async function dataUrlToJpeg(src: string, name: string): Promise<File> {
  const img = await loadImg(src);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar."))), "image/jpeg", 0.95),
  );
  return new File([blob], name, { type: "image/jpeg" });
}

/** Junta frente, lateral e traseira lado a lado (mesma escala) numa folha única em PNG. */
export async function composeSheet(srcs: [string, string, string]): Promise<string> {
  const imgs = await Promise.all(srcs.map(loadImg));
  const h = Math.max(...imgs.map((i) => i.naturalHeight));
  const w = imgs.reduce((s, i) => s + Math.round((i.naturalWidth * h) / i.naturalHeight), 0);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#E8E8EC";
  ctx.fillRect(0, 0, w, h);
  let x = 0;
  for (const i of imgs) {
    const iw = Math.round((i.naturalWidth * h) / i.naturalHeight);
    ctx.drawImage(i, x, 0, iw, h);
    x += iw;
  }
  return c.toDataURL("image/png");
}
