# Come si realizza una guida di viaggio (PDF, presentazione HTML, testo narrato)

Manuale operativo per le guide «narrate per i compagni di viaggio» di Massimo:
viaggi on the road di 2–3 settimane, 3–4 coppie, ognuna con la sua auto.
Vale per qualsiasi destinazione. Si apre quando Massimo chiede una guida nuova.

Il modello di riferimento è una guida già impaginata: *Nord argentino, Puna de
Atacama e Bolivia* (bozza dell'8/10/2026, 98 pagine, WeasyPrint). Da quel modello
vengono **misure, gerarchie, colori e componenti**, ricavati dal PDF. Gli esempi
che citano la Puna servono solo a chiarire: non sono contenuti da riusare. Palette
e decori di ogni nuova guida si ispirano alla sua destinazione (§ 4.3).

Le **regole di Massimo** stanno nel file *Linee guida per i viaggi di Massimo*
(v2, 8/10/2026: parti A e B). Questo manuale non le sostituisce. Dice **come**
applicarle e quali errori evitare. Se i due testi divergono, valgono le linee guida.

---

## 1. Cosa si consegna

| Prodotto | Formato | Note |
|---|---|---|
| PDF stampa | 170×240 mm, 3 mm di abbondanza, segni di taglio | una sola build finale (A9) |
| PDF leggero | stesso PDF, meno di 25 MB | foto ricompresse (≈ 200 dpi effettivi) |
| Presentazione | **sempre HTML** (mai PowerPoint), 16:9, base 1920×1080 | § 8.4; numero e titolo sempre nella stessa posizione; foto d'apertura del giorno a destra |
| Testo narrato | Markdown o DOCX | lo stesso testo approvato, senza riquadri |
| Lettering | SVG + PNG 300 dpi trasparenti | B4; nella presentazione HTML si usa l'SVG |
| Video e mappe animate | MP4 H.264, 1920×1080, 30 fps, senza audio | B5 |

---

## 2. Flusso di lavoro

### 2.1 Avvio: cosa chiedere a Massimo prima di tutto
Con AskUserQuestion, in una sola tornata:
1. Date (arrivo e partenza), aeroporto di partenza (Venezia, Treviso o Trieste) e scali.
2. Gruppo: quante coppie e quante auto; noleggio unico o separato.
3. Ossatura di massima: tappe obbligate, cose da escludere, giorni di riserva.
4. Tono del progetto (es. «evocativo ma sobrio, da guida di qualità»).
5. Alloggi: budget e stile (charme, boutique, campi tendati; catene solo se servono).
6. Titolo e sottotitolo della guida, se Massimo li ha già in mente.

Le risposte si fissano in un `brief.md`. Ogni decisione successiva si aggiunge in
fondo, con la data. Il brief è la sola fonte delle scelte.

### 2.2 La squadra
| Ruolo | Produce | File |
|---|---|---|
| Agente Viaggi | ossatura, **tabella km unica**, controllo luce, quote delle notti | `research/tabella_km.md` + `.csv` |
| Ricercatore Alloggi | prima scelta e alternativa per ogni notte, riquadro «Da prenotare» | `research/alloggi.md` |
| Ricercatore Locali | ≥ 2 cene al giorno + colazione, pranzo seduto, al volo | `research/locali_*.md` |
| Ricercatore Cultura | Curiosità, Storia, Musica e feste, citazioni, glossario, **grafie** | `research/cultura.md` |
| Ricercatore Sicurezza | briefing A7, riquadri «In sicurezza», piano B, checklist | `research/sicurezza.md` |
| Ricercatore Foto | manifest con autore, licenza, link, dimensioni, didascalia | `research/foto.csv` |
| Copy | testo narrato e riquadri, tabella titoli | `copy/` |
| Grafica | mappe, profili, impaginazione, build | `build/` |
| Calligrafia | lettering dei titoli (due stili proposti, sceglie Massimo) | `lettering/` |

Ordine: ricerca → **riconciliazione** (§ 2.3) → testo → revisione di Copy →
verifica del Ricercatore → impaginazione → **una sola build finale**.

### 2.3 Riconciliazione (passaggio da non saltare)
I ricercatori lavorano in parallelo e i loro file finiscono per contraddirsi.
Prima di scrivere il testo, un passaggio dedicato confronta tutti i file e produce
`research/riconciliazione.md`, con:
- **Grafie uniche** di toponimi, passi e locali. Una sola tabella, presa dal
  ricercatore Cultura. Esempio di errore: lo stesso passo scritto in quattro modi.
- **Numeri unici**: quote, distanze a piedi, tempi di anticipo dei permessi,
  orari di partenza. Ogni numero ha una sola fonte. Le fonti discordanti si dichiarano.
- **Coerenza tra luogo e programma**: il punto d'arrivo nella tabella km
  coincide con l'alloggio scelto. Le attività decise stanno nel margine di luce del giorno.
- **Conflitti tra regole**: es. «guadi entro le 11» contro un guado che arriva nel pomeriggio.
- **Lacune e decisioni aperte** da chiedere a Massimo (A9).

### 2.4 Lezioni pratiche sulla ricerca
- Un ricercatore che esaurisce le ricerche web lascia buchi. È meglio dividere
  per aree geografiche (es. nord e sud) e prevedere un secondo giro mirato.
- Google Maps può non essere raggiungibile. In quel caso si usano le directory
  locali (es. 2GIS in Asia centrale), da ricontrollare a 1–2 mesi dalla partenza.
- **Viaggiare Sicuri non si legge in automatico** (applicazione JavaScript):
  Massimo la apre dal browser e ne riporta data e testo.
- Wikimedia Commons: l'API (`commons.wikimedia.org/w/api.php`, `prop=imageinfo`,
  `iiprop=url|size|extmetadata`) restituisce autore e licenza. Gli scaricamenti da
  `upload.wikimedia.org` vogliono uno User-Agent esplicito, altrimenti si ottiene 429.
