# Sistema di pubblicazione di calcaterra.casa

Questo file è il **manuale operativo** del sito. Descrive come le pagine vengono
pubblicate e modificate. Vale sia per Massimo sia per Claude: chi apre questo repo
deve poter capire tutto da qui, senza contesto esterno.

---

## 1. In breve (il modello mentale)

```
   Claude/Massimo               GitHub                         Cloudflare Pages
   modifica un file   ─push─▶   massimocalcaterra-mcalca/  ─▶  build automatico  ─▶  calcaterra.casa
   (via API o git)             calcaterra-casa                (nessuna compilazione)   (+ eventuali sottodomini)
```

- **Niente build.** Ogni pagina è **HTML statico autonomo**. Si modifica il file e va online così com'è.
- **Deploy automatico.** Ogni `push` sul branch `main` fa ripubblicare il sito da Cloudflare Pages in ~30–60 secondi.
- **Fonte unica di verità:** [`public/site.json`](public/site.json) elenca tutte le pagine.
  L'hub (`public/index.html`) e la mappa (`public/mappa/index.html`) si generano **da soli** leggendo quel file.

---

## 2. Account e permessi

| Cosa | Valore |
|---|---|
| Proprietario repo | **massimocalcaterra-mcalca** (account personale di Massimo) |
| Repo | `massimocalcaterra-mcalca/calcaterra-casa` (privato) |
| Collaboratore con accesso in scrittura | **legnonord** ← è l'account con cui Claude pubblica in automatico |
| Dominio | `calcaterra.casa`, zona su Cloudflare |

> Claude opera da un ambiente autenticato come **legnonord**. Perché possa pubblicare,
> `legnonord` deve restare **collaboratore** del repo. Nessuna password o token viene mai
> condiviso con Claude: si usa solo l'accesso già presente.

---

## 3. Struttura del repo

```
calcaterra-casa/
├── PUBLISHING.md          ← questo manuale
├── README.md
└── public/                ← ciò che Cloudflare pubblica (output directory del progetto Pages)
    ├── site.json          ← ELENCO DI TUTTE LE PAGINE (fonte di verità)
    ├── index.html         ← Home / hub          → calcaterra.casa
    ├── mappa/index.html   ← Mappa grafica        → calcaterra.casa/mappa
    └── bretagna/          ← una pagina-progetto  → calcaterra.casa/bretagna
        ├── index.html
        └── itinerario.pdf
```

**Regola:** una pagina = una cartella dentro `public/` con dentro `index.html`
(+ eventuali asset: pdf, immagini…). Il nome della cartella è lo **slug** = l'URL.
Esempio: `public/madeira/index.html` → `calcaterra.casa/madeira`.

---

## 4. Modello degli URL (misto)

Il modello scelto è **misto**:

- **Percorsi** (default): `calcaterra.casa/<slug>`. Nessun lavoro su Cloudflare: basta
  aggiungere la cartella e fare push. È la modalità normale per (quasi) tutte le pagine.
- **Sottodomini** (per pagine importanti): `<slug>.calcaterra.casa`. Richiede **una tantum**
  un passaggio manuale nel dashboard Cloudflare (vedi §7). La stessa cartella può essere
  servita sia a percorso sia a sottodominio.

In `site.json` il campo `kind` vale `"apex"`, `"percorso"` o `"sottodominio"`.

---

## 5. Come Claude PUBBLICA una pagina nuova (via API GitHub)

Claude lavora **senza clone locale**, scrivendo i file direttamente via API GitHub.
Il repo è `massimocalcaterra-mcalca/calcaterra-casa`, branch `main`.

Per ogni file usa la **Contents API** (`gh api`), che crea/aggiorna un file con un commit.
Esempio per creare `public/madeira/index.html`:

```bash
# 1) prepara il contenuto in base64 (una riga)
B64=$(base64 -i pagina.html)

# 2) crea/aggiorna il file con un commit (dà anche il deploy automatico)
gh api -X PUT repos/massimocalcaterra-mcalca/calcaterra-casa/contents/public/madeira/index.html \
  -f message="Aggiungo pagina Madeira" \
  -f content="$B64" \
  -f branch=main
```

