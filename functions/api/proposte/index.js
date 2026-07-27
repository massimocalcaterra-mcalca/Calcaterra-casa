// GET  /api/proposte  -> elenco delle proposte (pubblico in lettura)
// POST /api/proposte  -> nuova proposta (richiede la password del sito)
//
// Le proposte sono i suggerimenti che Massimo raccoglie per il viaggio
// Normandia & Bretagna: una foto di una pagina di guida, un link, una nota.
// Vengono depositate nel bucket R2 gia' usato dall'area foto, sotto il
// prefisso "proposte/", e ogni proposta e' una coppia:
//   proposte/<id>.json   i metadati
//   proposte/<id>.<ext>  l'immagine, se ce n'e' una
//
// LETTURA PUBBLICA, SCRITTURA PROTETTA. La scelta e' voluta: il lavoro
// automatico che tre volte al giorno analizza le proposte non ha modo di
// autenticarsi, e il contenuto (posti che si stanno valutando per un viaggio)
// non e' piu' sensibile della guida stessa, che e' pubblica. Per chiudere
// anche la lettura basta aggiungere il controllo isAuthed alla onRequestGet.
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
import { tooManyAttempts } from "../../_lib/ratelimit.js";

const PREFIX = "proposte/";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per immagine
const MAX_TESTO = 2000; // caratteri per nota e titolo
const MAX_PROPOSTE = 500; // tetto complessivo, per non riempire il bucket

function pulisci(s, max) {
  return String(s == null ? "" : s)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

// Accetta solo http/https: un javascript: o data: nel campo link finirebbe
// in pagina come collegamento cliccabile.
function urlValido(u) {
  if (!u) return "";
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : "";
  } catch {
    return "";
  }
}

export async function onRequestGet({ env }) {
  if (!env.FOTO_BUCKET)
    return json({ error: "Storage non configurato (binding R2 FOTO_BUCKET).", items: [] }, 500);

  const items = [];
  let cursor;
  do {
    const res = await env.FOTO_BUCKET.list({ prefix: PREFIX, cursor });
    for (const o of res.objects) {
      if (!o.key.endsWith(".json")) continue;
      const obj = await env.FOTO_BUCKET.get(o.key);
      if (!obj) continue;
      try {
        const d = JSON.parse(await obj.text());
        if (d && d.id) items.push(d);
      } catch {
        // un JSON illeggibile non deve far fallire tutto l'elenco
      }
    }
    cursor = res.truncated ? res.cursor : undefined;
  } while (cursor);

  items.sort((a, b) => String(b.creata || "").localeCompare(String(a.creata || "")));
  return json({ items, totale: items.length });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) return unauthorized();
  if (!sameOrigin(request)) return forbidden();
  if (!env.FOTO_BUCKET)
    return json({ error: "Storage non configurato (binding R2 FOTO_BUCKET)." }, 500);

  if (await tooManyAttempts(env, request, { max: 30, windowSec: 300 })) {
    return json({ error: "Troppe proposte in poco tempo. Riprova fra qualche minuto." }, 429, {
      "Retry-After": "300",
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Richiesta non valida (atteso multipart/form-data)." }, 400);
  }

  const titolo = pulisci(form.get("titolo"), 200);
  const nota = pulisci(form.get("nota"), MAX_TESTO);
  const link = urlValido(pulisci(form.get("link"), 600));
  const linkGrezzo = pulisci(form.get("link"), 600);
  const file = form.get("file");
  const haFile = file && typeof file !== "string" && file.size > 0;

  if (linkGrezzo && !link)
    return json({ error: "Il link non è valido: sono ammessi solo indirizzi http:// o https://." }, 400);
  if (!haFile && !link && !nota)
    return json({ error: "Serve almeno una foto, un link o una nota." }, 400);

  // Tetto complessivo: si conta prima di scrivere.
  let quante = 0;
  let cursor;
  do {
    const res = await env.FOTO_BUCKET.list({ prefix: PREFIX, cursor });
    quante += res.objects.filter((o) => o.key.endsWith(".json")).length;
    cursor = res.truncated ? res.cursor : undefined;
  } while (cursor);
  if (quante >= MAX_PROPOSTE)
    return json({ error: `Raggiunto il limite di ${MAX_PROPOSTE} proposte.` }, 409);

  const id = Date.now().toString(36) + "-" + crypto.randomUUID().slice(0, 8);
  let nomeFile = "";

  if (haFile) {
    const ext = extOf(file.name);
    const contentType = imageTypeFor(file.name);
    if (!contentType)
      return json({ error: "Formato immagine non supportato." }, 400);
    if ((file.size || 0) > MAX_BYTES)
      return json({ error: "L'immagine supera il limite di 8 MB." }, 400);

    let buf;
    try {
      buf = await file.arrayBuffer();
    } catch {
      return json({ error: "Immagine illeggibile." }, 400);
    }
    if (!magicBytesOk(ext, new Uint8Array(buf.slice(0, 16))))
      return json({ error: "Il contenuto del file non è un'immagine valida." }, 400);

    nomeFile = id + "." + ext;
    await env.FOTO_BUCKET.put(PREFIX + nomeFile, buf, {
      httpMetadata: { contentType },
      customMetadata: { proposta: id },
    });
  }

  const dati = {
    id,
    creata: new Date().toISOString(),
    titolo,
    link,
    nota,
    file: nomeFile,
    viaggio: "normandie-bretagna",
    stato: "da valutare",
  };
  await env.FOTO_BUCKET.put(PREFIX + id + ".json", JSON.stringify(dati), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });

  return json({ ok: true, proposta: dati }, 201);
}
