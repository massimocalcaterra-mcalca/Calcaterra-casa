# Proposte per il viaggio Normandia & Bretagne

Questa cartella è il **quaderno di lavoro** delle proposte: idee raccolte per il viaggio
del 6–16 agosto 2026, analizzate ma **non ancora inserite** nella guida. La decisione
si prende alla revisione finale.

## Come funziona

1. **Si aggiunge** una proposta da <https://calcaterra.casa/proposte/> — foto di una pagina
   di guida, link, nota. Serve la password del sito.
2. La proposta finisce nel bucket R2 sotto il prefisso `proposte/`, ed è leggibile
   pubblicamente da `https://calcaterra.casa/api/proposte`.
   Le schede già analizzate si rileggono sulla **stessa pagina**, sotto l'elenco.
3. **Ogni ora**, al minuto :14, un lavoro automatico legge l'elenco e analizza le proposte
   nuove. Consegna in due modi insieme: un commit sul **branch assegnato alla routine** (un
   nome generato, tipo `claude/fervent-galileo-vopdz6`: è l'unico su cui il push passa), e la
   scheda per intero nel messaggio finale, che arriva per notifica ed email.
4. Le schede entrano in `main` quando il branch viene riletto e fuso a mano.
5. Alla revisione finale si decide quali far entrare nella guida.

### Perché un branch separato e non `main`

Le sessioni programmate possono fare push **solo su branch il cui nome comincia per
`claude/`**: è la regola predefinita delle routine, e serve a impedire che un lavoro non
sorvegliato tocchi il branch pubblicato. Per un giorno la routine ha provato a scrivere su
`main`, ha preso 403 a ogni giro, e il lavoro è rimasto chiuso nel contenitore: fatto e
invisibile. Da qui vengono i tre giri a vuoto registrati in `registro.md`.

Attenzione a un dettaglio che è già costato una mezza giornata: **non basta il prefisso
`claude/`**. La routine ha un branch suo, con un nome generato quando la si crea, e il push passa
solo su quello. Un branch inventato con il prefisso giusto viene comunque rifiutato. Per questo il
lavoro automatico non sceglie il nome: resta sul branch che si trova già sotto i piedi e fa
`git push -u origin HEAD`.

La restrizione si potrebbe togliere (*Allow unrestricted branch pushes*, fra i permessi
della routine su claude.ai), ma si è scelto di **tenerla**: il valore del lavoro automatico
è che l'analisi venga fatta, non che finisca da sola sul sito. Il passaggio da `claude/proposte`
è la stessa cosa che dice la regola qui sotto — niente entra nella guida in automatico —
applicata anche al quaderno.

La doppia consegna serve a questo: se un giorno il push smette di funzionare, il messaggio
finale resta, e il lavoro non sparisce di nuovo in silenzio.

## Che cosa fa l'analisi

Per ogni proposta nuova:

- **identifica il posto** — nome esatto, comune, coordinate;
- **misura la deviazione reale** con OSRM sulla rete stradale, non in linea d'aria:
  quanto costa in chilometri e minuti rispetto al percorso già previsto;
- **cerca orari, prezzi e vincoli** su fonti pubbliche (siti ufficiali, uffici del turismo);
- **decide dove starebbe**: quale giornata, in che momento, e cosa andrebbe sacrificato;
- **scrive una scheda breve** in `public/proposte/analisi.md`, con un giudizio esplicito su
  se valga la pena.

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

## Dove stanno le cose

Le schede vivono in `public/proposte/analisi.md`, cioè **dentro** la cartella pubblicata, e non
qui nel quaderno. Non è un dettaglio di ordine: da lì la pagina <https://calcaterra.casa/proposte/>
se le legge da sola e le mostra formattate, senza che nessuno converta niente. Il sito non ha un
passaggio di compilazione, quindi il Markdown resta la sorgente e un piccolo lettore scritto a
mano dentro la pagina lo trasforma in schede al volo. Una scheda nuova compare da sé al primo
caricamento successivo.

Quel lettore non usa mai `innerHTML` per il contenuto delle schede: ogni pezzo diventa un nodo di
testo costruito a mano, e i link che non siano `http`/`https` non diventano cliccabili. Così una
scheda scritta male — o manomessa nel repository, che è pubblico — resta testo e non diventa
codice. È verificato con una prova che inietta di proposito tag e `javascript:` fra le schede.

## Stato

- `public/proposte/analisi.md` — le schede, dalla più recente alla più vecchia. **Pubblicata.**
- `viste.json` — gli identificativi già analizzati, per non rifare due volte lo stesso lavoro.
- `registro.md` — le tracce dei controlli automatici: i fallimenti e un battito quotidiano.
  Serve a distinguere «non è arrivato niente» da «il lavoro non gira più», che senza registro
  si assomigliano troppo. Se il registro è fermo da più di un giorno, qualcosa non va.
