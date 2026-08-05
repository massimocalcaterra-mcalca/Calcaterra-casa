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

---

## 12. Cose da fare a mano su Cloudflare (dopo il lavoro di luglio 2026)

Queste quattro cose non si possono mettere nel repo: vanno cliccate nel pannello di Cloudflare.
Sono elencate in ordine di importanza.

### A. Modalità SPA / catch-all — **verificato il 25 luglio 2026: già a posto**
Se un progetto Pages è in modalità *Single-page application*, ogni URL inesistente risponde
`200` con la home invece di `404`, e persino `robots.txt` può tornare HTML: con quella modalità
attiva i `404.html` del repo non vengono mai usati.

Controllato in produzione il 25 luglio 2026: **entrambi i progetti si comportano correttamente**
(404 vero su URL inesistenti, `robots.txt` servito come `text/plain`). Non c'è niente da
cliccare. Se un giorno qualcuno tocca le impostazioni di build, il controllo è questo:

```
curl -sI https://calcaterra.casa/xyz-non-esiste | head -1      # deve dire 404
curl -sI https://viaggi.calcaterra.casa/xyz-non-esiste | head -1
curl -s  https://calcaterra.casa/robots.txt | head -1          # deve essere testo, non HTML
```

### B. Limite di tentativi sul login — **consigliato**
Le Functions hanno già un freno lato codice (`functions/_lib/ratelimit.js`), ma funziona solo
se esiste un namespace KV. Due strade, la prima è più semplice:

1. **WAF rate limiting** (nessun codice): *Security → WAF → Rate limiting rules → Create*.
   Espressione `http.request.uri.path eq "/api/login"`, metodo `POST`, soglia **10 richieste in
   60 secondi per IP**, azione *Block* per 10 minuti.
2. **Namespace KV**: *Workers & Pages → KV → Create namespace* (es. `calcaterra-rate`), poi nel
   progetto *Settings → Functions → KV namespace bindings* con nome esatto **`RATE_KV`**. Il
   codice lo usa se c'è e lo ignora se manca (fail-open: una KV assente non chiude fuori nessuno).

### C. Alzare HSTS un passo per volta — **primo passo fatto il 25 luglio 2026**
In `public/_headers` e `public/viaggi/_headers` c'è `Strict-Transport-Security`, che dice al
browser di usare solo HTTPS per quel dominio per i secondi indicati. Serve a chiudere la
finestra della **prima richiesta in chiaro**: chi digita `calcaterra.casa` senza `https://`
manda un primo giro in HTTP che, su una rete ostile, si può intercettare prima che arrivi il
redirect. Con HSTS attivo il browser converte da solo, senza mandare nulla in rete.

Si sale piano perché **HSTS non è revocabile**: se pubblichi un anno e poi hai un problema di
certificato, i browser di chi è già passato si rifiutano di connettersi e non hai modo di dire
loro "fermati" — devi aspettare la scadenza.

Scaletta, un passo alla volta e **allineata sui due progetti**:

| valore | durata | stato |
|---|---|---|
| `300` | 5 minuti | iniziale, alla pubblicazione |
| `86400` | 1 giorno | **attuale, dal 25 luglio 2026** |
| `2592000` | 30 giorni | prossimo passo, dopo circa una settimana senza problemi |
| `31536000` | 1 anno | traguardo |

`includeSubDomains` si valuta solo a un anno stabile e con tutti i sottodomini in HTTPS:
romperebbe qualunque sottodominio futuro non ancora servito in HTTPS. `preload` mette il
dominio in una lista compilata dentro i browser e uscirne richiede mesi: su un sito personale
non vale il rischio.

### D. Sessione foto revocabile subito — **opzionale**
Aggiungendo la variabile `AUTH_VERSION` (un numero, es. `1`) fra le variabili d'ambiente del
progetto, basta incrementarla per invalidare **tutte** le sessioni aperte senza cambiare
`AUTH_SECRET`. Se la variabile non c'è, il codice usa `"1"` come valore predefinito.

---

## 13. Rigenerare immagini e mappe delle guide

Le fotografie delle guide sono self-hosted in `public/viaggi/img/g/` (varianti AVIF a 480, 800,
1200 e 1800 px, più JPEG di riserva fino a 1200 px) e nelle pagine sono richiamate con
`<picture>` + `srcset`. Le due mappe degli itinerari sono SVG inline, generate da
`tools/genera-mappe.py` con i dati Natural Earth (pubblico dominio).

