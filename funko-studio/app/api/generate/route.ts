import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, MAX_ATTEMPTS, cookieOptions, decode, encode } from "@/lib/quota";
import { MAX_PHOTOS, buildPrompt } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_BYTES = 4 * 1024 * 1024;

function demoImage(): string {
  const fig = (x: number, label: string) => `
    <g transform="translate(${x} 0)">
      <ellipse cx="0" cy="470" rx="110" ry="18" fill="#000" opacity=".18"/>
      <rect x="-70" y="330" width="140" height="130" rx="40" fill="#7c5cff"/>
      <rect x="-120" y="150" width="240" height="210" rx="90" fill="#ffd9b8"/>
      <circle cx="-45" cy="250" r="22" fill="#111"/><circle cx="45" cy="250" r="22" fill="#111"/>
      <circle cx="-38" cy="242" r="6" fill="#fff"/><circle cx="52" cy="242" r="6" fill="#fff"/>
      <path d="M-120 210 Q0 80 120 210 Q60 150 0 150 Q-60 150 -120 210Z" fill="#3b2a20"/>
      <text y="520" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#555">${label}</text>
    </g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
    <rect width="1536" height="1024" fill="#e9e9ee"/>
    <g transform="translate(0 150) scale(1)">
      ${fig(300, "FRENTE (demo)")}${fig(768, "LATERAL (demo)")}${fig(1236, "TRASEIRA (demo)")}
    </g>
    <text x="768" y="900" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#777">Modo demonstração: configure OPENAI_API_KEY para gerar com IA</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  const { id, used } = decode(req.cookies.get(COOKIE_NAME)?.value);
  if (used >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Você usou todas as ${MAX_ATTEMPTS} tentativas disponíveis.`, remaining: 0 },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Envie ao menos 1 foto de referência." }, { status: 400 });
  }
  if (files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Máximo de ${MAX_PHOTOS} fotos.` }, { status: 400 });
  }
  for (const f of files) {
    if (!f.type.startsWith("image/") || f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Use imagens (JPG/PNG/WebP) de até 4 MB." }, { status: 400 });
    }
  }
  const notes = String(form.get("notes") ?? "");

  let image: string;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1800));
    image = demoImage();
  } else {
    const body = new FormData();
    body.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
    body.append("prompt", buildPrompt(notes));
    body.append("size", "1536x1024");
    body.append("quality", process.env.IMAGE_QUALITY || "medium");
    body.append("n", "1");
    for (const f of files) body.append("image[]", f, f.name || "ref.jpg");

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("OpenAI error", r.status, JSON.stringify(data).slice(0, 500));
      const msg =
        data?.error?.code === "moderation_blocked"
          ? "A imagem foi bloqueada pela moderação. Tente outra foto."
          : "Não conseguimos gerar agora. Tente novamente (essa tentativa não foi descontada).";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "Resposta vazia da IA. Tente novamente." }, { status: 502 });
    }
    image = `data:image/png;base64,${b64}`;
  }

  const newUsed = used + 1;
  const res = NextResponse.json({
    image,
    used: newUsed,
    remaining: Math.max(0, MAX_ATTEMPTS - newUsed),
    max: MAX_ATTEMPTS,
  });
  res.cookies.set(COOKIE_NAME, encode(id, newUsed), cookieOptions);
  return res;
}
