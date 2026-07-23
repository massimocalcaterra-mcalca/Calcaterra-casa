# calcaterra.casa

Sito personale di Massimo Calcaterra. Pagine in **HTML statico** (nessuna compilazione),
pubblicate automaticamente da **Cloudflare Pages** a ogni push su `main`.

- 🏠 **Home / hub:** [`public/index.html`](public/index.html) → https://calcaterra.casa
- 🗺️ **Mappa del sito:** [`public/mappa/index.html`](public/mappa/index.html) → https://calcaterra.casa/mappa
- 🧭 **Fonte di verità della struttura:** [`public/site.json`](public/site.json)
- 📖 **Manuale operativo (come pubblicare/modificare):** [`PUBLISHING.md`](PUBLISHING.md)

## Aggiungere una pagina, in 3 mosse
1. Crea `public/<slug>/index.html` (+ eventuali asset nella stessa cartella).
2. Aggiungi la voce in `public/site.json`.
3. `push`. Online in ~1 minuto; hub e mappa si aggiornano da soli.

Dettagli, setup Cloudflare e rollback: vedi **[PUBLISHING.md](PUBLISHING.md)**.