- Nessuna foto dai siti delle strutture (A8, B2). Una foto si guarda **a vista**
  prima di usarla: persone in primo piano, mezzi militari, stagione sbagliata (es.
  neve in un viaggio estivo), luna piena in notti di luna nuova.
- Bozze di messaggi a noleggiatori, campi e agenzie: solo bozze, mai inviate senza ok (A9).

---

## 3. Struttura della guida

Ordine delle sezioni (come nel modello, circa 100 pagine per 16–18 giorni):

1. **Copertina**: foto a piena pagina e titolo su tre righe (§ 5.1).
2. **Epigrafe**: citazione su pagina sola, da traduzione italiana pubblicata e verificata (B2, B4).
3. **Frontespizio**: occhiello, titolo, sottotitolo, mese e anno, «di Massimo Calcaterra».
4. **Colophon**: testi, lettering, mappe, data di verifica dei dati, crediti in sintesi.
5. **Indice** su due livelli (§ 5.3).
6. **Prima di partire**: introduzione narrata e «Viaggiare sicuri», a due colonne.
7. **Il percorso**: mappa d'insieme a piena pagina e «Il viaggio in cifre» (§ 5.5).
8. **Le mappe dei capitoli**: una mappa a piena pagina per ogni regione.
9. **Itinerario**: un capitolo per giorno, riserve comprese (§ 6).
10. **Appendice**: da ricontrollare (3–6 mesi, 1–2 mesi, settimana prima), «Da
    prenotare in anticipo», fonti principali, fonti deboli o in contraddizione,
    crediti fotografici, mappe e dati.

---

## 4. Il sistema grafico

### 4.1 Pagina e griglia (misurate sul modello)
- Formato **170×240 mm**. Fondo carta crema su tutte le pagine.
- Margini a specchio: **interno 18 mm, esterno 14 mm** (pagina dispari: testo da
  18 a 156 mm; pagina pari: da 14 a 152 mm).
- Testatina a **11,8 mm** dall'alto, sottolineata da un filetto sottile; testo fino a circa 233 mm.
- **Due colonne da 66 mm con 6 mm di spazio**. Le foto interne sono larghe una
  colonna (66 mm, rapporto circa 3:2).
- Numero di pagina in basso, sul lato esterno, in terracotta.
- Testatine: pagina pari «Giorno N · Titolo», pagina dispari il nome della regione.
  Nelle sezioni: il nome della sezione.

