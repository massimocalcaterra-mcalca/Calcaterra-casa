// GET  /api/foto  -> elenco delle foto (JSON)
// POST /api/foto  -> upload (multipart/form-data, campo "file", anche multiplo)
import {
  isAuthed,
  unauthorized,
  forbidden,
  sameOrigin,
  imageTypeFor,
  magicBytesOk,
  extOf,
  json,
} from "../../_lib/auth.js";

const PREFIX = "foto/";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per file
const MAX_FILES = 20; // file per singolo invio
const MAX_TOTAL = 60 * 1024 * 1024; // 60 MB per singolo invio

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
        // Tipo ricavato dall'estensione, non da quanto salvato in R2:
        // gli oggetti caricati prima della correzione possono avere
        // un contentType arbitrario scelto dal client.
        type: imageTypeFor(key) || "application/octet-stream",
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
  if (!sameOrigin(request)) return forbidden();
  if (!env.FOTO_BUCKET)
    return json({ error: "Storage non configurato (binding R2 FOTO_BUCKET)." }, 500);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(
      { error: "Richiesta non valida (atteso multipart/form-data).", saved: [], failed: [] },
      400
    );
  }

  const files = form.getAll("file").filter((f) => typeof f !== "string");
  if (!files.length)
    return json({ error: "Nessun file ricevuto.", saved: [], failed: [] }, 400);

  // I limiti d'invio si controllano PRIMA di scrivere: così un invio troppo
  // grande viene respinto per intero, senza lasciare file a metà su R2.
  if (files.length > MAX_FILES)
    return json(
      {
        error: `Troppi file in una volta (massimo ${MAX_FILES}).`,
        saved: [],
        failed: [],
      },
      400
    );
  const totalBytes = files.reduce((n, f) => n + (f.size || 0), 0);
  if (totalBytes > MAX_TOTAL)
    return json(
      {
        error: "L'invio supera il limite complessivo di 60 MB.",
        saved: [],
        failed: [],
      },
      400
    );

  // Il ciclo non esce mai a metà: ogni file finisce in saved o in failed,
  // così il client sa esattamente cosa è stato salvato e può ricaricare.
  const saved = [];
  const failed = [];

  for (const f of files) {
    const display = sanitize(f.name);
    const ext = extOf(display);

    // Il Content-Type deriva SOLO dall'estensione sanitizzata, mai da f.type.
    const contentType = imageTypeFor(display);
    if (!contentType) {
      failed.push({ name: display, reason: "formato non supportato" });
      continue;
    }
    if ((f.size || 0) > MAX_BYTES) {
      failed.push({ name: display, reason: "supera il limite di 15 MB" });
      continue;
    }

    let buf;
    try {
      buf = await f.arrayBuffer();
    } catch {
      failed.push({ name: display, reason: "file illeggibile" });
      continue;
    }

    // Verifica del contenuto reale: l'estensione non basta.
    if (!magicBytesOk(ext, new Uint8Array(buf.slice(0, 16)))) {
      failed.push({ name: display, reason: "il contenuto non è un'immagine valida" });
      continue;
    }

    const key =
      PREFIX +
      Date.now().toString(36) +
      "-" +
      crypto.randomUUID().slice(0, 8) +
      "-" +
      display;
    try {
      await env.FOTO_BUCKET.put(key, buf, {
        httpMetadata: { contentType },
        customMetadata: { name: display },
      });
      saved.push(display);
    } catch {
      failed.push({ name: display, reason: "salvataggio non riuscito" });
    }
  }

  const body = { ok: failed.length === 0, saved, failed };
  if (failed.length) {
    body.error =
      `${failed.length} file non caricati: ` +
      failed.map((x) => `"${x.name}" (${x.reason})`).join(", ");
  }
  // 207 = esito misto: i file riusciti restano salvati.
  return json(body, failed.length ? 207 : 200);
}
