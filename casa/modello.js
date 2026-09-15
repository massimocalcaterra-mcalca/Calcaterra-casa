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

  /* Un riscontro indipendente, fatto sulle fotografie del pavimento. */
  riscontri: [
    { cosa: "Larghezza della cucina contata sulle piastrelle",
      come: "Sul pavimento piano, a riga d'immagine fissa, le distanze reali stanno in proporzione ai pixel. Il passo delle piastrelle e' stato trovato per autocorrelazione (122 px a meta' stanza, 152 px in primo piano: la crescita e' quella giusta della prospettiva), e il corridoio libero fra i due fronti di mobili misura 3,9 passi.",
      conti: "I mobili base sono profondi 60 cm, quindi larghezza = 3,9 x piastrella + 1,1/1,2 m. Con piastrelle da 40 cm fanno 2,66-2,76 m, con piastrelle da 45 cm fanno 2,86-2,96 m.",
      esito: "La cucina e' larga fra 2,7 e 2,9 m.",
      favorisce: "La lettura a 40,7 px/m, che da' 2,86 m. L'altra vorrebbe 3,05 m, cioe' piastrelle da 50 cm, che non e' un formato corrente.",
      cautela: "Regge sul fatto che i mobili siano profondi esattamente 60 cm e sullo zoccolo arretrato, che vale +/- 10 cm. Non chiude la questione: la sposta." }
  ],

  /* La bussola disegnata a mano sulla planimetria punta in basso a sinistra.
   * Quindi l'alto del disegno (il cortile) guarda circa a SSE e la strada a NNO.
   * Simbolo tracciato a mano: tolleranza ampia. */
  nord: { azimut_alto_disegno_gradi: 149, certezza: "dedotto",
          incertezza_gradi: 15,
          conseguenze: "Cucina e bagno (cortile) prendono luce da mattina a mezzogiorno; la camera sulla strada prende la luce di fine pomeriggio." },

  /* Le superfici NON stanno qui: si calcolano dal poligono, cosi' non possono
   * divergere dalla geometria. La pagina lo fa al caricamento. */
  stanze: [
    { id: "cucina", nome: "Cucina", certezza: "misurato",
      poligono: [[0.87,0.74],[3.17,0.74],[3.17,7.05],[0.31,7.05],[0.31,2.46],[0.87,2.46]],
      dettagli: [
        "Parete ovest attrezzata: pensili con cappa, rivestimento a piastrelle su una fascia da ~0,50 a ~1,55 m, attacco acqua e prese. I mobili base sono stati in parte rimossi e a terra resta la traccia dello zoccolo.",
        "Parete sud: scaldabagno elettrico staffato in alto nell'angolo, tubi in rame a vista e, più in alto, un disco metallico che è quasi certamente il tappo di una canna fumaria.",
        "Parete est, da sud a nord: l'arco verso l'ingresso, il frigorifero, poi il lavello a due vasche con i mobili bassi. È il lato acqua.",
        "La finestra sta dentro la parte stretta della stanza, e lì c'è un secondo punto luce a soffitto: quel rientro è un vano a sé, non un semplice sguincio.",
        "È una cucina in linea su due lati: cottura a ovest, acqua a est, passaggio libero in mezzo di circa 1,6 m.",
        "Pavimento in gres beige di grande formato. Lavori in corso, ma cucina ancora in uso."
      ],
      nota: "Stanza lunga e stretta: 2,86 m di larghezza per 6,31 m. Nell'angolo nord-ovest un risalto del muro di 56 cm per 1,72 m (probabile canna fumaria o spalla di camino): lì la stanza si stringe a 2,30 m." },

    { id: "bagno", nome: "Bagno / WC", certezza: "misurato",
      poligono: [[3.34,0.74],[5.34,0.74],[5.34,5.23],[3.34,5.23]],
      dettagli: [
        "Lato ovest, dalla porta verso la finestra: vasca con bastone doccia appeso al soffitto, bidet, WC con cassetta alta.",
        "Lato est: lavabo a colonna con pensile a specchio. Due applique, nessun punto luce a soffitto.",
        "Sotto la finestra, dentro il rientro: radiatore e lavatrice a carica frontale.",
        "In testa alla stanza un arco ribassato attraversa tutta la larghezza e abbassa il soffitto nell'ultimo tratto.",
        "È l'unico vano in ordine: rivestimenti e sanitari datati ma integri, nessun lavoro in corso."
      ],
      nota: "2,00 x 4,49 m. Sanitari e lavatrice in fila lungo i lati lunghi, finestra in fondo sul cortile." },

    { id: "ingresso", nome: "Ingresso", certezza: "misurato",
      poligono: [[3.34,5.38],[5.34,5.38],[5.34,7.05],[3.34,7.05]],
      dettagli: [
        "Nessuna fotografia: è l'unico vano completamente non documentato."
      ],
      nota: "2,00 x 1,67 m. È il nodo della casa: da qui si va in cucina (ovest), in bagno (nord) e in camera (sud); la porta di casa è a est, sul pianerottolo." },

    { id: "disimpegno-camere", nome: "Disimpegno", certezza: "da-verificare",
      poligono: [[3.32,7.63],[5.34,7.63],[5.34,8.93],[3.32,8.93]],
      dettagli: [
        "Ricavato con i lavori nuovi nella testata nord della vecchia camera: pavimento in listoni come le stanze che serve.",
        "Ci si arriva dall'ingresso attraverso il vano largo nel muro di spina, rifasciato in cartongesso con i montanti metallici ancora a vista.",
        "Da qui si aprono le due camere, una porta per parte."
      ],
      nota: "2,02 x 1,30 m: largo quanto la camera est, che gli sta sotto. Le due porte sono ortogonali fra loro — quella della camera est nel muro a sud, quella della camera ovest nella tramezza a ovest. La profondita' di 1,30 m resta un'ipotesi: nessuna fotografia la inquadra per intero, e sulla planimetria del 2005 questo vano non esiste ancora." },

    { id: "camera-ovest", nome: "Camera ovest", certezza: "misurato",
      poligono: [[0.31,7.63],[3.20,7.63],[3.20,13.84],[0.31,13.84]],
      dettagli: [
        "Pavimento in listoni di legno bruno-rossastri, consumati.",
        "Finestra con sguincio profondo e arco in testa, bancale in legno, radiatore appeso dentro il rientro.",
        "Parete ovest cieca per tutta la lunghezza: e' il muro esterno di confine.",
        "Sulla mazzetta della porta: intonaco fresco non tinteggiato e due scatole elettriche nuove con i cavi penzolanti. Punto luce a soffitto tappato.",
        "Cantiere aperto: teli sul letto, scala a libro, secchi e attrezzi."
      ],
      nota: "2,89 x 6,21 m: corre per tutta la profondita' dell'edificio, perche' il disimpegno le sta accanto e non sopra. Ci si entra dalla tramezza a est, verso l'estremita' nord." },

    { id: "camera-est", nome: "Camera est", certezza: "da-verificare",
      poligono: [[3.32,9.05],[5.34,9.05],[5.34,13.84],[3.32,13.84]],
      dettagli: [
        "Stesso pavimento in listoni dell'altra camera, e stessa finestra ad arco con il radiatore dentro il rientro.",
        "Tutta la parete ovest e' la tramezza nuova in cartongesso: giunti nastrati e stuccati, ancora non tinteggiati.",
        "Parete est in muratura, con un mobile basso protetto da un telo.",
        "La finestra arriva quasi a filo della tramezza: fra il suo sguincio e l'angolo restano poco più di dieci centimetri. È il motivo per cui in fotografia quel lato sembra non avere spalletta."
      ],
      nota: "2,02 x 4,79 m. La lunghezza dipende da quanto e' profondo il disimpegno, che e' ipotizzato: se il disimpegno e' meno profondo, la camera e' piu' lunga." },

    { id: "vano-scale", nome: "Vano scale", certezza: "misurato",
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
    { id: "tramezza-bagno-ingresso", descrizione: "Tramezza bagno/ingresso", spessore_m: 0.15, certezza: "misurato" },
    { id: "tramezza-disimpegno", descrizione: "Tramezza nuova in cartongesso fra disimpegno e camere", spessore_m: 0.12, certezza: "dedotto" },
    { id: "tramezza-camere", descrizione: "Tramezza nuova in cartongesso fra le due camere", spessore_m: 0.12, certezza: "dedotto",
      nota: "Spessore non misurato: 12 cm è il valore corrente per una parete su montanti da 75 mm intonacata due volte." }
  ],

  aperture: [
    { id: "fin-cucina", tipo: "finestra", stanza: "cucina", muro: "nord", affaccio: "cortile",
      da: [1.22,0.74], a: [2.44,0.74], larghezza_m: 1.22, certezza: "misurato",
      nota: "Nicchia profonda ~0,40 m nel muro da 74 cm. Arco a tutto sesto in alto (visibile nelle foto)." },
    { id: "fin-bagno", tipo: "finestra", stanza: "bagno", muro: "nord", affaccio: "cortile",
      da: [3.60,0.74], a: [4.90,0.74], larghezza_m: 1.30, certezza: "misurato" },
    { id: "fin-camera-ovest", tipo: "finestra", stanza: "camera-ovest", muro: "sud", affaccio: "strada",
      da: [0.75,13.84], a: [1.98,13.84], larghezza_m: 1.23, certezza: "misurato" },
    { id: "fin-camera-est", tipo: "finestra", stanza: "camera-est", muro: "sud", affaccio: "strada",
      da: [3.43,13.84], a: [4.90,13.84], larghezza_m: 1.47, certezza: "misurato" },

    { id: "porta-ingresso", tipo: "porta-esterna", da_stanza: "vano-scale", a_stanza: "ingresso",
      muro: "est", da: [5.34,5.86], a: [5.34,6.76], larghezza_m: 0.90, certezza: "dedotto",
      nota: "Posizione presa dal simbolo di battente disegnato sul pianerottolo." },
    { id: "arco-cucina", tipo: "arco", da_stanza: "ingresso", a_stanza: "cucina",
      muro: "tramezza-cucina-bagno", da: [3.17,5.67], a: [3.17,6.57], larghezza_m: 0.90, certezza: "misurato",
      nota: "Non è una porta: è un arco a tutto sesto, aperto, alto circa 2,4 m alla chiave. Si vede in fotografia dall'ingresso, e dalla cucina è quello che sembrava una nicchia dietro il frigorifero." },
    { id: "porta-bagno", tipo: "porta", da_stanza: "ingresso", a_stanza: "bagno",
      muro: "tramezza-bagno-ingresso", da: [3.91,5.30], a: [4.76,5.30], larghezza_m: 0.85, certezza: "da-verificare" },
    { id: "passaggio-camera", tipo: "passaggio", da_stanza: "ingresso", a_stanza: "disimpegno-camere",
      muro: "spina", da: [3.79,7.34], a: [4.89,7.34], larghezza_m: 1.10, certezza: "misurato",
      nota: "Vano largo nel muro di spina, rifasciato in cartongesso: nelle foto si vedono i montanti metallici sulle spalle. Porta nel disimpegno nuovo, non direttamente in una camera." },
    { id: "porta-camera-ovest", tipo: "porta", da_stanza: "disimpegno-camere", a_stanza: "camera-ovest",
      muro: "tramezza-camere", da: [3.26,7.95], a: [3.26,8.75], larghezza_m: 0.80, certezza: "dedotto",
      nota: "Nella tramezza a ovest del disimpegno, allineata al muro cucina/bagno, quindi ad angolo retto con quella della camera est. Dalla camera ovest si vede la mazzetta con l'intonaco fresco e le scatole nuove: nelle foto sta a sinistra guardando verso la finestra, cioe' a est, e torna." },
    { id: "porta-camera-est", tipo: "porta", da_stanza: "disimpegno-camere", a_stanza: "camera-est",
      muro: "tramezza-disimpegno", da: [3.80,8.99], a: [4.60,8.99], larghezza_m: 0.80, certezza: "dedotto",
      nota: "E' la soglia da cui e' scattata la foto 8, con i montanti metallici sulle spalle." }
  ],

  /* Elementi segnati sul disegno che non sono muri. */
  annotazioni: [
    { id: "divisione-camera", tipo: "risolto", stanza: "camera-est",
      certezza: "misurato",
      nota: "Il tratteggio stampato sulla planimetria del 2005 correva per tutta la profondita' della camera, e la tramezza costruita fa esattamente questo, da un capo all'altro. Non cade pero' dove lo aveva messo il disegno: e' allineata al muro fra cucina e bagno, cioe' spostata di una ventina di centimetri verso est. Lo dice chi la casa la conosce, e la fotografia della camera ovest lo conferma: la spalletta a est della finestra misura circa 0,9 volte la larghezza della finestra, e con la tramezza dove la metteva il disegno ne servirebbe 0,77." },
    { id: "nicchia-arco-cucina", tipo: "risolto", stanza: "cucina",
      certezza: "misurato",
      nota: "Risolto: non era una nicchia. È l'arco che mette in comunicazione la cucina con l'ingresso, visto dalla cucina con il frigorifero davanti." },
    { id: "segni-a-mano", tipo: "annotazione-manoscritta", stanza: "camera-ovest",
      nota: "Frecce e una curva tracciate a penna sulla copia, in alto nella camera. Non fanno parte del disegno catastale; significato ignoto." }
  ],

  /* Punti di presa delle fotografie: dove stava chi ha scattato e dove guardava.
   * `direzione_gradi`: 0 = verso il basso del disegno (la strada), 90 = verso
   * destra (vano scale), 180 = verso il cortile, 270 = verso ovest. */
  foto: [
    { id: "cucina-a", n: 1, stanza: "cucina", posizione: [2.55, 6.35], direzione_gradi: 180, fov_gradi: 70,
      didascalia: "Dall'arco verso la finestra sul cortile: parete attrezzata con i pensili a sinistra, finestra in fondo nel rientro.",
      nota: "Di questa presa esiste un secondo scatto, più basso, che inquadra tutto il pavimento: è quello su cui è stato fatto il conteggio delle piastrelle." },
    { id: "cucina-b", n: 2, stanza: "cucina", posizione: [1.90, 1.90], direzione_gradi: 0, fov_gradi: 70,
      didascalia: "La vista opposta, dal fondo verso l'arco: scaldabagno e canna fumaria sulla parete sud." },
    { id: "cucina-c", n: 3, stanza: "cucina", posizione: [1.45, 6.10], direzione_gradi: 180, fov_gradi: 72,
      didascalia: "15 settembre: la cucina sgombra. Lavello e mobili bassi sulla parete est, frigorifero accanto all'arco, radiatore sotto la finestra." },
    { id: "cucina-e", n: 10, stanza: "cucina", posizione: [2.40, 3.05], direzione_gradi: 0, fov_gradi: 72,
      didascalia: "Dal fondo verso l'arco, un paio di metri più avanti della 2: in primo piano il lavello sulla parete est, in fondo lo scaldabagno." },
    { id: "bagno", n: 4, stanza: "bagno", posizione: [4.34, 4.80], direzione_gradi: 180, fov_gradi: 70,
      didascalia: "Dalla porta verso la finestra: vasca, bidet e WC a sinistra, lavabo a destra, arco ribassato in testa." },
    { id: "bagno-b", n: 5, stanza: "bagno", posizione: [4.34, 5.15], direzione_gradi: 180, fov_gradi: 75,
      didascalia: "15 settembre, dalla soglia: si vede la porta con la maniglia in ottone e tutta l'infilata fino alla lavatrice sotto la finestra." },
    { id: "ingresso", n: 6, stanza: "ingresso", posizione: [5.15, 5.58], direzione_gradi: 315, fov_gradi: 80,
      didascalia: "Il nodo della casa, finalmente fotografato: a sinistra il vano verso la camera est, a destra l'arco della cucina, in mezzo il pilastro con l'applique e la scatola elettrica." },
    { id: "camera-est-a", n: 7, stanza: "camera-est", posizione: [4.20, 10.60], direzione_gradi: 0, fov_gradi: 70,
      didascalia: "Dentro la camera est, verso la finestra: a destra la tramezza nuova in cartongesso, a sinistra la muratura." },
    { id: "camera-est-b", n: 8, stanza: "disimpegno-camere", posizione: [4.95, 8.55], direzione_gradi: 0, fov_gradi: 65,
      didascalia: "Dalla soglia della camera est, con i montanti metallici sulle spalle: in primo piano il pavimento del disimpegno." },
    { id: "camera-ovest", n: 9, stanza: "camera-ovest", posizione: [2.60, 8.45], direzione_gradi: 340, fov_gradi: 75,
      didascalia: "Dalla porta sulla tramezza, verso sud: la finestra e il muro esterno cieco sulla destra. Il letto è sotto i teli.",
      nota: "Due scatti quasi identici dalla stessa soglia, a pochi minuti di distanza." }
  ],

  /* Cosa manca per chiudere la ricostruzione. */
  da_rilevare: [
    { priorita: 1, cosa: "Una foto con il metro srotolato lungo una parete, una per stanza",
      perche: "Resta l'unica cosa che separa le due letture di scala: la stessa casa oggi puo' valere 60 mq o 54." },
    { priorita: 2, cosa: "Camera ovest: dall'angolo sud-ovest verso nord-est",
      perche: "Dice dove cade esattamente la porta nella tramezza nuova, che oggi e' collocata a stima." },
    { priorita: 3, cosa: "Le due finestre della camera in un solo scatto, o almeno il setto di muro fra le due dalla strada",
      perche: "Verifica che la tramezza nuova cada davvero sul setto fra le finestre, come dice il disegno." },
    { priorita: 4, cosa: "Ingresso: la parete della porta di casa e quella del bagno",
      perche: "La foto del 15 settembre copre due lati su quattro." },
    { priorita: 5, cosa: "Bagno: la vista opposta, dalla finestra verso la porta",
      perche: "La parete sud del bagno non compare ancora in nessuno scatto." },
    { priorita: 6, cosa: "Una foto della planimetria in piano, perpendicolare, senza prospettiva",
      perche: "Servirebbe a rileggere la zona fra ingresso e camera, che sulla foto attuale e' illeggibile." },
    { priorita: 7, cosa: "Un soffitto per stanza",
      perche: "A 3,20 m travi, volte o cornici cambiano il modello in altezza." }
  ]
};
