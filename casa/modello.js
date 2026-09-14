/* Modello metrico dell'appartamento di via Caprin 10, Trieste — primo piano.
 *
 * Sistema di riferimento: metri, origine nell'angolo NORD-OVEST del disegno
 * (spigolo esterno del muro), X verso destra (est del disegno), Y verso il basso
 * (verso via Caprin). Non è il nord vero: vedi `nord`.
 *
 * Tutte le quote sono RICAVATE dalla planimetria catastale per fotogrammetria,
 * non da un rilievo. Incertezza dichiarata in `scala`. Ogni elemento porta
 * `certezza`: "misurato" (linea leggibile sul disegno), "dedotto" (ricostruito
 * da simboli o dalle foto), "da-verificare" (serve un controllo in loco).
 */
window.MODELLO = {
  meta: {
    indirizzo: "Via Giuseppe Caprin 10, Trieste",
    piano: "Primo",
    altezza_interna_m: 3.20,
    catasto: {
      comune: "Trieste", sezione: "V", foglio: "22",
      particella: "7885", subalterno: "4",
      protocollo: "TS0057578 del 14/07/2005",
      redattore: "Sponza Andrea, Periti Edili prov. Trieste, n. 1008",
      scala_disegno: "1:100", formato: "A4"
    },
    sorgente: "Planimetria catastale (estratto del 03/02/2026, n. T108813) fotografata + 4 foto d'interni",
    aggiornato: "2026-09-14"
  },

  /* Calibrazione. Due stime indipendenti convergenti:
   *  - passo dei gradini del vano scale: 11,8 px -> pedata 29 cm  => 40,7 px/m
   *  - larghezza del foglio A4 alla scala 1:100                   => ~41 px/m
   * L'immagine è stata prima raddrizzata di 1,75 gradi. */
  scala: { px_per_m: 40.7, incertezza_percento: 3,
           nota: "Su una quota di 5 m l'errore atteso è +/- 15 cm." },

  /* La bussola disegnata a mano sulla planimetria punta in basso a sinistra.
   * Quindi l'alto del disegno (il cortile) guarda circa a SSE e via Caprin a NNO.
   * Simbolo tracciato a mano: tolleranza ampia. */
  nord: { azimut_alto_disegno_gradi: 149, certezza: "dedotto",
          incertezza_gradi: 15,
          conseguenze: "Cucina e bagno (cortile) prendono luce da mattina a mezzogiorno; la camera su via Caprin prende la luce di fine pomeriggio." },

  stanze: [
    { id: "cucina", nome: "Cucina", area_mq: 17.1, certezza: "misurato",
      poligono: [[0.87,0.74],[3.17,0.74],[3.17,7.05],[0.31,7.05],[0.31,2.46],[0.87,2.46]],
      nota: "Stanza lunga e stretta: 2,86 m di larghezza per 6,31 m. Nell'angolo nord-ovest un risalto del muro di 56 cm per 1,72 m (probabile canna fumaria o spalla di camino): lì la stanza si stringe a 2,30 m." },

    { id: "bagno", nome: "Bagno / WC", area_mq: 9.0, certezza: "misurato",
      poligono: [[3.34,0.74],[5.34,0.74],[5.34,5.23],[3.34,5.23]],
      nota: "2,00 x 4,49 m. Sanitari e lavatrice in fila lungo i lati lunghi, finestra in fondo sul cortile." },

    { id: "ingresso", nome: "Ingresso", area_mq: 3.3, certezza: "misurato",
      poligono: [[3.34,5.38],[5.34,5.38],[5.34,7.05],[3.34,7.05]],
      nota: "2,00 x 1,67 m. È il nodo della casa: da qui si va in cucina (ovest), in bagno (nord) e in camera (sud); la porta di casa è a est, sul pianerottolo." },

    { id: "camera", nome: "Camera", area_mq: 31.2, certezza: "misurato",
      poligono: [[0.31,7.63],[5.34,7.63],[5.34,13.84],[0.31,13.84]],
      nota: "5,03 x 6,21 m, due finestre su via Caprin. Sul disegno una linea tratteggiata la divide in due a 2,99 m dal muro ovest, una metà per finestra: le foto mostrano una stanza con una sola finestra, quindi la divisione oggi esiste. Va confermata." },

    { id: "vano-scale", nome: "Vano scale", area_mq: 18.5, certezza: "misurato",
      comune: true,
      poligono: [[5.57,0.74],[8.51,0.74],[8.51,7.05],[5.57,7.05]],
      nota: "Non fa parte dell'unità. Due rampe da ~1,37 m attorno a un muro centrale; pedata ~29 cm. Serve da riferimento di scala." }
  ],

  /* Spessori dei muri misurati sul disegno, utili per capire l'età e il rumore. */
  muri: [
    { id: "nord",     descrizione: "Muro esterno sul cortile",        spessore_m: 0.74, certezza: "misurato" },
    { id: "sud",      descrizione: "Muro esterno su via Caprin",      spessore_m: 0.66, certezza: "misurato" },
    { id: "ovest",    descrizione: "Muro esterno ovest (confine)",    spessore_m: 0.30, certezza: "misurato" },
    { id: "est",      descrizione: "Muro verso il vano scale",        spessore_m: 0.23, certezza: "misurato" },
    { id: "spina",    descrizione: "Muro di spina fra cucina/ingresso e camera", spessore_m: 0.57, certezza: "misurato" },
    { id: "tramezza-cucina-bagno", descrizione: "Tramezza cucina/bagno", spessore_m: 0.17, certezza: "misurato" },
    { id: "tramezza-bagno-ingresso", descrizione: "Tramezza bagno/ingresso", spessore_m: 0.15, certezza: "misurato" }
  ],

  aperture: [
    { id: "fin-cucina", tipo: "finestra", stanza: "cucina", muro: "nord", affaccio: "cortile",
      da: [1.22,0.74], a: [2.44,0.74], larghezza_m: 1.22, certezza: "misurato",
      nota: "Nicchia profonda ~0,40 m nel muro da 74 cm. Arco a tutto sesto in alto (visibile nelle foto)." },
    { id: "fin-bagno", tipo: "finestra", stanza: "bagno", muro: "nord", affaccio: "cortile",
      da: [3.60,0.74], a: [4.90,0.74], larghezza_m: 1.30, certezza: "misurato" },
    { id: "fin-camera-ovest", tipo: "finestra", stanza: "camera", muro: "sud", affaccio: "via Caprin",
      da: [0.75,13.84], a: [1.98,13.84], larghezza_m: 1.23, certezza: "misurato" },
    { id: "fin-camera-est", tipo: "finestra", stanza: "camera", muro: "sud", affaccio: "via Caprin",
      da: [3.43,13.84], a: [4.90,13.84], larghezza_m: 1.47, certezza: "misurato" },

    { id: "porta-ingresso", tipo: "porta-esterna", da_stanza: "vano-scale", a_stanza: "ingresso",
      muro: "est", da: [5.34,5.86], a: [5.34,6.76], larghezza_m: 0.90, certezza: "dedotto",
      nota: "Posizione presa dal simbolo di battente disegnato sul pianerottolo." },
    { id: "porta-cucina", tipo: "porta", da_stanza: "ingresso", a_stanza: "cucina",
      muro: "tramezza-cucina-bagno", da: [3.17,5.67], a: [3.17,6.57], larghezza_m: 0.90, certezza: "da-verificare" },
    { id: "porta-bagno", tipo: "porta", da_stanza: "ingresso", a_stanza: "bagno",
      muro: "tramezza-bagno-ingresso", da: [3.91,5.30], a: [4.76,5.30], larghezza_m: 0.85, certezza: "da-verificare" },
    { id: "passaggio-camera", tipo: "passaggio", da_stanza: "ingresso", a_stanza: "camera",
      muro: "spina", da: [3.79,7.34], a: [4.89,7.34], larghezza_m: 1.10, certezza: "da-verificare",
      nota: "Apertura larga, forse a due battenti o ad arco: sul disegno l'anta è tracciata a 1,10 m." }
  ],

  /* Elementi segnati sul disegno che non sono muri. */
  annotazioni: [
    { id: "divisione-camera", tipo: "linea-tratteggiata", stanza: "camera",
      da: [2.99,7.80], a: [2.99,13.80], certezza: "da-verificare",
      nota: "Tratteggio stampato che divide la camera in due parti da ~2,6 e ~2,4 m, una per finestra." },
    { id: "segni-a-mano", tipo: "annotazione-manoscritta", stanza: "camera",
      nota: "Frecce e una curva tracciate a penna sulla copia, in alto nella camera. Non fanno parte del disegno catastale; significato ignoto." }
  ],

  /* Punti di presa delle fotografie: dove stava chi ha scattato e dove guardava.
   * `direzione_gradi`: 0 = verso il basso del disegno (via Caprin), 90 = verso
   * destra (vano scale), 180 = verso il cortile, 270 = verso ovest. */
  foto: [],

  /* Cosa manca per chiudere la ricostruzione. */
  da_rilevare: []
};