### 4.2 Caratteri (tutti SIL Open Font License)
| Uso | Font | Corpo | Colore |
|---|---|---|---|
| Titoli in maiuscolo (copertina, sezioni, giorno) | **Marcellus** | 19–26 pt (titolo copertina 24; sezioni 20–26) | blu notte |
| Occhielli, testatine, intestazioni dei riquadri, «Mattina» | **Marcellus SC** spaziato | 6,6–11 pt | terracotta o grigio |
| Seconda riga del titolo, in corsivo calligrafico | **Pinyon Script** (o lo stile scelto da Massimo, B4) | 24–32 pt | terracotta |
| Sottotitoli, epigrafe, «di Massimo…» | **Cormorant Garamond** corsivo | 11–14 pt | terracotta scuro o grigio |
| Testo narrato | **Lora** | **8,6 pt**, giustificato, rientro di prima riga | inchiostro |
| Descrizioni dei locali, checklist | Lora / Lora corsivo | 7,1–8 pt | grigio caldo |
| Dati, riquadri, tabelle, didascalie | **Barlow Semi Condensed** | 7,4 pt (dati), 6,2–6,4 (didascalie), 5–5,8 (note di fonte) | inchiostro / grigio |
| Nomi dei locali, cifre chiave | Barlow Semi Condensed SemiBold | 8,2–8,4 pt | inchiostro |

Capolettera in Marcellus terracotta solo all'inizio delle sezioni narrative.

**Lingua locale.** Se i titoli usano un alfabeto o lettere non latine (B4: toponimi
nella grafia della loro lingua), i font del modello possono non bastare: Marcellus,
Pinyon Script e Barlow non hanno il cirillico. Prima di scegliere un font si controlla
la **tabella dei caratteri del file**, lettera per lettera (es. con fontTools), e non
solo la dichiarazione del sottoinsieme: Great Vibes dichiara il cirillico esteso, ma
non ha le lettere kirghise Ө, Ү, Ң.
I font si scaricano da Google Fonts (API CSS o pacchetti `@fontsource` su jsDelivr).
`github.com/google/fonts` può essere bloccato dall'ambiente.

### 4.3 Colori
Valori del modello: si ripartono da qui e si **adattano alla destinazione** (B4).
| Token | Modello | Uso |
|---|---|---|
| `--carta` | `#f5f0e6` | fondo pagina; testo su riquadri scuri |
| `--inchiostro` | `#2b2622` | testo |
| `--grigio` | `#5b5048` | testo secondario, testatine |
| `--grigio-chiaro` | `#8a7e74` | fonti, crediti in didascalia |
| `--titolo` | `#1f3b5c` | titoli; fondo «In sicurezza» |
| `--accento` | `#b4532f` | occhielli, numeri di pagina, filetti, percorso sulle mappe |
| `--accento-scuro` | `#7e3920` | sottotitoli del giorno |
| `--accento-tenue` | `#d99a8b` | grande numero del giorno |
| `--oro` | `#c9922e` | filetto sotto i titoli, barra Curiosità e In sicurezza |
| `--verde-acqua` | `#237a79` | link, barra Musica e feste, tratti con autista |
| `--fondo-inbreve` | `#efe8da` | riquadro In breve |
| `--fondo-mangiare` | `#e7dfcf` | blocco Dove mangiare |

Ogni tipo di riquadro ha un **colore fisso** (B3):
| Riquadro | Fondo | Barra a sinistra | Icona |
|---|---|---|---|
| In sicurezza | `#1f3b5c` (testo crema) | `#c9922e` | triangolo |
| Curiosità | `#f2e4c8` | `#c9922e` | cerchio con «i» |
| Musica e feste | `#dcebea` | `#237a79` | nota |
| A tavola con la gente del posto | `#f6e3dc` | `#b4532f` | posate |
| Storia | (da definire per progetto, stessa struttura) | — | — |

Struttura del riquadro: icona + intestazione in Marcellus SC spaziato, titoletto in
Barlow SemiBold, testo in Barlow 7,9 pt. Larghezza: una colonna.

### 4.4 Icone
Lineari, monocromatiche, dello stesso spessore: sole che sorge (Mattina), sole al
tramonto (Pomeriggio), segnaposto (indirizzo), orologio (orari), cerchio barrato
(chiusura), calendario (prenotazione), posate (Dove mangiare). Si usano solo SVG
disegnati in casa o da set con licenza libera.

