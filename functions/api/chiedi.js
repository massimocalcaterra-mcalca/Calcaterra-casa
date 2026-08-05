// POST /api/chiedi -> una domanda dalla strada, con la posizione del telefono.
//
// Serve il pulsante "Chiedi" delle pagine della guida: Massimo è fermo da
// qualche parte in Normandia o in Bretagna, apre la giornata sul telefono e
// chiede indicazioni, una curiosità sui dintorni o dove mangiare. Il browser
// manda la posizione, l'ora e le tappe della pagina che gli stanno più vicine;
// qui si aggiunge il mestiere e si risponde.
//
// COSTA SOLDI. Ogni chiamata è una chiamata all'API Anthropic, pagata con la
// chiave del proprietario. Da qui tre difese, in ordine di importanza:
//   1. stessa origine obbligatoria: niente richieste da altri siti;
//   2. rate limit per IP, con il suo contatore separato da quello del login;
//   3. tetto rigido sulla lunghezza della domanda e della risposta.
// Se la chiave non è configurata l'endpoint risponde 503 con un messaggio
// esplicito, e il pulsante nella pagina lo mostra invece di rompersi: la
// guida resta utilizzabile per intero anche senza questa funzione.
//
// CONFIGURAZIONE. Nel progetto Pages "viaggi" (e nell'apex, se lo si vuole
// anche lì) va aggiunta la variabile d'ambiente cifrata:
//   ANTHROPIC_API_KEY = sk-ant-...
// Facoltative:
//   CHIEDI_MODELLO    = id del modello, se si vuole cambiarlo senza toccare il codice
//   CHIEDI_MAX_GIORNO = tetto di richieste al giorno per IP (default 40)
import { sameOrigin, forbidden, json } from "../_lib/auth.js";
import { tooManyAttempts } from "../_lib/ratelimit.js";

const MODELLO_DEFAULT = "claude-sonnet-5";
const MAX_DOMANDA = 400; // caratteri
const MAX_TOKEN_RISPOSTA = 700;

const SISTEMA = `Sei la guida di viaggio di Massimo, in strada in Normandia e Bretagna
fra il 6 e il 16 agosto 2026. Ti scrive dal telefono, fermo da qualche parte, e
ha bisogno di una risposta che si legge in piedi.

COME RISPONDERE
- In italiano, breve: tre o quattro frasi, o un elenco corto. Mai preamboli.
- Concreto: nomi propri, orari, distanze. Mai "potresti valutare di".
- Se ti do le tappe vicine con la loro distanza, usale: sono verificate e sono
  il contesto migliore che hai.
- Se non sai una cosa — un orario, se un posto è aperto oggi, un prezzo — dillo
  in mezza riga invece di inventarla. Vale più di una risposta completa e falsa.
- Le distanze che non ti sono state date non stimarle a occhio: di' che vanno
  guardate in mappa.

COSA SAPERE DEL VIAGGIO
- Si viaggia in auto a noleggio, ritirata e riconsegnata a Parigi-Beauvais.
- La Normandia è terra di sidro, camembert e panna; la Bretagna di grano
  saraceno, crostacei e birra artigianale.
- In Francia il servizio è compreso: la mancia non è dovuta.
- Il limite alcolemico è 0,5 g/l e chi guida non assaggia.
- Ad agosto molti locali chiudono per ferie senza preavviso, e il giorno di
  chiusura settimanale taglia fuori più tavole di quanto si creda: se consigli
  un posto, ricorda di far controllare che sia aperto.`;

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return forbidden();

  // Il contatore è suo, separato da quello del login: una domanda dalla strada
  // non deve consumare i tentativi di accesso e viceversa.
  const maxGiorno = parseInt(env.CHIEDI_MAX_GIORNO || "40", 10) || 40;
  if (await tooManyAttempts(env, request, { prefix: "chiedi", max: maxGiorno, windowSec: 86400 })) {
    return json({ error: "Hai raggiunto il limite di domande per oggi." }, 429);
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      {
        error:
          "La risposta in tempo reale non è configurata: manca la chiave API " +
          "nelle impostazioni del sito. Le tappe qui sotto funzionano lo stesso.",
      },
      503,
    );
  }

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return json({ error: "Richiesta non leggibile." }, 400);
  }

  const domanda = String(corpo.domanda || "").slice(0, MAX_DOMANDA).trim();
  if (!domanda) return json({ error: "Manca la domanda." }, 400);

  // Il contesto arriva dalla pagina: posizione, ora, giornata e tappe vicine.
  // Si ricostruisce qui in testo perché il modello lo legga come una nota, non
  // come un oggetto da interpretare.
  const righe = [];
  const lat = Number(corpo.lat), lon = Number(corpo.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    righe.push(`Posizione ora: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  } else {
    righe.push("Posizione: non disponibile — il telefono non l'ha data.");
  }
  if (corpo.quando) righe.push(`Ora locale: ${String(corpo.quando).slice(0, 40)}`);
  if (corpo.giorno) righe.push(`Sta leggendo: ${String(corpo.giorno).slice(0, 120)}`);

  const vicini = Array.isArray(corpo.vicini) ? corpo.vicini.slice(0, 12) : [];
  if (vicini.length) {
    righe.push("Tappe e locali della guida più vicini a lui adesso:");
    for (const v of vicini) {
      const nome = String(v.nome || "").slice(0, 90);
      const dist = Number(v.km);
      const nota = String(v.nota || "").slice(0, 120);
      if (!nome) continue;
      righe.push(
        `- ${nome}` +
          (Number.isFinite(dist) ? ` — a ${dist < 1 ? Math.round(dist * 1000) + " m" : dist.toFixed(1).replace(".", ",") + " km"}` : "") +
          (nota ? ` · ${nota}` : ""),
      );
    }
  }

  const messaggio = righe.join("\n") + "\n\nDomanda: " + domanda;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.CHIEDI_MODELLO || MODELLO_DEFAULT,
        max_tokens: MAX_TOKEN_RISPOSTA,
        system: SISTEMA,
        messages: [{ role: "user", content: messaggio }],
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      // Non si rimanda al browser il corpo dell'errore: può contenere dettagli
      // dell'account. Si logga e si risponde in modo generico.
      console.log("chiedi: risposta non ok", r.status, t.slice(0, 300));
      return json({ error: "Non sono riuscito a rispondere adesso. Riprova fra poco." }, 502);
    }

    const d = await r.json();
    const testo = (d.content || [])
      .filter((b) => b && b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!testo) return json({ error: "Risposta vuota. Riprova." }, 502);
    return json({ risposta: testo });
  } catch (e) {
    console.log("chiedi: eccezione", String(e).slice(0, 200));
    return json({ error: "Non sono riuscito a rispondere adesso. Riprova fra poco." }, 502);
  }
}
