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