---

## 5. Componenti

### 5.1 Copertina
- Foto a piena pagina, con sfumature scure in alto e in basso per leggere il testo.
- Dall'alto: occhiello (nome della collana o del viaggio, Marcellus SC, con filetto
  oro); «Guida narrata per i compagni di viaggio» in Cormorant corsivo; titolo in tre
  righe (MAIUSCOLO Marcellus · corsivo calligrafico terracotta · MAIUSCOLO più piccolo).
- In basso: le tappe in Marcellus SC, poi «MESE ANNO · N GIORNI · …» in Barlow
  maiuscolo spaziato. Credito della foto in 5,4 pt in basso a destra.
- **Contrasto**: le scritte chiare stanno solo sulla fascia sfumata. L'elenco delle
  tappe sta su **una riga** e non si sovrappone a zone chiare della foto.

### 5.2 Epigrafe, frontespizio, colophon
- Epigrafe: Cormorant corsivo circa 15 pt, centrata nella pagina. Il credito sta in
  Marcellus SC terracotta: autore, *opera*, traduttore, editore. Mai note interne di lavoro in pagina.
- Frontespizio: come la copertina, senza foto, in blu notte e terracotta.
- Colophon in fondo alla pagina, in Barlow 6,5 pt: autori e ruoli, data di verifica
  dei dati, fonti di foto e mappe. Nelle bozze: «Bozza di impaginazione · data» in
  terracotta, **che sparisce nella build finale**.

### 5.3 Indice
Titolo «INDICE» in Marcellus 26 pt, con filetto oro corto sotto. Parti in Marcellus SC
blu notte con il numero di pagina in Marcellus. Voci in Barlow 7,5 pt, rientrate,
con filetto puntinato e numero di pagina in terracotta grassetto. Una voce non
definitiva porta l'etichetta «in revisione» in grigio, che va tolta nella build finale.

### 5.4 Pagine narrative di sezione
Occhiello (Marcellus SC terracotta), titolo (Marcellus 26 pt blu notte), sottotitolo
(Cormorant corsivo 14 pt terracotta), filetto oro. Testo a due colonne con capolettera.
I sottocapitoli («Viaggiare sicuri») si aprono con un filetto terracotta spesso a
tutta giustezza e l'intestazione in Marcellus SC.

### 5.5 Il percorso e il viaggio in cifre
- **Mappa d'insieme a piena pagina**: rilievo ombreggiato color sabbia, confini
  tratteggiati e nomi dei Paesi spaziati. Percorso in terracotta: pieno su asfalto,
  doppia linea sullo sterrato, tratteggio verde-acqua con autista, puntinato oro
  per le varianti facoltative. Frecce del senso di marcia, cerchi delle notti con la
  sigla dei giorni («G3», «R1»), triangoli per passi e quote.
- Cartiglio in alto a destra: occhiello, titolo, 3–4 righe di sintesi, cifre chiave
  (giorni, km alla guida, km con autista, giorni facoltativi), «Totali provvisori» finché non sono approvati.
- Legenda «Le notti» in basso a sinistra: sigla del giorno colorata, luogo, alloggio.
- Fonte delle mappe in 5 pt (OSRM su OpenStreetMap, Terrain Tiles, Natural Earth).
- **Il viaggio in cifre**: 4–5 cifre grandi (Marcellus 17 pt) con didascalia; tabella
  «Tappa | Mattina | Pomeriggio | Totale | Note», con km e tempi in grassetto nella
  forma «≈ 190 km · 3 h 15–3 h 30»; profilo altimetrico di tutto il percorso con
  i giorni sull'asse; grafico delle minime e massime del mese nei luoghi delle notti
  (Open-Meteo, rianalisi ERA5).

### 5.6 Mappe dei capitoli
Una per regione, a piena pagina, con lo stesso stile della mappa d'insieme e la
scala. Cartiglio con occhiello «Mappa del capitolo», nome della regione e giorni
coperti. Le mini-mappe del giorno rimandano a questa pagina («mappa del capitolo a p. N»).

---

