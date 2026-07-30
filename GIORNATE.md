# Come si costruisce una pagina di giornata

Manuale operativo delle pagine `/normandie-bretagna/giorno-NN/`. Scritto dopo aver
finito il **Giorno 1 (Rouen)**, che è il modello: se una cosa non è chiara qui,
la risposta sta in `public/viaggi/normandie-bretagna/giorno-01/index.html`.

Vale per chiunque ci metta mano, me compreso in una sessione futura. La parte
più importante non è l'elenco dei passi — è la sezione **Errori già fatti**, in
fondo: sono tutti errori che sembravano impossibili prima di commetterli.

---

## 1. Cosa deve contenere una giornata

Il livello di riferimento è una guida Lonely Planet o Rough Guide: non un
riassunto, ma il capitolo che una persona legge davvero mentre è lì.

1. **Copertina** con la foto del giorno, la data, il chilometraggio, dove si
   dorme e il **meteo** (riquadro `#dayweather`).
2. **L'arrivo / la strada**: come ci si va, e cosa si incontra senza deviare.
   Le deviazioni si misurano, non si stimano (§3).
3. **Le tappe**, una per una: perché quel posto è così, cosa guardare da
   vicino, orari, prezzi, quanto tempo serve.
4. **Se vi avanza tempo**: le tappe secondarie, in tabella.
5. **Curiosità** che spiegano il luogo — fatti con una data e una fonte, non
   aneddoti generici.
6. **Dove mangiare**: colazione, pranzo veloce, pausa dolce, cena. Ogni locale
   con il suo estratto di menù e i prezzi (§4).
7. **La mappa del giorno** interattiva, con la posizione del dispositivo.
8. **La prenotazione** della notte.
9. **Crediti** di ogni fotografia, con autore, licenza e file originale.

---

## 2. Le ricerche

Quattro agenti in parallelo, due per giornata:

| agente | cosa cerca |
|---|---|
| **luoghi** | tappe, orari, prezzi, coordinate, curiosità con fonte, logistica, parcheggi |
| **cibo** | 10-14 indirizzi su quattro categorie, **con estratto di menù e prezzi** |

Nel prompt vanno sempre messe queste regole, che sono la ragione per cui le
ricerche servono a qualcosa:

- **Non inventare orari, prezzi o coordinate.** Se un dato non c'è, si scrive
  «non trovato». Un buco dichiarato è accettabile, un numero inventato no.
- Distinguere sempre il verificato dal riportato da terzi.
- Segnalare cosa è **chiuso o in lavori** nell'anno del viaggio.
- Segnalare le **chiusure di agosto**: in Francia molti locali chiudono per
  ferie senza preavviso.
- Solo indirizzi indipendenti, mai catene.
- «Restituisci dati grezzi con le fonti, non prosa da guida»: il testo finale
  si scrive a mano, nella voce del sito.

Gli agenti restituiscono materiale. **La prosa la scrivo io**, e ogni numero
quantitativo lo riverifico di persona.

---

## 3. Le misure

**Le distanze si misurano sempre sulla rete stradale reale con OSRM**, mai in
linea d'aria e mai a occhio. Vale per il percorso del giorno e per ogni
deviazione proposta.

    https://router.project-osrm.org/route/v1/driving/LON1,LAT1;LON2,LAT2?overview=false

Le coordinate si prendono da **Nominatim**, con `User-Agent` vero e circa una
richiesta al secondo:

    https://nominatim.openstreetmap.org/search?q=...&format=json&limit=1

> **In pagina non si scrive come si è misurato.** Niente «misurato sulla strada
> vera, non in linea d'aria»: non aggiunge niente per chi legge. Si scrive il
> numero e basta.

> **Delle deviazioni si dà solo la distanza e il tempo, mai il confronto con il
> percorso di partenza.** Si scrive «passando da Gerberoy, 87 km e 1h40», non
> «+0,4 km e +3 minuti», non «quasi gratis», non «la deviazione costa», e non si
> mette in tabella la riga del percorso diretto per farci il paragone. Chi legge
> vuole sapere quanto ci mette a fare quella strada, non quanto ci perde
> rispetto a un'altra che non farà.
>
> Il confronto resta uno strumento di lavoro: serve a **me** per decidere se una
> tappa entra in itinerario, e in quella forma può stare nelle note interne
> (`proposte/`). In guida, no.

Quando Nominatim non trova un locale, spesso è la filiale a mancare, non
l'indirizzo: verificare sul sito dell'attività prima di dichiararlo incerto.

---

## 4. I prezzi

