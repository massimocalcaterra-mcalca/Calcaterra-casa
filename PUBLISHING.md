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
| Repo | `massimocalcaterra-mcalca/Calcaterra-casa` — **PUBBLICO** (branch `main`) |
| Dominio | `calcaterra.casa`, zona su Cloudflare |

Il repo è **pubblico**: chiunque può leggerlo/clonarlo, ma per **scrivere** (push) serve
un accesso autorizzato. Ci sono due canali, a seconda di *dove* gira Claude:

**A) Claude Code (ambiente desktop/terminale)** — il canale principale.
Claude opera da un ambiente con `git`/`gh` autenticati come **`legnonord`**, che è
**collaboratore con accesso in scrittura** al repo. Pubblica via `gh api` (Contents API)
o `git push`. Nessun token viene condiviso: si usa l'accesso già presente.
→ Perché continui a funzionare, `legnonord` deve restare **collaboratore** del repo.

**B) Chat di claude.ai** — canale secondario (per pubblicare "al volo" dalla chat).
In chat **non** c'è un connettore GitHub né `gh`. Il metodo che funziona è un
**fine-grained Personal Access Token** limitato a QUESTO repo, con permesso
**Contents: Read and write**, che Claude usa con `git` (clone/push).
→ Crea il token su GitHub → *Settings → Developer settings → Fine-grained tokens*,
   *Repository access: Only select repositories → Calcaterra-casa*, *Permissions → Contents: Read and write*.
   Fornisci quel token alla chat quando vuoi pubblicare. È **revocabile** in qualsiasi momento
   e non dà accesso ad altro. Non riusarlo altrove.

**C) Manuale** — sempre possibile: modifica i file da GitHub web (matita ✏️ → commit) o
con un clone locale (`git commit && git push`). Vedi §6.

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

## 5. Come Claude PUBBLICA una pagina nuova

Il metodo cambia a seconda del canale (vedi §2), ma il risultato è identico: un commit
su `main` con il file nuovo/aggiornato e, quando serve, `public/site.json` allineato.

### 5A. Canale "Claude Code" — via API GitHub (`gh`)

Claude lavora **senza clone locale**, scrivendo i file direttamente via API GitHub.
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

### 5B. Canale "Chat di claude.ai" — via `git` con token fornito in chat

Niente `gh`, niente connettore (a meno che non sia stato collegato): l'utente incolla in
chat un fine-grained token scoped su questo repo (vedi §2B), e Claude lavora con `git`
in un ambiente temporaneo (es. una sandbox cloud), senza mai salvare il token in modo
permanente:

```bash
# 1) clona il repo usando il token solo nell'URL della singola operazione
git clone "https://<TOKEN>@github.com/massimocalcaterra-mcalca/calcaterra-casa.git" repo
cd repo

# 2) crea/aggiorna i file (es. public/madeira/index.html) e public/site.json

# 3) commit e push
git add public/madeira/index.html public/site.json
git commit -m "Aggiungo pagina Madeira"
git push origin main

# 4) igiene: non lasciare il token nel remote salvato
git remote set-url origin "https://github.com/massimocalcaterra-mcalca/calcaterra-casa.git"
```

> Il token non va mai scritto nei file del repo né in commit: vive solo nell'URL usato
> per il clone/push di quella singola sessione di chat.

### Checklist quando si aggiunge/cambia una pagina (entrambi i canali)
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

---

## 11. Sezione Foto — area privata con upload/download/delete

La pagina **`/foto`** (`public/foto/index.html`) è una **galleria privata**: si accede con
password e si possono **caricare, scaricare ed eliminare** foto. A differenza del resto del
sito (HTML statico puro), questa sezione ha bisogno di un piccolo **backend serverless**,
già incluso nel repo. Non c'è build: sono file che Cloudflare esegue da solo.

### Come è fatta (cosa c'è già nel repo)