## 6. Il capitolo del giorno

### 6.1 Pagina d'apertura
1. **Foto a tutta larghezza, alta 98 mm**, al vivo in alto. Didascalia allineata a
   destra sotto la foto: luogo esatto + dettaglio in Barlow SemiBold, «Foto: autore,
   licenza» in corsivo grigio chiaro.
2. **Blocco titolo**: a sinistra occhiello «GIORNO» (o «RISERVA») in Marcellus SC
   spaziato e, sotto, il **numero grande** in `--accento-tenue`. A destra il titolo in
   due righe (MAIUSCOLO Marcellus blu notte + corsivo calligrafico terracotta), che
   nomina **un solo luogo simbolo**. Sotto, il sottotitolo in Cormorant corsivo
   terracotta scuro, che chiude con «· notte a …».
3. **In breve** (colonna sinistra, fondo `--fondo-inbreve`, filetto terracotta spesso
   in alto): Mattina e Pomeriggio con icona, percorso con i trattini, «≈ km · ore»;
   poi «Totale del giorno»; poi le righe «Quota max», «Notte», «Pieno»; in fondo la
   fonte dei km in 5,6 pt.
4. **Mini-mappa del giorno** (colonna destra), con legenda (asfalto, sterrato, senso
   di marcia) e **profilo altimetrico** sotto, con fondo diverso per mattina e pomeriggio.
5. Giornate con più versioni (es. giorno facoltativo): In breve a due colonne, una
   coppia Mattina/Pomeriggio per versione, poi «Versione corta» e «Totale del giorno» come forbice.

### 6.2 Mattina e Pomeriggio
- Intestazione: icona + «Mattina» in Marcellus SC 11 pt terracotta, a sinistra.
  A destra, allineati, il percorso e «≈ km · ore» in Barlow (grassetto per le cifre).
  Filetto terracotta sopra e filetto sottile sotto.
- Testo narrato a due colonne (seconda persona plurale; «noi» per il gruppo; frasi
  brevi; numeri in lettere con «circa»). Ogni pagina ha 1–2 foto da una colonna con didascalia.
- I riquadri (§ 4.3) si mettono nella colonna in cui cade l'argomento, mai a
  cavallo di pagina. La sera chiude il Pomeriggio: alloggio, cena, cielo, regola del buio.

### 6.3 Dove mangiare
Un blocco a fondo `--fondo-mangiare`, a due colonne, intestato «Dove mangiare» con le posate.
- Colonna sinistra: **Colazione**, **Pranzo · seduti**. Colonna destra: **Pranzo · al
  volo**, **Cena** (almeno due proposte). Intestazioni in Marcellus SC terracotta con filetto.
- Scheda del locale, sempre in quest'ordine (B1): **nome** (Barlow SemiBold 8,2) ·
  perché vale la sosta (Lora corsivo 7,1, grigio) · riga dati in Barlow 7,4 con le icone:
  indirizzo · orari · chiusura · prenotazione (con telefono).
- Le cene hanno un'etichetta: **TIPICO** (piena, scura), **PARTICOLARE** e **DI CHARME**
  (contornate). Prefissi in maiuscoletto grigio: «IN VIAGGIO», «ANCHE AL VOLO»,
  «LUNGO LA STRADA», «VERSIONE …».
- «IN ALTERNATIVA»: sotto-scheda rientrata con un filetto verticale a sinistra.
- Nota in fondo al blocco, in Barlow 6 pt (es. «La domenica è aperto solo…»).
- Sotto il blocco, quando serve, il riquadro «A tavola con la gente del posto».

---

## 7. Segni di bozza e dati incerti
- Si usano solo le tre forme di B1: **(da verificare)**, **«da confermare»**,
  **«[sostituto in arrivo]»**. Una sola resa grafica per tutti: Barlow SemiBold 6,1 pt
  terracotta su fondo rosato a pillola. Così la build li conta e si tolgono tutti insieme.
- Mappe e infografiche: «provvisorio» o «(stima)». Una quota stimata non diventa un primato.
- Il dato incerto non si nasconde nella foto: una didascalia non deve suggerire un
  dato non confermato.

---

## 8. Produzione tecnica

