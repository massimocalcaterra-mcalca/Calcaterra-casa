// GET    /api/foto/<key>        -> restituisce i byte dell'immagine (per <img> e anteprime)
// GET    /api/foto/<key>?dl=1   -> forza il download con il nome originale
// DELETE /api/foto/<key>        -> cancella la foto
import {
  isAuthed,
  unauthorized,
  forbidden,
  sameOrigin,
  imageTypeFor,
  json,
} from "../../_lib/auth.js";

const PREFIX = "foto/";

function keyFrom(params) {
  const seg = Array.isArray(params.name) ? params.name.join("/") : params.name;
  return decodeURIComponent(seg || "");
}

// Nome sicuro per l'header Content-Disposition (niente virgolette o CR/LF).
function safeFilename(s) {
  return String(s || "foto").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "foto";
}

export async function onRequestGet({ request, env, params }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  const name = keyFrom(params);
  if (!name || name.includes("..")) return new Response("Not found", { status: 404 });

  const obj = await env.FOTO_BUCKET.get(PREFIX + name);
  if (!obj) return new Response("Not found", { status: 404 });

  // Il Content-Type si RICALCOLA dall'estensione della chiave: quello salvato
  // in R2 potrebbe venire da un upload precedente alla correzione (es. text/html).
  const headers = new Headers();
  headers.set("Content-Type", imageTypeFor(name) || "application/octet-stream");
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set(
    "Content-Security-Policy",
    "default-src 'none'; sandbox; base-uri 'none'; form-action 'none'"
  );
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Robots-Tag", "noindex, nofollow");

  const url = new URL(request.url);
  if (url.searchParams.get("dl") === "1") {
    const filename = safeFilename(
      (obj.customMetadata && obj.customMetadata.name) || name
    );
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new Response(obj.body, { headers });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!sameOrigin(request)) return forbidden();
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  const name = keyFrom(params);
  if (!name || name.includes("..")) return json({ error: "Chiave non valida." }, 400);

  await env.FOTO_BUCKET.delete(PREFIX + name);
  return json({ ok: true });
}