- Si riportano **solo i prezzi verificati**, con la fonte controllata.
- Dove il prezzo non c'è, **si omette e basta**: niente «prezzo non trovato» in
  pagina, niente note sulle fonti. Il posto si descrive per quello che è.
- Se un `<details>` non contiene prezzi, l'etichetta è **«Cosa prendere»**, non
  «Menù e prezzi», che li prometterebbe.
- Le informazioni che servono davvero restano: telefono, prenotazione
  consigliata, chiusure.

---

## 5. Le fotografie

Da **Wikimedia Commons**, con licenza verificata. Pipeline:

1. Cercare (`list=search`, `srnamespace=6`), poi `prop=imageinfo` con
   `iiprop=url|size|extmetadata` per licenza e autore.
2. Scaricare e ridimensionare con Pillow a **480 / 800 / 1200 / 1800**.
3. Salvare `.jpg` (qualità 82, progressive, optimize) **e** `.avif` (qualità 58).
4. Mettere in `public/viaggi/img/g/`, nome tutto minuscolo con trattini.
5. **Accreditare in fondo alla pagina**: autore, licenza con link, file originale.

Attenzione ai titoli su Commons: usano spesso l'apostrofo curvo `’` (U+2019),
non quello dritto. Se `imageinfo` dà `KeyError`, è quasi sempre questo.

Commons limita le richieste: mettere una pausa fra un file e l'altro, salvare i
metadati **man mano** e non solo alla fine, e saltare i file già scaricati.

### Le composizioni

Ogni foto sta in un `<figure class="ph">` e porta la sua `<figcaption>`, che
compare al passaggio del mouse e resta sempre visibile dove il mouse non c'è.

| classe | quando |
|---|---|
| `.photo` | una sola, a piena larghezza. `.ritratto` se è verticale |
| `.photo-row` | due o più in fila, anche di formati diversi |
| `.photo-mosaic` | una verticale a tutta altezza accanto a due orizzontali |
| `.photo-stack` | una grande con una di dettaglio sovrapposta a filo |

`.photo-row` e `.photo-mosaic` dichiarano **in pagina** le proporzioni delle
colonne, calcolate sui lati veri delle foto, così nessuna viene tagliata.
Esempio per un 3:2 accanto a un 2:3:

    style="grid-template-columns:2.25fr 1fr;aspect-ratio:2.1667"

Il ritaglio massimo accettabile è **qualche punto percentuale**. Si verifica
misurando nel browser, non a occhio (§8).

---

## 6. L'anatomia della pagina

Si copia `giorno-01/index.html` e si sostituisce il contenuto. Da aggiornare
sempre, senza dimenticarne nessuno:

- `<title>`, `description`, `canonical`, tutti gli `og:`
- `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest`
  con il nome breve della giornata (§7)
- copertina, data, chilometraggio, dove si dorme
- `DayGuide.initWeather` con `lat`, `lon`, `dateISO`, `dataLeggibile`
- l'array `TAPPE`, ognuna con `id`, `name`, `lat`, `lon`, `kind`, `note` e
  `maps: DayGuide.urlPosto("Nome vero del posto")`
- le schede `.locale` con `data-lat`, `data-lon`, `data-cat`
- i crediti fotografici
- il link dalla guida principale alla giornata, e viceversa

I `kind` dei segnaposti: `tappa` (cerchio verde), `opzionale` (cerchio
tratteggiato), `cibo` (quadrato arancione), `notte` (cerchio scuro).

**I nomi dei posti sono cliccabili** e portano alla loro scheda su Google Maps.
Il link usa **nome e indirizzo veri**, non le coordinate: si arriva alla scheda
del posto invece che a uno spillo anonimo.

### Quando arriva una prenotazione

Un albergo confermato non si scrive in un posto solo. Il 30 luglio, entrato
Le Manoir de Mathan a Crépon al posto del generico «Bayeux», hanno dovuto
cambiare **undici punti**. La lista, che vale per ogni prossima:

1. la tabella `#prenotazioni` — riga con `class="fatto"`, spunta `.ok`,
   indirizzo e telefono sotto il nome, e nelle note le distanze vere
2. il conteggio in testa alla tabella («Dieci notti, *sette* chiuse») e la
   nota che spiega perché alcune sono chiuse e altre no
3. la tabella riassuntiva delle undici tappe, colonna «dove si dorme»
4. le schede del colpo d'occhio delle giornate coinvolte
5. la riga `.loc` di ogni `article.day` che parte o arriva da lì
6. la casella «Pernottamento» di quelle stesse giornate
7. **tutte le distanze che cambiano**: il punto di partenza si è spostato, il
   giro va rimisurato con OSRM — inclusa la giornata *dopo*, che parte da lì