- **Aggiungere una fotografia:** scaricare l'originale da Wikimedia Commons, generare le varianti
  con Pillow (`quality=52` per AVIF, `76` progressivo per JPEG), e aggiungere in fondo alla guida
  la riga di credito con **autore, licenza con link e link al file originale** — è un obbligo
  delle licenze CC BY-SA, non una gentilezza.
- **Rigenerare le mappe:** servono i file `ne50_land.geojson` e `ne10_coastline.geojson` di
  Natural Earth nella stessa cartella dello script; l'output va in `public/viaggi/img/`, poi la
  mappa va reincollata inline nella pagina (inline e non `<img>`, perché le tappe sono
  `<a href="#gN">` e l'evidenziazione usa `:target`).
- **Video:** i due `.mp4` sotto `public/viaggi/bretagna/video/` sono H.264 e non hanno `poster`.
  Un poster ricavato da un'altra fotografia sarebbe una copertina che non corrisponde al
  contenuto: meglio nessuno.

## Il pulsante «Chiedi» — configurazione

Le pagine della guida hanno in alto un pulsante **Chiedi**: apre un pannello,
prende la posizione dal telefono, e manda a `/api/chiedi` la posizione, l'ora,
la giornata e le dieci tappe della pagina più vicine. La risposta arriva
dall'API Anthropic.

**Senza chiave il pulsante non si rompe**: risponde 503 e il pannello mostra
«manca la chiave API nelle impostazioni del sito». Tutto il resto della guida
funziona identico. Quindi si può pubblicare prima e configurare dopo.

Per accenderlo, nel progetto Pages **viaggi** (Settings → Environment variables,
Production e Preview), variabile **cifrata**:

    ANTHROPIC_API_KEY = sk-ant-...

Facoltative, in chiaro:

    CHIEDI_MODELLO    = claude-opus-5     (default se assente)
    CHIEDI_MAX_GIORNO = 40                (domande al giorno per IP)

Il modello di default è **Opus 5**, il più capace: una domanda fatta dalla
strada non è verificabile sul momento, quindi conviene la risposta migliore.
Costa circa due centesimi a domanda contro il centesimo scarso di
`claude-sonnet-5`, che resta l'alternativa se un giorno il volume crescesse.

Da agosto 2026 l'endpoint **richiede anche la sessione** del sito (§14), non
solo la stessa origine: se il progetto ha `SITE_PASSWORD` e `AUTH_SECRET`, una
domanda senza cookie valido riceve 401.

Il tetto giornaliero funziona solo se il progetto ha il binding KV `RATE_KV`,
lo stesso del login. Senza, il limitatore è fail-open — cioè non limita: è la
scelta già in uso nel resto del sito, per non chiudere fuori il proprietario
per una svista di configurazione. **Con una chiave a fatturazione e senza
RATE_KV l'endpoint è aperto a chiunque conosca l'indirizzo**, protetto solo dal
controllo di stessa origine. Se il KV non c'è, conviene mettere un tetto di
spesa sulla console Anthropic.

---

## 14. Sezione Viaggi — password all'ingresso

Da agosto 2026 `viaggi.calcaterra.casa` è **privata**: ogni pagina passa da un
cancello e chi non ha la sessione finisce su `/accesso/`. La password è **la
stessa dell'area foto** (§11): stessa `SITE_PASSWORD`, stesso cookie firmato,
stessa durata di dodici ore.

### Come è fatta

```
functions/_middleware.js            ← il cancello: gira PRIMA che Pages serva l'HTML
public/viaggi/accesso/index.html    ← la pagina della password
public/_routes.json                 ← APEX: le Functions girano solo su /api/*
public/viaggi/_routes.json          ← VIAGGI: le Functions girano su tutto
```

Il punto delicato è che **`functions/` è condivisa dai due progetti Pages**
(l'apex ha output `public/`, i viaggi hanno output `public/viaggi/`, ma la
cartella delle Functions è la stessa alla radice del repo). Un middleware
distratto chiuderebbe fuori anche `calcaterra.casa`. Ci sono quindi due difese
indipendenti, e vanno mantenute entrambe:

1. **`public/_routes.json`** limita le Functions dell'apex a `/api/*`. Su
   `calcaterra.casa` il middleware non viene proprio invocato per le pagine, e i
   redirect di `public/_redirects` (`/viaggi/*` → sottodominio) restano intatti.
2. **Il controllo dell'hostname** dentro `_middleware.js`: protegge solo ciò che
   sta sotto `viaggi.`, e lascia passare tutto il resto.

### L'interruttore è la password stessa

La protezione si accende **solo quando nel progetto Pages dei viaggi esistono
`SITE_PASSWORD` e `AUTH_SECRET`**. Finché non ci sono, il sito resta pubblico
come prima. È voluto: il deploy è automatico a ogni push, e un cancello
fail-closed manderebbe offline le guide nell'intervallo fra la pubblicazione e
il momento in cui si impostano le variabili a mano nel dashboard.

> Il rovescio della medaglia: **il push non basta**. Finché le due variabili non
> sono sul progetto viaggi, il sito è pubblico e non lo segnala. Per verificare:
> `curl -s https://viaggi.calcaterra.casa/api/me` deve rispondere
> `"configured":true`.

### Setup una-tantum (2 minuti)

Progetto Pages **viaggi** → *Settings → Environment variables → Production*
(e Preview, se le anteprime servono), entrambe come **Secret / Encrypt**:

| Variabile | Valore |
|---|---|
| `SITE_PASSWORD` | **la stessa** già usata per `/foto` sull'apex |
| `AUTH_SECRET` | **la stessa** già usata per `/foto` sull'apex |

Poi *Deployments → Retry deployment* (oppure un push qualsiasi).

Copiare gli stessi valori dell'apex serve a non avere due password da
ricordare. Non li rende però la stessa sessione: il cookie **non ha
l'attributo `Domain`**, quindi resta legato all'host che lo emette. Si entra una
volta su `calcaterra.casa/foto` e una volta su `viaggi.calcaterra.casa` — con la
stessa password. È la scelta prudente: un cookie valido su tutto
`*.calcaterra.casa` viaggerebbe verso ogni sottodominio presente e futuro.

Facoltativa, in chiaro:

    VIAGGI_PRIVATO = 1   forza la protezione anche fuori da viaggi.* (anteprime *.pages.dev)
                   = 0   la disattiva del tutto, per un'emergenza

### Cosa passa senza password

`/api/*` (che si difende da sé — `/api/login` deve restare aperto per
definizione), `/accesso/`, `/robots.txt`, `/favicon.ico`, `/site.webmanifest` e
le icone della schermata Home. Tutto il resto — HTML, CSS, JS, immagini, PDF —
è chiuso: una navigazione riceve un 302 verso `/accesso/?da=<pagina cercata>`,
così dopo la password si atterra dove si voleva andare; un asset riceve un 401
secco, perché dirottare un foglio di stile su una pagina HTML farebbe solo
sbagliare il tipo MIME al browser.

### Conseguenze da conoscere

- **Le guide escono da Google.** `public/viaggi/robots.txt` ora dice
  `Disallow: /` e `_headers` aggiunge `X-Robots-Tag: noindex, nofollow`. Le
  pagine già indicizzate spariranno dai risultati in qualche settimana.
  Per tornare pubblici: togliere `SITE_PASSWORD` dal progetto viaggi e rimettere
  `Allow: /` con la riga `Sitemap:` in robots.txt.
- **I link condivisi non funzionano più per gli altri.** Chi riceve l'indirizzo
  di una giornata vede la richiesta della password.
- **Ogni richiesta a un asset è un'invocazione di Function.** Su un sito
  personale è ampiamente dentro il piano gratuito, ma non è più zero.
- **`/api/chiedi` ora richiede la sessione**, non solo la stessa origine. È il
  guadagno più concreto: l'endpoint che spende soldi non è più raggiungibile da
  chiunque conosca l'indirizzo.

### Cambiare la password

Aggiornare `SITE_PASSWORD` **su entrambi i progetti** e ripubblicare. Le
sessioni già aperte restano valide fino alla scadenza: per buttarle fuori
subito, cambiare anche `AUTH_SECRET` (oppure incrementare `AUTH_VERSION`, che
esiste apposta e non invalida nient'altro).
