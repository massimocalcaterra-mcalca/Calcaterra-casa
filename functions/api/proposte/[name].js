// GET    /api/proposte/<file>  -> l'immagine allegata a una proposta (pubblica)
// DELETE /api/proposte/<id>    -> elimina proposta e immagine (richiede password)
import {
  isAuthed,
  unauthorized,
  forbidden,
  sameOrigin,
  imageTypeFor,
  json,
} from "../../_lib/auth.js";

const PREFIX = "proposte/";

// Il nome arriva dall'URL: niente percorsi, niente risalite di cartella.
function chiaveSicura(name) {
  const n = String(name || "").split(/[\\/]/).pop() || "";
  return /^[a-zA-Z0-9._-]{1,120}$/.test(n) && !n.startsWith(".") ? n : "";
}

export async function onRequestGet({ params, env }) {
  const nome = chiaveSicura(params.name);
  if (!nome) return json({ error: "Nome non valido." }, 400);
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  // Il tipo si ricava dall'estensione, mai da quanto salvato in R2.
  const tipo = imageTypeFor(nome);
  if (!tipo) return json({ error: "Tipo non consentito." }, 400);

  const obj = await env.FOTO_BUCKET.get(PREFIX + nome);
  if (!obj) return json({ error: "Non trovata." }, 404);

  return new Response(obj.body, {
    headers: {
      "Content-Type": tipo,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox; base-uri 'none'; form-action 'none'",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function onRequestDelete({ request, params, env }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!sameOrigin(request)) return forbidden();
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  const id = chiaveSicura(params.name);
  if (!id) return json({ error: "Identificativo non valido." }, 400);

  const meta = await env.FOTO_BUCKET.get(PREFIX + id + ".json");
  if (!meta) return json({ error: "Proposta non trovata." }, 404);

  // Prima l'immagine, poi i metadati: se la seconda fallisce resta una
  // proposta senza foto, non una foto orfana che nessuno sa piu' cancellare.
  try {
    const d = JSON.parse(await meta.text());
    if (d && d.file) await env.FOTO_BUCKET.delete(PREFIX + d.file);
  } catch {
    // metadati illeggibili: si elimina comunque il JSON
  }
  await env.FOTO_BUCKET.delete(PREFIX + id + ".json");

  return json({ ok: true, eliminata: id });
}
