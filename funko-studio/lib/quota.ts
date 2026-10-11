import crypto from "node:crypto";

export const COOKIE_NAME = "fs_quota";
export const MAX_ATTEMPTS = Math.max(1, Number(process.env.MAX_ATTEMPTS) || 15);
/** Chamadas extras (lateral/traseira) permitidas por tentativa: 2 vistas + refazer algumas. */
export const MAX_SUBS = 6;

const secret = () => process.env.QUOTA_SECRET || "dev-only-secret-change-me";

const sign = (payload: string) =>
  crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

/** Cookie assinado "<id>.<tentativas>.<subchamadas>.<assinatura>": o cliente não consegue editar o contador. */
export function encode(id: string, used: number, subs = 0): string {
  const payload = `${id}.${used}.${subs}`;
  return `${payload}.${sign(payload)}`;
}

export function decode(value: string | undefined): { id: string; used: number; subs: number } {
  if (value) {
    const parts = value.split(".");
    if (parts.length === 4) {
      const [id, used, subs, sig] = parts;
      const a = Buffer.from(sig);
      const b = Buffer.from(sign(`${id}.${used}.${subs}`));
      if (a.length === b.length && crypto.timingSafeEqual(a, b) && +used >= 0 && +subs >= 0) {
        return { id, used: +used, subs: +subs };
      }
    }
  }
  return { id: crypto.randomUUID(), used: 0, subs: 0 };
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