8. nella pagina della giornata: sottotitolo, `.daydata`, scaletta oraria
9. la legenda della mappa e la tappa `kind:"notte"` nell'array `TAPPE`
10. il ristorante dell'albergo fra i posti dove mangiare, se c'è
11. le sezioni che davano per scontata la vecchia base («Bayeux, la sera e il
    mattino» non aveva più senso: si dorme altrove)

`grep -n -i "<vecchia base>"` sui due file, alla fine, per non lasciarne
indietro nessuno.

---

## 7. Gli asset condivisi, e la loro versione

`assets/base.css`, `day.css`, `day.js`, `nav.js` sono condivisi da tutte le
giornate. I loro nomi **non contengono un hash**, e Cloudflare li serve con
quattro ore di cache che la regola in `_headers` non riesce a togliere.

> **Chi modifica uno di quei quattro file DEVE aggiornare il `?v=` nelle pagine
> che lo caricano.** È l'unica cosa che impedisce a un browser di usare codice
> vecchio con HTML e CSP nuovi.

    python3 - <<'PY'
    import hashlib, re, os
    A="public/viaggi/normandie-bretagna/assets/"
    ver={n: hashlib.sha256(open(A+n,'rb').read()).hexdigest()[:8]
         for n in ("base.css","day.css","day.js","nav.js")}
    for path,pre in [("public/viaggi/normandie-bretagna/giorno-01/index.html","../assets/"),
                     ("public/viaggi/normandie-bretagna/index.html","assets/")]:
        s=open(path,encoding="utf-8").read()
        for n,v in ver.items():
            s=re.sub(re.escape(pre+n)+r'(\?v=[0-9a-f]+)?(?=")', pre+n+"?v="+v, s)
        open(path,"w",encoding="utf-8").write(s)
    PY

Aggiungere alla lista dei percorsi ogni nuova giornata.

---

## 8. La verifica, prima di pubblicare

Nessuno di questi passi è facoltativo. Ognuno è nato da un errore vero.

1. **HTML bilanciato** — `html.parser`, tag non chiusi e chiusure spaiate.
2. **Ogni immagine citata esiste** sul disco: confrontare i percorsi `/img/g/`
   con i file veri.
3. **Le foto stanno nella sezione giusta** e la didascalia corrisponde.
4. **Ogni link punta al posto della sua sezione**: si rilegge la pagina e si
   confronta ogni link con il titolo che lo precede. Non a campione.
5. **Geometria delle foto** nel browser, a 1280 e a 560 px: stessa altezza fra
   le affiancate, ritaglio entro pochi punti percentuali, nessuno scorrimento
   orizzontale. **Forzare il caricamento delle immagini** prima di misurare, o
   si misura il vuoto.
6. **Anteprima iPhone** (`devices['iPhone 14 Pro']`): nessun testo sotto i
   12px, bersagli da toccare almeno 44px, titoli non nascosti dalla barra.
7. **Console pulita**: zero errori JavaScript.
8. **Il menù segue lo scorrimento** e accende una sola voce per volta.

In questo ambiente il browser non ha rete: Leaflet e le tessere non si
caricano. Le cose esterne si verificano con `curl`, che passa dal proxy.

---

## 9. Errori già fatti

Sono tutti costati una correzione pubblica. Rileggerli vale più di qualunque
altra sezione.

**Cercare «il primo che capita».** Uno script che inseriva tre link cercava
ogni volta il primo paragrafo disponibile invece di quello della sezione
giusta: i tre si sono scambiati a catena, e l'Aître Saint-Maclou è finito sotto
Gerberoy. Lo stesso difetto ha messo due caselle «Dove» nella cattedrale e
nessuna in Saint-Maclou. **Ogni inserimento va ancorato alla sua sezione.**

**Cercare per stringa invece che per tag.** «Saint-Maclou e il suo cimitero»
compare anche nella `<meta name="description">` in testa al file, e veniva
trovato prima lì. **Ancorare al tag vero** (`<h3>...`), non a una sottostringa.

**Il `>` dentro un attributo.** La favicon è un data-URI SVG e contiene `>`:
un regex `[^>]*>` si è fermato a metà tag e ha infilato le righe nuove dentro
l'attributo, rompendo la favicon. **Cercare la chiusura vera** (`</svg>">`).

