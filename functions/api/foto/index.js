// GET  /api/foto  -> elenco delle foto (JSON)
// POST /api/foto  -> upload (multipart/form-data, campo "file", anche multiplo)
import { isAuthed, unauthorized, json } from "../../_lib/auth.js";

const PREFIX = "foto/";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per file

function sanitize(name) {
  const base = String(name || "foto").split(/[\\/]/).pop() || "foto";
  return (
    base
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^\.+/, "")
      .slice(0, 120) || "foto"
  );
}

export async function onRequestGet({ request, env }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!env.FOTO_BUCKET)
    return json({ error: "Storage non configurato (binding R2 FOTO_BUCKET)." }, 500);

  const items = [];
  let cursor;
  do {
    const res = await env.FOTO_BUCKET.list({
      prefix: PREFIX,
      cursor,
      include: ["customMetadata", "httpMetadata"],
    });
    for (const o of res.objects) {
      const key = o.key.slice(PREFIX.length);
      if (!key) continue;
      items.push({
        key,
        name: (o.customMetadata && o.customMetadata.name) || key,
        size: o.size,
        type: (o.httpMetadata && o.httpMetadata.contentType) || "image/*",
        uploaded: o.uploaded,
      });
    }
    cursor = res.truncated ? res.cursor : undefined;
  } while (cursor);

  items.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
  return json({ items });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!env.FOTO_BUCKET)
    return json({ error: "Storage non configurato (binding R2 FOTO_BUCKET)." }, 500);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Richiesta non valida (atteso multipart/form-data)." }, 400);
  }

  const files = form.getAll("file").filter((f) => typeof f !== "string");
  if (!files.length) return json({ error: "Nessun file ricevuto." }, 400);

  const IMG_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic|heif)$/i;
  const saved = [];
  for (const f of files) {
    const looksImage =
      (f.type && f.type.startsWith("image/")) || IMG_EXT.test(f.name || "");
    if (!looksImage)
      return json({ error: `"${f.name}" non è un'immagine.` }, 400);
    if (f.size > MAX_BYTES)
      return json({ error: `"${f.name}" supera il limite di 15 MB.` }, 400);

    const display = sanitize(f.name);
    const key = PREFIX + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8) + "-" + display;
    const ext = (display.match(/\.([a-z0-9]+)$/i) || [, ""])[1].toLowerCase();
    const extType = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", bmp: "image/bmp", svg: "image/svg+xml", avif: "image/avif", heic: "image/heic", heif: "image/heif" }[ext];
    await env.FOTO_BUCKET.put(key, await f.arrayBuffer(), {
      httpMetadata: { contentType: f.type || extType || "application/octet-stream" },
      customMetadata: { name: display },
    });
    saved.push(display);
  }
  return json({ ok: true, saved });
}