> Per **modificare** un file esistente serve il suo `sha` attuale:
> ```bash
> SHA=$(gh api repos/massimocalcaterra-mcalca/calcaterra-casa/contents/public/madeira/index.html -q .sha)
> gh api -X PUT repos/massimocalcaterra-mcalca/calcaterra-casa/contents/public/madeira/index.html \
>   -f message="Aggiorno testo Madeira" -f content="$B64" -f sha="$SHA" -f branch=main
> ```

### Checklist quando si aggiunge/cambia una pagina
1. Scrivere/aggiornare `public/<slug>/index.html` (+ asset).
2. **Aggiornare `public/site.json`**: aggiungere/modificare la voce della pagina
   (`title`, `slug`, `kind`, `url`, `description`, `status`, `updated`) e il campo `updated` in alto.
3. Fare push (o i commit via API). Fatto: hub e mappa si aggiornano da soli.

> ⚠️ Se salti il punto 2, la pagina è online lo stesso ma **non compare** nell'hub né nella mappa.

---

## 6. Come Massimo modifica a mano (opzionale)

Non serve, ma se vuoi:
- **Da GitHub web:** apri il file, matita ✏️, modifica, "Commit changes". Deploy automatico.
- **Con clone locale:** `git clone`, modifichi, `git commit && git push`.

---

## 7. Setup Cloudflare Pages (una tantum)

Da fare **una sola volta**, nel dashboard `dash.cloudflare.com`:

### A. Progetto principale (percorsi → calcaterra.casa)
1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Autorizza l'account GitHub **massimocalcaterra-mcalca** e scegli il repo `calcaterra-casa`.
3. Impostazioni build:
   - **Framework preset:** `None`
   - **Build command:** *(vuoto)*
   - **Build output directory:** `public`
4. **Save and Deploy**. Esce un URL `*.pages.dev`: verifica che funzioni.
5. **Custom domains → Set up a domain →** `calcaterra.casa` (e volendo `www`). Cloudflare crea i record da solo.

### B. Sottodominio dedicato — `viaggi.calcaterra.casa`
Per servire la sezione viaggi dal repo:
1. Crea un **secondo progetto Pages** collegato allo stesso repo `calcaterra-casa`.
2. **Root directory (advanced):** `public/viaggi` — Framework `None`, Build command vuoto, output `.`.
3. **Custom domains →** `viaggi.calcaterra.casa`.

Risultato: `viaggi.calcaterra.casa` mostra l'hub dei viaggi; l'atlante è in
`viaggi.calcaterra.casa/normandie-bretagna`. Stesso schema per ogni futuro sottodominio.

---

## 8. Migrazione dei sottodomini già online

Le pagine già pubblicate a mano (es. `bretagna.calcaterra.casa`) restano online finché non le tocchi.
Per portarle "sotto il sistema": scaricare i file, metterli in `public/<slug>/`, aggiornare `site.json`,
push, e infine ripuntare il dominio/sottodominio al nuovo progetto Pages (§7).
L'atlante Normandie & Bretagne è già stato importato in `public/viaggi/normandie-bretagna/`;
va servito dal sottodominio `viaggi.calcaterra.casa` (vedi §7B).

---

## 9. Rollback (annullare una modifica)

Ogni pubblicazione è un commit → si torna indietro sempre.
- **Cloudflare:** progetto Pages → **Deployments** → su un deploy precedente **Rollback**. Immediato.
- **Git:** `git revert <commit>` e push, oppure ripristina il file dalla cronologia su GitHub.

---

## 10. Convenzioni

- **Slug/cartelle:** minuscolo, senza spazi né accenti (`chi-siamo`, non `Chi Siamo`).
- **Una pagina è autonoma:** CSS/JS inline o da CDN; gli asset propri stanno nella sua cartella.
- **`status`:** `"online"` = pubblicata e finita; `"bozza"` = c'è ma work-in-progress (badge giallo).
- **Date:** formato `YYYY-MM-DD` nel campo `updated`.
- **Non mettere segreti nel repo** (è materiale pubblicato).
