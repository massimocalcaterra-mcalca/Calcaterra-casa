// GET    /api/foto/<key>        -> restituisce i byte dell'immagine (per <img> e anteprime)
// GET    /api/foto/<key>?dl=1   -> forza il download con il nome originale
// DELETE /api/foto/<key>        -> cancella la foto
import { isAuthed, unauthorized, json } from "../../_lib/auth.js";

const PREFIX = "foto/";

function keyFrom(params) {
  const seg = Array.isArray(params.name) ? params.name.join("/") : params.name;
  return decodeURIComponent(seg || "");
}

export async function onRequestGet({ request, env, params }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  const name = keyFrom(params);
  if (!name || name.includes("..")) return new Response("Not found", { status: 404 });

  const obj = await env.FOTO_BUCKET.get(PREFIX + name);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "private, max-age=3600");

  const url = new URL(request.url);
  if (url.searchParams.get("dl") === "1") {
    const filename = (obj.customMetadata && obj.customMetadata.name) || name;
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new Response(obj.body, { headers });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!env.FOTO_BUCKET) return json({ error: "Storage non configurato." }, 500);

  const name = keyFrom(params);
  if (!name || name.includes("..")) return json({ error: "Chiave non valida." }, 400);

  await env.FOTO_BUCKET.delete(PREFIX + name);
  return json({ ok: true });
}
