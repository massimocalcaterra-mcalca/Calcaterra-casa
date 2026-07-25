// GET /api/me -> stato della sessione (per far scegliere alla UI login/galleria).
// I campi configured/storage restano sempre presenti: la pagina foto li usa
// per decidere se mostrare la schermata di setup, e trattarli come assenti
// (undefined -> falsy) la manderebbe sempre in "setup". Sono due booleani
// che in un deploy sano valgono true e non rivelano nulla di sfruttabile;
// il dettaglio di cosa manca resta nella pagina, non nell'API.
import { isAuthed, json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const configured = !!(env.SITE_PASSWORD && env.AUTH_SECRET);
  const storage = !!env.FOTO_BUCKET;
  return json({ authed: await isAuthed(request, env), configured, storage });
}
