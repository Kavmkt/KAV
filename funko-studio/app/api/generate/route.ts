import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, MAX_ATTEMPTS, MAX_SUBS, cookieOptions, decode, encode } from "@/lib/quota";
import { MAX_PHOTOS, View, buildFrontPrompt, buildTurnPrompt } from "@/lib/prompt";
import { AIError } from "@/lib/openai";
import { editImage, isDemo } from "@/lib/imageai";
import { demoImage } from "@/lib/demo";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const err = (error: string, status: number, extra: object = {}) => NextResponse.json({ error, ...extra }, { status });

/**
 * POST multipart:
 *  - step=front : photos[] (+notes)            → gera a frente. CONTA 1 tentativa.
 *  - step=side : front + photos[]; step=back : front + side + photos[] → gira o MESMO boneco, em sequência. Não conta tentativa (limitado por MAX_SUBS).
 */
export async function POST(req: NextRequest) {
  const { id, used, subs } = decode(req.cookies.get(COOKIE_NAME)?.value);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("Envio inválido.", 400);
  }

  const step = String(form.get("step") ?? "front") as View;
  if (!["front", "side", "back"].includes(step)) return err("Etapa inválida.", 400);

  const photos = form.getAll("photos").filter((f): f is File => f instanceof File);
  const front = form.get("front");
  const sideRef = form.get("side");
  const notes = String(form.get("notes") ?? "");

  if (photos.length === 0) return err("Envie ao menos 1 foto de referência.", 400);
  if (photos.length > MAX_PHOTOS) return err(`Máximo de ${MAX_PHOTOS} fotos.`, 400);
  for (const f of [...photos, ...(front instanceof File ? [front] : []), ...(sideRef instanceof File ? [sideRef] : [])]) {
    if (!f.type.startsWith("image/") || f.size > MAX_FILE_BYTES) {
      return err("Use imagens (JPG/PNG/WebP) de até 4 MB.", 400);
    }
  }

  let newUsed = used;
  let newSubs = subs;

  if (step === "front") {
    if (used >= MAX_ATTEMPTS) {
      return err(`Você usou todas as ${MAX_ATTEMPTS} tentativas disponíveis.`, 429, { remaining: 0 });
    }
  } else {
    if (!(front instanceof File)) return err("Falta a imagem da frente.", 400);
    if (used < 1) return err("Gere a frente primeiro.", 400);
    if (subs >= MAX_SUBS) return err("Limite de refações desta tentativa atingido. Gere uma nova versão.", 429);
  }

  let image: string;
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1200));
    image = demoImage(step);
  } else {
    try {
      image =
        step === "front"
          ? await editImage(photos, buildFrontPrompt(notes))
          : // frente (e lateral, se houver) vão PRIMEIRO: são a referência de identidade; no máximo 2 fotos para caber no limite de upload
            await editImage(
              [front as File, ...(sideRef instanceof File ? [sideRef] : []), ...photos.slice(0, 2)],
              buildTurnPrompt(step as "side" | "back", notes, sideRef instanceof File),
            );
    } catch (e) {
      if (e instanceof AIError) return err(e.message, e.status);
      console.error(e);
      return err("Erro inesperado. Tente novamente.", 500);
    }
  }

  if (step === "front") {
    newUsed = used + 1;
    newSubs = 0;
  } else {
    newSubs = subs + 1;
  }

  const res = NextResponse.json({
    image,
    step,
    used: newUsed,
    max: MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - newUsed),
  });
  res.cookies.set(COOKIE_NAME, encode(id, newUsed, newSubs), cookieOptions);
  return res;
}
