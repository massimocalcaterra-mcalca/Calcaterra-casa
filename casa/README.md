# Mappa virtuale dell'appartamento

Ricostruzione del primo piano di una casa in muratura di fine Ottocento, a partire
dalla planimetria catastale fotografata e dalle fotografie degli interni.

> **Questo repository e' pubblico.** Indirizzo, identificativi catastali e nome del
> redattore della planimetria sono stati tolti da questi file di proposito, e le
> fotografie degli interni non vanno aggiunte qui. I commit precedenti al 15/09/2026
> li contengono ancora: per toglierli servirebbe riscrivere la storia del branch.

- [`modello.js`](modello.js) — il modello metrico: stanze, muri, aperture, foto. È la sorgente:
  tutto il resto si ridisegna da qui.
- [`mappa.html`](mappa.html) — il visualizzatore. Si apre da solo, senza server e senza
  compilazione: pianta in scala, assonometria sezionata, tabelle delle misure.

## Che cosa è misurato e che cosa no

| | |
|---|---|
| **Superficie netta** | 59,9 m² (cucina 17,1 · bagno 9,0 · ingresso 3,3 · camera ovest 16,3 · camera est 14,2) |
| **Superficie lorda** | ~77 m², muri compresi |
| **Altezza interna** | 3,20 m (dichiarata sulla planimetria) |
| **Volume netto** | ~192 m³ |
| **Finestre** | 4: una in cucina e una in bagno sul cortile, una per camera sulla strada |
| **Affacci** | cortile a SSE, strada a NNO (bussola disegnata a mano, ±15°) |

## Come sono state ricavate le misure

La planimetria è una fotografia di una stampa, quindi storta e sbiadita. Il procedimento:

1. **Raddrizzamento.** L'inclinazione (1,75°) è stata trovata cercando l'angolo che rende
   massima la varianza dei profili di riga e colonna: quando il disegno è dritto, i muri
   si concentrano su poche righe e poche colonne.
2. **Estrazione dei muri.** Sottrazione del fondo con un filtro a media mobile, poi ricerca
   dei picchi sui profili di densità limitati a ciascuna stanza. Le posizioni dei muri sono
   numeri letti da un profilo, non stime a occhio.
3. **Scala.** Qui sta il punto debole, e va detto chiaro. Sul disegno c'è un solo oggetto di
   dimensione nota: la scala condominiale. Il suo passo misura 11,8 px; con una pedata di 29 cm
   fa **40,7 px/m**, ed è il valore adottato nel modello.

   Il riscontro sul foglio A4 che avevo scritto nella prima versione **non vale**: nella fotografia
   il foglio esce dall'inquadratura su tutti e due i lati, quindi la sua larghezza non era misurabile.
   Ritirato.

   Una seconda lettura, ricavata dalle fotografie invece che dal disegno — elementi dei radiatori,
   conteggio delle piastrelle — dà **44,9 px/m**: stanze più piccole dell'8%, **54 m² invece di 60,6**.
   A favore della seconda gioca il bagno, che in foto sembra largo 1,7 m più che 2,0. A favore della
   prima gioca il fatto di nascere da una misura presa sul disegno stesso. Con queste immagini le due
   letture non si riescono a separare.

   Prova del nove sugli spessori: con 40,7 px/m le tramezze vengono 15–17 cm, il muro di spina 57 cm,
   i muri esterni 66–74 cm e le rampe 1,37 m. Tutti valori normali per una casa in muratura
   dell'Ottocento — ma lo sono anche a 44,9 px/m, quindi questo controllo conferma l'ordine
   di grandezza e non sceglie fra le due letture.

**Errore atteso: 8%.** Su cinque metri sono quaranta centimetri. Va bene per capire la casa,
**non** per ordinare mobili su misura né per un progetto.

## Quello che le fotografie hanno chiuso

Cinque scatti del 15 settembre 2026 hanno risolto tre dei quattro dubbi aperti.

1. **La camera è divisa davvero.** Il tratteggio stampato sulla planimetria è stato
   costruito: una tramezza in cartongesso, giunti nastrati e ancora da tinteggiare, con
   una porta. Si vede da tutte e due le parti — da ovest la mazzetta con l'intonaco fresco
   e le scatole elettriche nuove, da est la parete di cartongesso per tutta la lunghezza.
   Ne escono due stanze da 16,3 e 14,2 m², una finestra per ciascuna.
2. **L'arco della cucina non era una nicchia.** Quello che sembrava un arco tamponato
   dietro il frigorifero è il passaggio fra ingresso e cucina: aperto, senza porta, con la
   chiave a circa 2,4 m. Dall'ingresso si vede benissimo, e attraverso di esso lo scaldabagno
   sulla parete sud e il rivestimento su quella ovest.
3. **L'ingresso è stato fotografato.** Ha il pavimento piastrellato come la cucina, un
   applique e una scatola elettrica sul pilastro d'angolo, l'arco della cucina su un lato e
   il vano verso la camera est sull'altro — rifasciato in cartongesso, con i montanti
   metallici ancora a vista.

## Quello che resta aperto

1. **La scala assoluta.** Vedi sopra: 40,7 o 44,9 px/m, cioè 60 m² o 54. Le fotografie
   nuove non la risolvono, perché nessuna contiene un oggetto di dimensione certa.
2. **La posizione della porta nella tramezza nuova**, collocata a stima verso l'estremità nord.
3. **La porta del bagno**, ancora dedotta dal simbolo di battente.
4. **Dove cade esattamente la tramezza nuova**: sul disegno sta a 2,99 m dal muro ovest,
   cioè sul setto fra le due finestre. È verosimile, ma non è stato misurato.
5. **Il risalto del muro in cucina** (56 cm per 1,72 m nell'angolo nord-ovest): probabile
   canna fumaria, mai inquadrato da vicino.

## Le fotografie che servono per chiudere la ricostruzione

**La più utile di tutte: una sola misura vera per stanza.** Una fotografia con il metro
srotolato contro una parete — meglio la parete lunga — trasforma il modello da stima al 3%
a modello calibrato. Quattro scatti così valgono più di quaranta scatti d'ambiente.

Poi, in ordine di utilità:

- **Camera ovest, dall'angolo sud-ovest verso nord-est** — dice dove cade davvero la porta
  nella tramezza nuova.
- **Le due finestre della camera in un solo scatto**, o il setto fra le due visto dalla
  strada: verifica che la tramezza cada dove dice il disegno.
- **Ingresso: la parete della porta di casa e quella del bagno** — lo scatto del 15 settembre
  ne copre due lati su quattro.
- **Bagno, dalla finestra verso la porta**: la parete sud non compare ancora in nessuno scatto.
- **Un soffitto per stanza**: a 3,20 m travi, volte o cornici cambiano il modello in altezza.
- **La planimetria fotografata in piano**, perpendicolare e senza prospettiva.

Quando arrivano, le foto si agganciano al modello nell'elenco `foto` di `modello.js`, con il
punto di ripresa e la direzione dello sguardo: sulla pianta compaiono come coni verdi
numerati. Le immagini restano fuori dal repository.
