// Utility condivise per l'area foto: sessione firmata (HMAC-SHA256) su cookie,
// verifica accessi, tipi immagine consentiti e piccole helper HTTP. Gira sul
// runtime di Cloudflare (Web Crypto, btoa/atob, Date.now sono disponibili).

const enc = new TextEncoder();
const dec = new TextDecoder();

const COOKIE = "foto_session";
const TTL = 60 * 60 * 12; // 12 ore

function b64url(bytes) {
  const arr = new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Versione della sessione: basta incrementare AUTH_VERSION su Cloudflare
// per invalidare tutti i token già emessi (logout globale, sessione revocabile).
function authVersion(env) {
  return String((env && env.AUTH_VERSION) || "1");
}

export async function createToken(env) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = b64url(
    enc.encode(JSON.stringify({ exp, v: authVersion(env) }))
  );
  const key = await hmacKey(env.AUTH_SECRET);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return payload + "." + b64url(sig);
}

async function verifyToken(env, token) {
  if (!token) return false;
  // Formato rigido: esattamente "payload.firma" (con più punti si rifiuta).
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [payload, sig] = parts;
  try {
    const key = await hmacKey(env.AUTH_SECRET);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(sig),
      enc.encode(payload)
    );
    if (!ok) return false;
    const data = JSON.parse(dec.decode(b64urlToBytes(payload)));
    if (!data || typeof data.exp !== "number") return false;
    const now = Math.floor(Date.now() / 1000);
    if (data.exp < now) return false;
    // Clamp: una scadenza oltre il TTL previsto non è plausibile.
    if (data.exp > now + TTL + 60) return false;
    // Sessione revocata via AUTH_VERSION.
    if (String(data.v || "") !== authVersion(env)) return false;
    return true;
  } catch {
    return false;
  }
}

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAuthed(request, env) {
  if (!env.AUTH_SECRET) return false;
  return verifyToken(env, getCookie(request, COOKIE));
}

// SameSite=Strict è same-SITE, non same-ORIGIN: un sottodominio
// (es. viaggi.calcaterra.casa) invierebbe comunque il cookie, e un POST
// multipart è CORS-safelisted (nessun preflight). Per i metodi che
// modificano stato pretendiamo quindi l'Origin esatto, fail-closed.
export function sameOrigin(request) {
  const m = String(request.method || "GET").toUpperCase();
  if (m === "GET" || m === "HEAD") return true;
  const here = new URL(request.url).origin;

  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      return new URL(origin).origin === here;
    } catch {
      return false;
    }
  }
  // Ripiego sul Referer: alcuni browser non mandano Origin sulle richieste
  // same-origin, e un fail-closed secco chiuderebbe fuori il proprietario.
  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      return new URL(referer).origin === here;
    } catch {
      return false;
    }
  }
  // Nessuno dei due header: si passa. La difesa resta SameSite=Strict, che
  // impedisce a un sito terzo di far viaggiare il cookie; il caso che questa
  // funzione chiude davvero (un sottodominio same-site) manda sempre l'Origin.
  return true;
}

async function sha256(str) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(str)));
}

// Confronto password a tempo costante sugli hash SHA-256 (sempre 32 byte):
// così la lunghezza della password non è più osservabile dai tempi.
export async function pwEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(String(a)), sha256(String(b))]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

// Confronto a tempo (quasi) costante su stringhe di pari lunghezza.
// Mantenuto per compatibilità: per le password usare pwEqual.
export function safeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- Tipi immagine consentiti (unica fonte di verità: upload e download) ---
// Niente SVG né BMP: l'SVG è un documento eseguibile e verrebbe servito
// sull'origine del sito. Il Content-Type non arriva MAI dal client.
export const SAFE_IMAGE_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

// Estensione (minuscola, senza punto) ricavata da un nome file o da una chiave R2.
export function extOf(nameOrKey) {
  const m = String(nameOrKey || "").match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

// Content-Type derivato SOLO dall'estensione. null se non è un tipo consentito.
export function imageTypeFor(nameOrKey) {
  return SAFE_IMAGE_TYPES[extOf(nameOrKey)] || null;
}

// Controllo dei magic byte sui primi 12-16 byte: l'estensione da sola
// non basta (un .jpg può contenere HTML).
export function magicBytesOk(ext, head) {
  const type = SAFE_IMAGE_TYPES[String(ext || "").toLowerCase()];
  if (!type || !head || head.length < 12) return false;
  const at = (off, s) => {
    for (let i = 0; i < s.length; i++) {
      if (head[off + i] !== s.charCodeAt(i)) return false;
    }
    return true;
  };
  switch (type) {
    case "image/jpeg":
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    case "image/png":
      return head[0] === 0x89 && at(1, "PNG");
    case "image/gif":
      return at(0, "GIF");
    case "image/webp":
      return at(0, "RIFF") && at(8, "WEBP");
    default:
      return at(4, "ftyp"); // avif / heic / heif (contenitori ISO-BMFF)
  }
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "private, no-store",
      ...extraHeaders,
    },
  });
}

export function unauthorized() {
  return json({ error: "unauthorized" }, 401);
}

export function forbidden() {
  return json({ error: "Richiesta non consentita (origine non valida)." }, 403);
}
