// POST /api/logout -> cancella il cookie di sessione.
import { clearCookie, json } from "../_lib/auth.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
