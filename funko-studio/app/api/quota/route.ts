import { NextRequest, NextResponse } from "next/server";
import { isDemo } from "@/lib/imageai";
import { COOKIE_NAME, MAX_ATTEMPTS, cookieOptions, decode, encode } from "@/lib/quota";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { id, used, subs } = decode(req.cookies.get(COOKIE_NAME)?.value);
  const res = NextResponse.json({
    used,
    max: MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - used),
    demo: isDemo(),
  });
  res.cookies.set(COOKIE_NAME, encode(id, used, subs), cookieOptions);
  return res;
}
