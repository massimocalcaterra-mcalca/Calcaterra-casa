// Utility condivise per l'area foto: sessione firmata (HMAC-SHA256) su cookie,
// verifica accessi e piccole helper HTTP. Gira sul runtime di Cloudflare
// (Web Crypto, btoa/atob, Date.now sono disponibili).

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

export async function createToken(secret) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = b64url(enc.encode(JSON.stringify({ exp })));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return payload + "." + b64url(sig);
}

async function verifyToken(secret, token) {
  if (!token || token.indexOf(".") < 0) return false;
  const [payload, sig] = token.split(".");
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(sig),
      enc.encode(payload)
    );
    if (!ok) return false;
    const data = JSON.parse(dec.decode(b64urlToBytes(payload)));
    return !!data.exp && data.exp >= Math.floor(Date.now() / 1000);
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
  return verifyToken(env.AUTH_SECRET, getCookie(request, COOKIE));
}

// Confronto a tempo (quasi) costante per la password.
export function safeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

export function unauthorized() {
  return json({ error: "unauthorized" }, 401);
}
