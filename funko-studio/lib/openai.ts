import { MAX_PHOTOS } from "./prompt";

export class AIError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

/** Chama /v1/images/edits com as imagens de referência e devolve o PNG em base64. */
export async function editImage(files: File[], prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const quality = process.env.IMAGE_QUALITY || "medium";

  const call = (withFidelity: boolean) => {
    const body = new FormData();
    body.append("model", model);
    body.append("prompt", prompt);
    body.append("size", "1024x1024");
    body.append("quality", quality);
    body.append("n", "1");
    // "high" faz a IA preservar melhor as características das imagens de referência
    if (withFidelity) body.append("input_fidelity", "high");
    for (const f of files.slice(0, MAX_PHOTOS + 1)) body.append("image[]", f, f.name || "ref.jpg");
    return fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
  };

  let r = await call(true);
  if (r.status === 400) {
    const peek = await r.clone().json().catch(() => ({}));
    // Alguns modelos não aceitam input_fidelity: tenta de novo sem ele.
    if (String(peek?.error?.param || peek?.error?.message || "").includes("input_fidelity")) r = await call(false);
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("OpenAI error", r.status, JSON.stringify(data).slice(0, 500));
    throw new AIError(
      data?.error?.code === "moderation_blocked"
        ? "A imagem foi bloqueada pela moderação. Tente outra foto."
        : "Não conseguimos gerar agora. Tente novamente (isso não gasta tentativa).",
    );
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new AIError("Resposta vazia da IA. Tente novamente.");
  return `data:image/png;base64,${b64}`;
}
