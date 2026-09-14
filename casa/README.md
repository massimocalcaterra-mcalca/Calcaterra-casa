# Via Caprin 10 — mappa virtuale dell'appartamento

Ricostruzione del primo piano di via Giuseppe Caprin 10, Trieste, a partire dalla
planimetria catastale fotografata e dalle fotografie degli interni.

- [`modello.js`](modello.js) — il modello metrico: stanze, muri, aperture, foto. È la sorgente:
  tutto il resto si ridisegna da qui.
- [`mappa.html`](mappa.html) — il visualizzatore. Si apre da solo, senza server e senza
  compilazione: pianta in scala, assonometria sezionata, tabelle delle misure.

## Che cosa è misurato e che cosa no

| | |
|---|---|
| **Superficie netta** | 60,6 m² (cucina 17,1 · bagno 9,0 · ingresso 3,3 · camera 31,2) |
| **Superficie lorda** | ~77 m², muri compresi |
| **Altezza interna** | 3,20 m (dichiarata sulla planimetria) |
| **Volume netto** | ~194 m³ |
| **Finestre** | 4: una in cucina e una in bagno sul cortile, due in camera su via Caprin |
| **Affacci** | cortile a SSE, via Caprin a NNO (bussola disegnata a mano, ±15°) |

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
   dell'Ottocento triestino — ma lo sono anche a 44,9 px/m, quindi questo controllo conferma l'ordine
   di grandezza e non sceglie fra le due letture.

**Errore atteso: 8%.** Su cinque metri sono quaranta centimetri. Va bene per capire la casa,
**non** per ordinare mobili su misura né per un progetto.

## Quello che non torna, e va verificato in loco

1. **Le porte.** Su questa planimetria le linee dei muri sono continue anche dove c'è un
   vano: la porta si riconosce solo dal simbolo del battente. Le quattro aperture interne
   sono quindi posizionate per deduzione e segnate in rosso sul disegno.
2. **La divisione della camera.** Il disegno porta un tratteggio che divide la camera in due
   (2,6 m e 2,4 m di larghezza, una finestra per parte). Le foto mostrano una stanza con una
   finestra sola: la divisione con ogni probabilità c'è davvero, ma il tratteggio da solo non
   dice se è un muro, un arco o una struttura sopra.
3. **Il risalto in cucina.** Nell'angolo nord-ovest il muro rientra di 56 cm per 1,72 m.
   Sembra una canna fumaria o la spalla di un camino: da guardare dal vero.
4. **Il nord.** Viene da una rosa tracciata a mano in calce alla planimetria.

## Le fotografie che servono per chiudere la ricostruzione

**La più utile di tutte: una sola misura vera per stanza.** Una fotografia con il metro
srotolato contro una parete — meglio la parete lunga — trasforma il modello da stima al 3%
a modello calibrato. Quattro scatti così valgono più di quaranta scatti d'ambiente.

Poi, stanza per stanza:

- **Ingresso** — non è coperto da nessuna foto. Servono: la porta di casa dall'interno, e
  uno scatto per ciascuna delle altre tre pareti (verso cucina, verso bagno, verso camera).
  È il nodo che tiene insieme la casa: senza, le porte restano deduzioni.
- **Camera** — uno scatto per ogni metà, ciascuno verso la propria finestra, e uno frontale
  alla divisione: deve dire se è muro pieno, arco o tramezza fino a soffitto.
- **Cucina** — l'angolo nord-ovest con il risalto del muro, e la parete della porta.
- **Bagno** — la parete di fondo opposta alla finestra, e la porta.
- **Soffitti** — uno scatto verso l'alto per stanza: travi, volte o cornici cambiano il
  modello in altezza, e a 3,20 m se ne vedono spesso.
- **Pianerottolo** — la porta di casa dall'esterno, per capire da che parte si arriva.

Quando arrivano, le foto si agganciano al modello nell'elenco `foto` di `modello.js`, con il
punto di ripresa e la direzione dello sguardo: sulla pianta compaiono come coni verdi.
