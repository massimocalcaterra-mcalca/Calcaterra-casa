// POST /api/logout -> cancella il cookie di sessione.
// Nota: per revocare le sessioni già emesse su tutti i dispositivi basta
// incrementare la variabile AUTH_VERSION su Cloudflare.
import { clearCookie, sameOrigin, forbidden, json } from "../_lib/auth.js";

export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) return forbidden();
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
