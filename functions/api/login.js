// POST /api/login  { password }  -> imposta il cookie di sessione firmato.
import { createToken, sessionCookie, safeEqual, json } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.SITE_PASSWORD || !env.AUTH_SECRET) {
    return json(
      { error: "Autenticazione non configurata (mancano SITE_PASSWORD / AUTH_SECRET)." },
      500
    );
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* body vuoto */
  }
  const password = (body && body.password) || "";
  if (!safeEqual(password, env.SITE_PASSWORD)) {
    return json({ error: "Password errata." }, 401);
  }
  const token = await createToken(env.AUTH_SECRET);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
}
