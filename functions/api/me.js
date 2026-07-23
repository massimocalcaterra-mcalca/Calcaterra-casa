// GET /api/me -> stato della sessione (per far scegliere alla UI login/galleria).
import { isAuthed, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const configured = !!(env.SITE_PASSWORD && env.AUTH_SECRET);
  const storage = !!env.FOTO_BUCKET;
  return json({ authed: await isAuthed(request, env), configured, storage });
}
