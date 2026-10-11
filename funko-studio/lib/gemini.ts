import { AIError } from "./openai";

/**
 * Gemini image ("Nano Banana"): POST :generateContent com o prompt + imagens de referência.
 * Modelos: gemini-2.5-flash-image (Nano Banana), gemini-3-pro-image-preview (Nano Banana Pro) ou mais novos.
 */
export async function editImageGemini(files: File[], prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

  const imageParts = await Promise.all(
    files.map(async (f) => ({
      inlineData: { mimeType: f.type || "image/jpeg", data: Buffer.from(await f.arrayBuffer()).toString("base64") },
    })),
  );

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      // imagens primeiro (referências), depois o texto com as instruções
      contents: [{ role: "user", parts: [...imageParts, { text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("Gemini error", r.status, JSON.stringify(data).slice(0, 500));
    throw new AIError("Não conseguimos gerar agora. Tente novamente (isso não gasta tentativa).");
  }
  const parts: Array<{ inlineData?: { mimeType?: string; data?: string }; inline_data?: { mime_type?: string; data?: string } }> =
    data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const d = p.inlineData ?? p.inline_data;
    if (d?.data) {
      const mime = (p.inlineData?.mimeType ?? p.inline_data?.mime_type) || "image/png";
      return `data:${mime};base64,${d.data}`;
    }
  }
  console.error("Gemini sem imagem", JSON.stringify(data).slice(0, 500));
  throw new AIError("A IA não devolveu imagem (pode ter sido bloqueada). Tente outra foto ou tente novamente.");
}
