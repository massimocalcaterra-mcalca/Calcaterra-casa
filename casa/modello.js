/* Modello metrico dell'appartamento — primo piano.
 *
 * Sistema di riferimento: metri, origine nell'angolo NORD-OVEST del disegno
 * (spigolo esterno del muro), X verso destra (est del disegno), Y verso il basso
 * (verso la strada). Non è il nord vero: vedi `nord`.
 *
 * Tutte le quote sono RICAVATE dalla planimetria catastale per fotogrammetria,
 * non da un rilievo. Incertezza dichiarata in `scala`. Ogni elemento porta
 * `certezza`: "misurato" (linea leggibile sul disegno), "dedotto" (ricostruito
 * da simboli o dalle foto), "da-verificare" (serve un controllo in loco).
 */
window.MODELLO = {
  meta: {
    edificio: "Primo piano di una casa in muratura, di fine Ottocento",
    piano: "Primo",
    altezza_interna_m: 3.20,
    disegno: { scala: "1:100", formato: "A4", tipo: "planimetria catastale" },
    sorgente: "Planimetria catastale fotografata + 4 fotografie d'interni",
    aggiornato: "2026-09-15",
    riservatezza: "Questo file sta in un repository pubblico: indirizzo, identificativi catastali e nome del redattore sono stati tolti di proposito. Non rimetterli, e non aggiungere qui le fotografie degli interni."
  },

  /* Calibrazione. Un solo ancoraggio fisico regge davvero:
   *   il passo dei gradini del vano scale misura 11,8 px. Con una pedata di 29 cm
   *   (valore corrente per una scala condominiale dell'Ottocento) fa 40,7 px/m.
   *
   * Il riscontro sul foglio A4 che avevo usato all'inizio NON vale: nella fotografia
   * il foglio esce dall'inquadratura su tutti e due i lati, quindi la sua larghezza
   * non e' misurabile. Ritirato.
   *
   * Una seconda lettura, fatta dalle fotografie invece che dal disegno (elementi dei
   * radiatori, conteggio delle piastrelle), porta a 44-45 px/m: stanze piu' piccole
   * dell'8%, circa 54 mq invece di 60,6. Vedi `letture_alternative`. Con le immagini
   * disponibili le due letture non si riescono a separare. */
  scala: { px_per_m: 40.7, incertezza_percento: 8,
           nota: "Le proporzioni sono solide, la scala assoluta no: su cinque metri l'errore puo' arrivare a quaranta centimetri. Una sola foto con il metro srotolato contro una parete chiude la questione." },

  letture_alternative: [
    { fonte: "passo dei gradini del vano scale (pedata 29 cm)", px_per_m: 40.7, netto_mq: 60.6,
      camera: "5,03 x 6,21", cucina: "2,86 x 6,31", bagno: "2,00 x 4,49",
      nota: "E' la lettura adottata nel modello: nasce da una misura presa sul disegno, dove i gradini sono l'unico oggetto di dimensione nota." },
    { fonte: "fotografie: elementi dei radiatori e piastrelle di pavimento", px_per_m: 44.9, netto_mq: 54,
      camera: "4,65 x 5,85", cucina: "3,05 x 5,75", bagno: "1,75 x 4,35",
      nota: "Nasce da un conteggio di elementi di radiatore (13 x 8 cm) e da piastrelle di formato assunto. Il bagno le da' una mano: una vasca da 70 cm piu' un passaggio stretto stanno in 1,75 m meglio che in 2,00." }
  ],

  /* La bussola disegnata a mano sulla planimetria punta in basso a sinistra.
   * Quindi l'alto del disegno (il cortile) guarda circa a SSE e la strada a NNO.
   * Simbolo tracciato a mano: tolleranza ampia. */
  nord: { azimut_alto_disegno_gradi: 149, certezza: "dedotto",
          incertezza_gradi: 15,
          conseguenze: "Cucina e bagno (cortile) prendono luce da mattina a mezzogiorno; la camera sulla strada prende la luce di fine pomeriggio." },

  stanze: [
    { id: "cucina", nome: "Cucina", area_mq: 17.1, certezza: "misurato",
      poligono: [[0.87,0.74],[3.17,0.74],[3.17,7.05],[0.31,7.05],[0.31,2.46],[0.87,2.46]],
      dettagli: [
        "Parete ovest attrezzata: pensili con cappa, rivestimento a piastrelle su una fascia da ~0,50 a ~1,55 m, attacco acqua e prese. I mobili base sono stati in parte rimossi e a terra resta la traccia dello zoccolo.",
        "Parete sud: scaldabagno elettrico staffato in alto nell'angolo, tubi in rame a vista e, più in alto, un disco metallico che è quasi certamente il tappo di una canna fumaria.",
        "Parete est: dietro il frigorifero c'è una nicchia ad arco che sulla planimetria non compare. Larghezza stimata 0,7-1,0 m: potrebbe essere una vecchia apertura tamponata.",
        "La finestra sta dentro la parte stretta della stanza, e lì c'è un secondo punto luce a soffitto: quel rientro sembra un vano a sé, non un semplice sguincio.",
        "Pavimento in gres beige di grande formato. Lavori in corso, ma cucina ancora in uso."
      ],
      nota: "Stanza lunga e stretta: 2,86 m di larghezza per 6,31 m. Nell'angolo nord-ovest un risalto del muro di 56 cm per 1,72 m (probabile canna fumaria o spalla di camino): lì la stanza si stringe a 2,30 m." },

    { id: "bagno", nome: "Bagno / WC", area_mq: 9.0, certezza: "misurato",
      poligono: [[3.34,0.74],[5.34,0.74],[5.34,5.23],[3.34,5.23]],
      dettagli: [
        "Lato ovest, dalla porta verso la finestra: vasca con bastone doccia appeso al soffitto, bidet, WC con cassetta alta.",
        "Lato est: lavabo a colonna con pensile a specchio. Due applique, nessun punto luce a soffitto.",
        "Sotto la finestra, dentro il rientro: radiatore e lavatrice a carica frontale.",
        "In testa alla stanza un arco ribassato attraversa tutta la larghezza e abbassa il soffitto nell'ultimo tratto.",
        "È l'unico vano in ordine: rivestimenti e sanitari datati ma integri, nessun lavoro in corso."
      ],
      nota: "2,00 x 4,49 m. Sanitari e lavatrice in fila lungo i lati lunghi, finestra in fondo sul cortile." },

    { id: "ingresso", nome: "Ingresso", area_mq: 3.3, certezza: "misurato",
      poligono: [[3.34,5.38],[5.34,5.38],[5.34,7.05],[3.34,7.05]],
      dettagli: [
        "Nessuna fotografia: è l'unico vano completamente non documentato."
      ],
      nota: "2,00 x 1,67 m. È il nodo della casa: da qui si va in cucina (ovest), in bagno (nord) e in camera (sud); la porta di casa è a est, sul pianerottolo." },

    { id: "camera", nome: "Camera", area_mq: 31.2, certezza: "misurato",
      poligono: [[0.31,7.63],[5.34,7.63],[5.34,13.84],[0.31,13.84]],
      dettagli: [
        "Pavimento in listoni di legno bruno-rossastri, consumati: l'unico vano non piastrellato.",
        "Finestre con sguincio profondo e arco ribassato in testa, bancale in legno, radiatore appeso dentro il rientro.",
        "Parete ovest cieca per tutta la lunghezza inquadrata.",
        "Sulla mazzetta della porta: intonaco fresco non tinteggiato e due scatole elettriche nuove con i cavi penzolanti. Punto luce a soffitto tappato.",
        "Cantiere aperto: teli sul letto, scala a libro, secchi e attrezzi."
      ],
      nota: "5,03 x 6,21 m, due finestre sulla strada. Sul disegno una linea tratteggiata la divide in due a 2,99 m dal muro ovest, una metà per finestra. Guardando la foto da vicino la divisione non sembra ancora costruita: dalla porta si vedono la parete di fondo per circa 3,6 m e l\'angolo sud-ovest, cioè quasi tutta la stanza. Sulla mazzetta della porta però ci sono intonaco fresco e due scatole elettriche nuove con i cavi penzolanti: un lavoro in corso proprio lì. L\'ipotesi è che la divisione sia in programma, non fatta." },

    { id: "vano-scale", nome: "Vano scale", area_mq: 18.5, certezza: "misurato",
      comune: true,
      poligono: [[5.57,0.74],[8.51,0.74],[8.51,7.05],[5.57,7.05]],
      nota: "Non fa parte dell'unità. Due rampe da ~1,37 m attorno a un muro centrale; pedata ~29 cm. Serve da riferimento di scala." }
  ],

  /* Spessori dei muri misurati sul disegno, utili per capire l'età e il rumore. */
  muri: [
    { id: "nord",     descrizione: "Muro esterno sul cortile",        spessore_m: 0.74, certezza: "misurato" },
    { id: "sud",      descrizione: "Muro esterno sulla strada",      spessore_m: 0.66, certezza: "misurato" },
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
    { id: "fin-camera-ovest", tipo: "finestra", stanza: "camera", muro: "sud", affaccio: "strada",
      da: [0.75,13.84], a: [1.98,13.84], larghezza_m: 1.23, certezza: "misurato" },
    { id: "fin-camera-est", tipo: "finestra", stanza: "camera", muro: "sud", affaccio: "strada",
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
    { id: "nicchia-arco-cucina", tipo: "elemento-non-a-disegno", stanza: "cucina",
      certezza: "da-verificare",
      nota: "Nicchia ad arco nella parete est della cucina, vista in fotografia dietro il frigorifero. Sulla planimetria non c'è: nicchia di servizio, o apertura tamponata." },
    { id: "segni-a-mano", tipo: "annotazione-manoscritta", stanza: "camera",
      nota: "Frecce e una curva tracciate a penna sulla copia, in alto nella camera. Non fanno parte del disegno catastale; significato ignoto." }
  ],

  /* Punti di presa delle fotografie: dove stava chi ha scattato e dove guardava.
   * `direzione_gradi`: 0 = verso il basso del disegno (la strada), 90 = verso
   * destra (vano scale), 180 = verso il cortile, 270 = verso ovest. */
  foto: [
    { id: "cucina-a", n: 1, stanza: "cucina", posizione: [2.60, 6.30], direzione_gradi: 180, fov_gradi: 70,
      didascalia: "Dalla porta della cucina verso la finestra sul cortile: parete attrezzata a sinistra, finestra in fondo nel rientro.",
      certezza: "dedotto" },
    { id: "cucina-b", n: 2, stanza: "cucina", posizione: [1.90, 1.90], direzione_gradi: 0, fov_gradi: 70,
      didascalia: "La vista opposta, dal fondo verso la porta: scaldabagno e canna fumaria sulla parete di fondo, nicchia ad arco dietro il frigorifero.",
      certezza: "dedotto" },
    { id: "bagno", n: 3, stanza: "bagno", posizione: [4.34, 4.80], direzione_gradi: 180, fov_gradi: 70,
      didascalia: "Dalla porta del bagno verso la finestra: vasca, bidet e WC a sinistra, lavabo a destra, arco ribassato in testa.",
      certezza: "dedotto" },
    { id: "camera", n: 4, stanza: "camera", posizione: [4.30, 7.95], direzione_gradi: 335, fov_gradi: 75,
      didascalia: "Dalla porta della camera verso sud-sud-ovest: in campo la finestra ovest e la parete ovest, la finestra est resta fuori inquadratura.",
      certezza: "dedotto" }
  ],

  /* Cosa manca per chiudere la ricostruzione. */
  da_rilevare: [
    { priorita: 1, cosa: "Una foto con il metro srotolato lungo una parete, una per stanza",
      perche: "Separa le due letture di scala: oggi la stessa casa puo' valere 60,6 mq o 54." },
    { priorita: 2, cosa: "Ingresso: uno scatto per ciascuna delle quattro pareti",
      perche: "Non e' coperto da nessuna fotografia, ed e' il vano da cui si aprono tutte le porte." },
    { priorita: 3, cosa: "Camera: una frontale sulla parete sud, con dentro tutte e due le finestre",
      perche: "Dice se la divisione tratteggiata e' stata costruita, e dove cade il setto fra le finestre." },
    { priorita: 4, cosa: "Camera: dall'angolo sud-ovest verso nord-est",
      perche: "Chiude in un colpo la parete della porta, la parete est e l'angolo nord-est." },
    { priorita: 5, cosa: "Cucina: la parete est con il frigorifero spostato",
      perche: "Per capire se la nicchia ad arco e' una nicchia o una porta tamponata." },
    { priorita: 6, cosa: "Bagno: la vista opposta, dalla finestra verso la porta",
      perche: "La parete sud del bagno non compare in nessuno scatto." },
    { priorita: 7, cosa: "Una foto della planimetria in piano, perpendicolare, senza prospettiva",
      perche: "La zona fra ingresso e camera e' illeggibile, e li' sta la porta della camera." },
    { priorita: 8, cosa: "Un soffitto per stanza",
      perche: "A 3,20 m travi, volte o cornici cambiano il modello in altezza." }
  ]
};
