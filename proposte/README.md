# Proposte per il viaggio Normandia & Bretagne

Questa cartella è il **quaderno di lavoro** delle proposte: idee raccolte per il viaggio
del 6–16 agosto 2026, analizzate ma **non ancora inserite** nella guida. La decisione
si prende alla revisione finale.

## Come funziona

1. **Si aggiunge** una proposta da <https://calcaterra.casa/proposte/> — foto di una pagina
   di guida, link, nota. Serve la password del sito.
2. La proposta finisce nel bucket R2 sotto il prefisso `proposte/`, ed è leggibile
   pubblicamente da `https://calcaterra.casa/api/proposte`.
3. **Ogni ora**, al minuto :14, un lavoro automatico legge l'elenco, analizza le proposte
   nuove e aggiorna `analisi.md` in questa cartella.
4. Alla revisione finale si decide quali far entrare nella guida.

## Che cosa fa l'analisi

Per ogni proposta nuova:

- **identifica il posto** — nome esatto, comune, coordinate;
- **misura la deviazione reale** con OSRM sulla rete stradale, non in linea d'aria:
  quanto costa in chilometri e minuti rispetto al percorso già previsto;
- **cerca orari, prezzi e vincoli** su fonti pubbliche (siti ufficiali, uffici del turismo);
- **decide dove starebbe**: quale giornata, in che momento, e cosa andrebbe sacrificato;
- **scrive una scheda breve** in `analisi.md`, con un giudizio esplicito su se valga la pena.

Se un dato non è verificabile, la scheda lo dice invece di inventarlo.

## Regole

- Niente entra nella guida in automatico. Le schede sono materiale per decidere.
- Le distanze si misurano, non si stimano.
- Se una proposta non sta in nessuna giornata senza rompere qualcos'altro, la scheda lo
  scrive chiaramente. Un «no» motivato vale più di un «forse».
- **Il quaderno di viaggio in PDF si rigenera solo su richiesta esplicita di Massimo.**
  Né l'analisi automatica né le modifiche alla guida lo aggiornano da sole: resta fermo
  all'ultima versione consegnata finché non viene chiesto di rifarlo.
- Da fine luglio 2026 si lavora **solo** sul viaggio Normandia & Bretagne.

## Stato

- `analisi.md` — le schede, dalla più recente alla più vecchia.
- `viste.json` — gli identificativi già analizzati, per non rifare due volte lo stesso lavoro.
- `registro.md` — le tracce dei controlli automatici: i fallimenti e un battito quotidiano.
  Serve a distinguere «non è arrivato niente» da «il lavoro non gira più», che senza registro
  si assomigliano troppo. Se il registro è fermo da più di un giorno, qualcosa non va.