**`aspect-ratio` senza `height:auto`.** L'attributo `height` dell'`<img>` è un
hint di presentazione e vince sulla proporzione dichiarata. Senza `height:auto`
nessuna foto rispettava il formato voluto: si perdeva **fino al 54%**
dell'inquadratura e le altezze in guida andavano da 343 a 1921 px.

**Cache degli asset contro HTML fresco.** Passando le tessere della mappa da
OpenStreetMap a CARTO, la CSP nuova è arrivata subito ma i browser usavano
ancora il `day.js` vecchio: tessere bloccate, mappa vuota. Stessa causa per le
caselle dei ristoranti che non comparivano. → §7.

**Misurare a metà animazione.** `html{scroll-behavior:smooth}` fa animare
`scrollTo`: misurando subito dopo si legge una posizione intermedia e si
crede rotto ciò che funziona. Disattivare l'animazione nel test.

**Misurare immagini non caricate.** Con `loading="lazy"` le immagini fuori
schermo non hanno dimensioni: le misure risultano a zero. Forzarle a `eager` e
attendere il `load` prima di misurare.

**Ordine del menù ≠ ordine della pagina.** Nella guida «Info pratiche» sta
prima di «Alberghi» nel documento e dopo nel menù: calcolando i confini
sull'ordine del menù si accendeva la voce sbagliata. Ordinare per posizione
nel documento.

**Regole CSS messe troppo in alto.** A pari specificità vince l'ultima: una
correzione di leggibilità messa sopra la regola base non aveva alcun effetto,
e sembrava applicata. Le sovrascritture vanno **in fondo al foglio**.

**Sopra una fotografia i colori del testo cambiano.** I colori pensati per il
fondo chiaro della pagina spariscono su un'immagine: serve un velo scuro e
testo bianco.

**Non usare artwork altrui.** Una copertina trovata in rete è quasi sempre di
una guida in commercio: si rifà la composizione con le nostre foto licenziate.

**`<picture>` lasciato aperto.** Scrivendo a mano tre `<figure>` del Giorno 3
il `</picture>` prima della `<figcaption>` era stato dimenticato: la didascalia
finiva dentro `<picture>` invece che dentro `<figure>`. Non si vede a occhio,
perché `picture{display:contents}` la fa comunque impaginare giusta. **Passare
sempre il file in un parser** prima di pubblicare (§8).

**Tagliare un blocco cercando `</div></div></div>`.** Accendendo il volume del
Giorno 3 sullo scaffale, la ricerca della tripletta di chiusura l'ha trovata
una posizione prima del vero (dentro la fascetta `.attesa`), e il blocco
sostituito è rimasto con un `</div>` di troppo fuori. **Contare le aperture e
le chiusure dopo ogni sostituzione**, e comunque ripassare il parser.

**Riusare un nome di classe che c'e' gia'.** `.mapbox` in `base.css` e' la
mappa schematica dell'itinerario, e si porta dietro
`.mapbox svg{width:100%;height:auto}`. Chiamando `.mapbox` anche il riquadro
attorno alla mappa Leaflet delle giornate, quella regola ha investito ogni SVG
lì dentro: l'icona del tasto della posizione ha riempito il tasto, e soprattutto
la **bandiera ucraina che Leaflet 1.9 infila nella propria attribuzione** e'
diventata un rettangolo alto un terzo della mappa. Restava invisibile in prova
perche' qui il browser non ha rete e Leaflet non si carica affatto. Due
lezioni: **prima di battezzare una classe, `grep` sul foglio condiviso**, e
**per provare la mappa servire Leaflet e le tessere da disco** con un route di
Playwright, altrimenti non si sta provando la mappa. La bandiera in se' si
toglie con `map.attributionControl.setPrefix(...)`.

**Una foto-texture come dorso sullo scaffale.** Il cemento crivellato della
Pointe du Hoc funziona a piena larghezza in testa alla pagina e non dice nulla
a 84×126 px. Per i dorsi e per le icone servono immagini che si riconoscano
piccole: per il Giorno 3, le croci di Colleville.

---

## 10. Lo stato

| | giornata | pagina |
|---|---|---|
| 1 | Rouen | **fatta** |
| 2 | Étretat e Le Havre | ricerche finite, pagina da scrivere |
| 3 | Le spiagge dello Sbarco | **fatta** |
| 4-11 | dal Mont-Saint-Michel al rientro | da fare |

Sullo scaffale di `/viaggi/` i volumi accesi sono quelli con la pagina fatta:
il Giorno 3 è passato da `.book.giorno.futuro` (un `<div>` grigio) a
`<a class="book giorno">`. Chi ne accende un altro tolga anche la fascetta
`.attesa` e rimetta «Apri →» al posto di «Presto».