### 8.1 Pipeline (dati → PDF, mai a mano)
```
brief.md, config.yaml            → scelte, titoli, palette, versione
research/tabella_km.csv          → unica fonte di km, tempi, quote (In breve, mappe, cifre)
copy/giorni/*.md                 → testo approvato (Mattina, Pomeriggio, riquadri)
copy/titoli.csv                  → occhiello, numero, titolo, riga calligrafica, sottotitolo
data/locali.yaml                 → schede Dove mangiare (campi B1)
research/foto.csv                → foto, ritaglio, didascalia, crediti
build.py → HTML + CSS paged media → WeasyPrint → PDF stampa + PDF leggero
```
- **WeasyPrint** (HTML/CSS paged media): `@page { size: 170mm 240mm; }`, pagine
  `:left`/`:right` per margini e testatine a specchio, `string-set` per le testatine,
  `target-counter()` per indice e rimandi. Versione stampa: `bleed: 3mm; marks: crop;`.
- **Mappe**: percorsi da OSRM (`router.project-osrm.org`, profilo `driving`), salvati
  in GeoJSON nella cartella dati; rilievo da Terrain Tiles (formato terrarium,
  `s3.amazonaws.com/elevation-tiles-prod`), ombreggiato e tinto color sabbia;
  coste, laghi e confini da Natural Earth. Lo stesso GeoJSON alimenta mappa
  d'insieme, mappe dei capitoli, mini-mappe e profili.
- **Profili altimetrici**: campionati sul tracciato OSRM con le Terrain Tiles.
- **Temperature**: Open-Meteo, rianalisi ERA5, medie del mese sugli ultimi 10 anni.
- Le foto si ritagliano, non si ritoccano. Il PDF leggero ricomprime le immagini.

### 8.2 Controlli automatici a ogni build
- Conta dei segni di bozza per tipo, con l'elenco delle pagine.
- Ogni km e ogni tempo nel testo e nei riquadri coincide con `tabella_km.csv`,
  altrimenti la build segnala o si ferma (B3, B5). I totali tornano.
- Ogni foto ha autore, licenza e link; nessuna foto di strutture ricettive.
- Il lettering entra nel suo spazio (B4), altrimenti la build si ferma.
- Sillabazione (B3): al massimo due righe spezzate di fila; solo parole da 8 lettere
  in su; mai in titoli, didascalie, tabelle, testatine, nomi di luogo e di locale.
- Il peso del PDF leggero resta sotto i 25 MB.
- **Nessun font di ripiego**: l'elenco dei font incorporati (`pdffonts`) contiene solo quelli
  del progetto. Un font estraneo vuol dire che manca un glifo. Casi già visti: il trattino di
  sillabazione U+2010 (si imposta `hyphenate-character: "-"`) e il pallino «●» nelle legende.
- **Testi sulle mappe SVG**: WeasyPrint ignora `paint-order`, quindi l'alone chiaro si disegna
  con una copia del testo solo contorno, messa sotto il testo pieno.
- **Foto da Wikimedia**: `upload.wikimedia.org` accetta solo miniature di larghezza standard
  (es. 960px, 1920px); per la stampa serve l'originale, da scaricare con calma (limite 429).
- Metadati del PDF: titolo **in testo semplice**, autore, lingua `it`.

### 8.3 Errori visti nel modello, da non ripetere
- **Titolo del PDF con codice HTML** nei metadati (`<span class="nh">…`): il titolo
  dei metadati si costruisce dal testo, non dall'HTML del titolo.
- **Percorsi di file interni stampati in pagina** (es. «Fonte unica:
  /workspace/…/tabella_km.md», «vedi copy/titoli_…md»): in pagina va solo il nome
  della fonte («Tabella km, OSRM, 8/10/2026»). Le note di lavoro restano nei file.
- **Pagine bianche** dentro un capitolo e **pagine riempite per un terzo** prima di
  Dove mangiare: si riempiono con foto, con un riquadro spostato o con un diverso
  ordine dei blocchi. Il capitolo può chiudere a pagina pari o dispari.
- **Righe giustificate con spazi larghi** nelle colonne strette: sillabazione
  italiana attiva (`hyphens: auto; lang="it"`) entro i limiti di B3, e un controllo a vista.
