// POST /api/login  { password }  -> imposta il cookie di sessione firmato.
import {
  createToken,
  sessionCookie,
  pwEqual,
  sameOrigin,
  forbidden,
  json,
} from "../_lib/auth.js";
import { tooManyAttempts, clientIp } from "../_lib/ratelimit.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return forbidden();

  if (!env.SITE_PASSWORD || !env.AUTH_SECRET) {
    return json(
      { error: "Autenticazione non configurata (mancano SITE_PASSWORD / AUTH_SECRET)." },
      500
    );
  }

  // Freno sui tentativi ripetuti (attivo solo con il binding KV RATE_KV).
  if (await tooManyAttempts(env, request, { max: 5, windowSec: 300 })) {
    return json({ error: "Troppi tentativi. Riprova tra qualche minuto." }, 429, {
      "Retry-After": "300",
    });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* body vuoto */
  }
  const password = (body && body.password) || "";
  if (!(await pwEqual(password, env.SITE_PASSWORD))) {
    // Traccia dei fallimenti nei log di Cloudflare (nessun dato sensibile).
    const cf = request.cf || {};
    console.warn(
      "login-failed",
      JSON.stringify({
        ip: clientIp(request),
        country: cf.country || request.headers.get("CF-IPCountry") || "",
        ray: request.headers.get("CF-Ray") || "",
        ts: new Date().toISOString(),
      })
    );
    return json({ error: "Password errata." }, 401);
  }

  const token = await createToken(env);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
}
