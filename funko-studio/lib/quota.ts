import crypto from "node:crypto";

export const COOKIE_NAME = "fs_quota";
export const MAX_ATTEMPTS = Math.max(1, Number(process.env.MAX_ATTEMPTS) || 15);

const secret = () => process.env.QUOTA_SECRET || "dev-only-secret-change-me";

const sign = (payload: string) =>
  crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

/** Cookie assinado: "<id>.<usadas>.<assinatura>" — impede o cliente de editar o contador. */
export function encode(id: string, used: number): string {
  const payload = `${id}.${used}`;
  return `${payload}.${sign(payload)}`;
}

export function decode(value: string | undefined): { id: string; used: number } {
  if (value) {
    const parts = value.split(".");
    if (parts.length === 3) {
      const [id, used, sig] = parts;
      const expected = sign(`${id}.${used}`);
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      if (a.length === b.length && crypto.timingSafeEqual(a, b) && Number.isInteger(+used) && +used >= 0) {
        return { id, used: +used };
      }
    }
  }
  return { id: crypto.randomUUID(), used: 0 };
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