- **Testo chiaro su zone chiare della foto** di copertina.
- Etichette di lavorazione rimaste in pagina («in revisione», «Bozza di impaginazione»)
  nella build finale.

---

### 8.4 Presentazione in HTML
Decisione di Massimo (9/10/2026): **le presentazioni si fanno sempre in HTML**.
Su questo punto prevale sulle linee guida, che in B3 e B5 parlano di PowerPoint,
transizione Morph e sequenze PNG/MP4.
- **Un solo file HTML autonomo** (`presentazione.html`): CSS e JavaScript nel file,
  foto in una cartella accanto, o incorporate se il peso lo consente. Si apre
  offline in qualsiasi browser, senza installare nulla.
- Generato dalla **stessa build e dagli stessi dati** del PDF: testo approvato,
  `tabella_km.csv`, `titoli.csv`, `foto.csv`. Nessuna slide scritta a mano.
- **Formato**: palco 16:9 disegnato a 1920×1080 e scalato per riempire lo schermo
  (`transform: scale()` sul contenitore). Leggibile anche su telefono, con il palco
  ridotto in proporzione.
- **Navigazione**: frecce e spazio, clic o tocco, swipe sul telefono; `F` per lo
  schermo intero; numero della slide nell'URL (`#12`), così si può riaprire da lì.
  Tasto `P` per la stampa: una slide per pagina A4 orizzontale, tramite `@media print`.
- **Impaginazione fissa**: numero e titolo del giorno sempre nello stesso punto;
  foto d'apertura del giorno a destra; stessi font, colori e riquadri del PDF (§ 4).
- **Lettering**: gli SVG di Calligrafia inseriti direttamente, nitidi a ogni risoluzione.
- **Transizioni**: tra un giorno e l'altro una trasformazione morbida degli elementi
  comuni (View Transitions API o transizioni CSS su posizione e scala: è l'equivalente
  di Morph); tra i capitoli dissolvenza o scorrimento. Titolo e numero del giorno restano
  fermi. Con `prefers-reduced-motion` le transizioni si tolgono.
- **Mappe animate**: il percorso del giorno si disegna con un'animazione SVG
  (`stroke-dashoffset`) sugli stessi GeoJSON del PDF. Km e ore vengono dalla tabella
  unica e restano separati tra mattina e pomeriggio (B5).
- **Video**: se serve un filmato (MP4 H.264, 1920×1080, 30 fps, senza audio, B5),
  si registra dalla presentazione HTML stessa (es. Playwright), non si rifà a parte.
- Nessun testo non approvato da Copy (B5). Le librerie esterne, se servono, hanno una
  versione fissata; meglio nessuna.
- Controlli della build: ogni slide entra nel palco senza tagli, le immagini esistono,
  i numeri coincidono con la tabella km, i segni di bozza sono contati come nel PDF.

## 9. Lista di controllo prima della build finale
- [ ] Tutte le scelte aperte decise da Massimo e riportate nel brief.
- [ ] Riconciliazione fatta: grafie, numeri e luoghi coerenti in tutti i file.
- [ ] Testo approvato da Copy e verificato dal Ricercatore (etichette OK, CORRETTO, NON CONFERMATO, CHIUSO).
- [ ] Ogni giorno ha In breve, Mattina, Pomeriggio, Dove mangiare (≥ 2 cene), In
      sicurezza, Curiosità, Storia; Musica e feste solo se c'è qualcosa (A8).
- [ ] Ogni locale: indirizzo, orari, chiusura incrociata con il giorno della settimana, prenotazione.
- [ ] Nessuna tappa finisce dopo il limite di luce (tramonto − 1 h); le salite oltre i
      3.000 m segnalate (B6.2).
- [ ] Briefing di sicurezza con data, da ripetere a ridosso della partenza (A7).
- [ ] Foto viste una per una; crediti completi in didascalia e in appendice.
- [ ] Citazioni verificate sul volume stampato (editore, anno, pagina, traduttore).
- [ ] Appendice completa: da ricontrollare, da prenotare, fonti con data, fonti deboli, crediti.
- [ ] Presentazione HTML generata dagli stessi dati, provata su computer e telefono.
- [ ] Segni di bozza a zero, oppure elencati e accettati da Massimo.
