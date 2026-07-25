// Rate limiting best-effort per il login, su Workers KV (binding OPZIONALE
// RATE_KV). Fail-open per scelta: se il binding manca o KV dà errore non si
// blocca nessuno, così il proprietario non resta mai fuori per una svista di
// configurazione. Con RATE_KV configurato: max tentativi per IP per finestra.

export function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

// true = superato il limite, la richiesta va respinta con 429.
export async function tooManyAttempts(env, request, opts = {}) {
  const max = opts.max || 5;
  const windowSec = opts.windowSec || 300;
  if (!env || !env.RATE_KV) return false; // fail-open: binding assente

  // Finestra fissa: la chiave cambia da sola allo scadere del periodo.
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const key = `login:${clientIp(request)}:${bucket}`;
  try {
    const n = parseInt((await env.RATE_KV.get(key)) || "0", 10) || 0;
    if (n >= max) return true;
    await env.RATE_KV.put(key, String(n + 1), {
      expirationTtl: Math.max(60, windowSec * 2),
    });
    return false;
  } catch {
    return false; // fail-open anche sugli errori di KV
  }
}