```
functions/                     ← Cloudflare Pages Functions (serverless, servite su calcaterra.casa/api/*)
├── _lib/auth.js               ← sessione firmata (HMAC) + helper
├── api/login.js               ← POST /api/login   (password → cookie di sessione, 12h)
├── api/logout.js              ← POST /api/logout
├── api/me.js                  ← GET  /api/me      (stato sessione/configurazione)
└── api/foto/
    ├── index.js               ← GET (elenco) · POST (upload multiplo)
    └── [name].js              ← GET (visualizza/scarica) · DELETE (elimina)
public/foto/index.html         ← la galleria (login, drag&drop, download, delete)
```

- Le foto sono salvate su **Cloudflare R2** (storage oggetti), con prefisso `foto/`.
- L'accesso è protetto da **password condivisa** + cookie di sessione **firmato HMAC**
  (`HttpOnly`, `Secure`, `SameSite=Strict`, durata 12h). Nessuna foto è raggiungibile
  senza login: anche le anteprime passano dalle API autenticate.
- La pagina è `noindex` e non compare nei motori di ricerca.

### Setup una-tantum su Cloudflare (≈5 minuti)

Da fare **una sola volta** sul **progetto Pages principale** (quello di `calcaterra.casa`),
in `dash.cloudflare.com`:

1. **Crea il bucket R2.** *R2 → Create bucket* → nome es. `calcaterra-foto`. (R2 ha un piano
   gratuito generoso; serve attivarlo la prima volta.)
2. **Collega il bucket alle Functions.** Progetto Pages → *Settings → Functions →
   R2 bucket bindings → Add binding*:
   - **Variable name:** `FOTO_BUCKET`  (esatto: il codice cerca questo nome)
   - **R2 bucket:** `calcaterra-foto`
3. **Imposta le due variabili d'ambiente** (Progetto Pages → *Settings → Environment
   variables → Production*), entrambe come **Secret** (Encrypt):
   - `SITE_PASSWORD` → la password d'accesso alla galleria (scegline una robusta).
   - `AUTH_SECRET` → una stringa lunga e casuale per firmare i cookie
     (es. genera con `openssl rand -hex 32`). **Non** deve mai finire nel repo.
4. **Ripubblica** (un push qualsiasi, oppure *Deployments → Retry deployment*). Fatto:
   `calcaterra.casa/foto` chiede la password e funziona.

> Finché mancano bucket o variabili, la pagina `/foto` mostra un avviso "Da configurare"
> e indica cosa manca — non dà errori né espone nulla.

### Uso quotidiano
- Vai su `calcaterra.casa/foto`, inserisci la password.
- **Carica:** trascina le foto nel riquadro o "Scegli dal dispositivo" (anche multiple, ≤15 MB l'una, solo immagini).
- **Scarica:** passa il mouse su una foto → ⬇.
- **Elimina:** icona 🗑 (chiede conferma, è definitiva).
- **Esci:** bottone "Esci" (o dopo 12h scade la sessione).

### Sicurezza — note e opzioni
- La password è **condivisa** (una sola, per te). Per cambiarla: aggiorna `SITE_PASSWORD` su
  Cloudflare e ripubblica; le sessioni attive restano valide fino a scadenza — per invalidarle
  subito cambia anche `AUTH_SECRET`.
- Vuoi un login "vero" (Google/email, senza password condivisa)? Metti **Cloudflare Access**
  (Zero Trust) davanti alle rotte `/foto` e `/api/*`: *Zero Trust → Access → Applications →
  Add → Self-hosted*, domini `calcaterra.casa/foto` e `calcaterra.casa/api/*`, policy "Emails =
  i tuoi indirizzi". Fatto questo puoi anche togliere la password: Access autentica a monte.
- **Il repo resta pubblico ma non contiene segreti:** password e chiave vivono solo tra le
  variabili d'ambiente cifrate di Cloudflare.
