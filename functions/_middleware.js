// Cancello dell'area viaggi: password all'ingresso di viaggi.calcaterra.casa.
//
// PERCHE' STA QUI E NON DENTRO LE PAGINE. Le guide sono HTML statico: un
// controllo fatto in JavaScript nella pagina nasconderebbe il contenuto dopo
// averlo gia' consegnato al browser, e basterebbe leggere il sorgente. L'unico
// punto in cui si puo' fermare davvero una richiesta prima che l'HTML esca e'
// qui, nel middleware, che Cloudflare Pages esegue PRIMA di servire gli asset
// statici ("Pages defaults to serving your Pages Functions ahead of static
// assets").
//
// ATTENZIONE — QUESTA CARTELLA E' CONDIVISA DA DUE PROGETTI. functions/ sta
// nella radice del repo e viene compilata sia dal progetto dell'apex
// (calcaterra.casa, output public/) sia da quello dei viaggi
// (viaggi.calcaterra.casa, output public/viaggi/). Un middleware scritto male
// qui chiuderebbe fuori anche l'apex. Due difese indipendenti lo impediscono:
//   1. public/_routes.json limita le Functions dell'apex a /api/*, quindi su
//      calcaterra.casa questo file non viene proprio invocato per le pagine;
//   2. areaProtetta() qui sotto controlla comunque l'hostname e lascia passare
//      tutto cio' che non e' il sottodominio dei viaggi.
//
// L'INTERRUTTORE E' LA PASSWORD STESSA. La protezione si attiva solo quando nel
// progetto Pages dei viaggi esistono SITE_PASSWORD e AUTH_SECRET. Finche' non
// ci sono, il sito resta pubblico esattamente come prima. E' voluto: il deploy
// e' automatico a ogni push, e un middleware fail-closed manderebbe offline le
// guide nell'intervallo fra la pubblicazione e il momento in cui le variabili
// vengono impostate a mano nel dashboard. Impostare la password E' l'atto di
// accendere la protezione, non un secondo passaggio da ricordare.
//
// La sessione e' la stessa dell'area foto (stesso cookie firmato, stessa
// SITE_PASSWORD, stesso AUTH_SECRET): una sola password da ricordare. Il cookie
// resta pero' legato all'host che lo emette — non ha l'attributo Domain — quindi
// l'accesso ai viaggi e quello alle foto sono due sessioni distinte, con la
// stessa password. E' la scelta prudente: un cookie valido su tutto
// *.calcaterra.casa viaggerebbe verso ogni sottodominio presente e futuro.
import { isAuthed } from "./_lib/auth.js";

// Percorsi che devono restare raggiungibili anche senza sessione, altrimenti
// non si entrerebbe mai: la pagina di accesso e i file che i browser e i
// sistemi operativi chiedono da soli.
const ESENTI = new Set([
  "/accesso",
  "/accesso/",
  "/accesso/index.html",
  "/robots.txt",
  "/favicon.ico",
  "/site.webmanifest",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
]);

// VIAGGI_PRIVATO permette di forzare la decisione senza toccare il codice:
// "1" protegge comunque (serve sulle anteprime *.pages.dev, che hanno un
// hostname diverso), "0" disattiva tutto in caso di emergenza.
function areaProtetta(url, env) {
  const forza = String((env && env.VIAGGI_PRIVATO) || "");
  if (forza === "0") return false;
  if (forza === "1") return true;
  return url.hostname.split(".")[0] === "viaggi";
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  if (!areaProtetta(url, env)) return next();
  if (!env.SITE_PASSWORD || !env.AUTH_SECRET) return next();

  const percorso = url.pathname;

  // /api/* si difende da solo: /api/login deve restare aperto per definizione,
  // e gli endpoint che richiedono la sessione la controllano gia' internamente.
  if (percorso.startsWith("/api/")) return next();
  if (ESENTI.has(percorso)) return next();

  if (await isAuthed(request, env)) return next();

  // Solo una navigazione vera merita di essere dirottata sulla pagina di
  // accesso. Per un foglio di stile, uno script o un'immagine il posto giusto
  // e' un 401 secco: una redirezione consegnerebbe dell'HTML a chi si aspetta
  // un asset, e il browser lo segnalerebbe come errore di tipo MIME.
  const metodo = String(request.method || "GET").toUpperCase();
  const navigazione =
    (metodo === "GET" || metodo === "HEAD") &&
    (request.headers.get("Sec-Fetch-Mode") === "navigate" ||
      String(request.headers.get("Accept") || "").includes("text/html"));

  const comuni = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
  };

  if (navigazione) {
    // Si porta dietro la destinazione voluta, cosi' dopo la password si
    // atterra sulla pagina cercata invece che sulla home.
    const da = percorso + url.search;
    return new Response(null, {
      status: 302,
      headers: { ...comuni, Location: "/accesso/?da=" + encodeURIComponent(da) },
    });
  }

  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { ...comuni, "Content-Type": "application/json; charset=utf-8" },
  });
}
