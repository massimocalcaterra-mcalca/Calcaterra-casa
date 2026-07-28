# Registro dei controlli automatici

A che serve: un controllo che non trova niente e un controllo che si rompe **si assomigliano
troppo** — in entrambi i casi non succede nulla e nessuno se ne accorge. Qui restano le tracce
che permettono di distinguerli.

Cosa viene scritto, e cosa no:

| Situazione | Finisce qui? |
|---|---|
| Proposte nuove analizzate | No — la traccia sono le schede in `analisi.md` e il commit |
| Proposte nuove trovate ma **non** analizzabili (errore, fonte irraggiungibile, dato non verificabile) | **Sì**, con il motivo |
| Nessuna proposta nuova | No, tranne una riga al giorno (il giro delle 10:14) |
| Battito quotidiano | **Sì**, una riga sola: data, quante proposte in totale, nessuna nuova |

Così un registro fermo da più di un giorno significa che qualcosa non gira, e non che non
è arrivato niente.

Formato di una riga: `AAAA-MM-GG HH:MM · esito · dettaglio`

**Gli orari sono sempre ora italiana**, come tutte le date del sito. Le macchine su cui girano
i controlli lavorano in UTC, cioè due ore indietro in estate: chi scrive qui converte prima.

---

2026-07-27 20:04 · nessuna traccia · Il primo giro automatico è partito ma non ha lasciato
nulla: la proposta su Crozon delle 19:33 è rimasta non analizzata ed è stata poi lavorata a mano.
Motivo accertato il 28 (vedi sotto). È la ragione per cui esiste questo file.

2026-07-28 07:10 · non analizzate · `ms3jqrs9-6312f9b8` e `ms3jt72f-30322d61` — arrivate
il 27 alle 20:14 e 20:16, la routine è girata dieci volte fino alle 06:14 del 28 senza
analizzarle e senza scrivere qui. Il giro parte (lo conferma `last_fired_at`) ma non produce
nulla: il guasto è nella sessione automatica, non nella raccolta. Analizzate a mano.

2026-07-28 07:21 · causa accertata · Un giro di diagnostica ha isolato il guasto. Le
sessioni programmate **partono davvero** — girano però in un contenitore diverso da quello di
lavoro, che è il motivo per cui prima sembravano non partire affatto. Facevano l'analisi, la
committavano, e poi il push veniva rifiutato con **403**. Lavoro fatto, consegna impossibile.

2026-07-28 08:40 · causa precisata · Non era «repository in sola lettura», come avevo
scritto qui sopra alle 07:21. Una routine può fare push **solo su branch il cui nome comincia
per `claude/`**, e la sessione provava a scrivere su `main`. Anche la chiave di firma vuota non
stava bloccando niente — il commit di prova era stato creato, solo senza firma.

Nessuna proposta è andata persa: tutte quelle raccolte fino a qui sono state analizzate a mano
e sono in `analisi.md`.

2026-07-28 08:45 · rimedio · La routine oraria ora lavora sul branch **`claude/proposte`**
e consegna due volte: il commit sul branch, e la scheda per intero nel messaggio finale, che
arriva per notifica ed email. Il messaggio si scrive sempre, anche quando il push riesce: se un
giorno la scrittura tornasse a rompersi, il lavoro non sparirebbe di nuovo in silenzio. Su
`main` ci si passa a mano, dopo aver letto. La spunta che toglierebbe la restrizione esiste
(*Allow unrestricted branch pushes*) ma si è scelto di non attivarla.

2026-07-28 10:10 · funziona · Il push automatico **riesce**. Due giri hanno scritto sul
repository alle 09:53 e alle 09:54. La causa vera del blocco era che la routine non aveva il
repository collegato: risolto da Massimo su claude.ai. In più la routine ha **un branch suo
già assegnato** (`claude/fervent-galileo-vopdz6`, nome generato): il push passa solo su quello,
non su un `claude/` qualunque — il mio `claude/proposte` era rifiutato per il nome. Il prompt ora
non inventa più nomi: resta sul branch che trova e fa `git push -u origin HEAD`.

2026-07-28 10:12 · doppione · La proposta `ms4ci3zv-f78d0635` (Névez) è stata analizzata **due
volte**, da due giri partiti a due minuti di distanza, con giudizi diversi. Causa: il controllo
dei duplicati legge `viste.json`, che però si aggiorna solo alla FINE del giro — due giri
sovrapposti non si vedono a vicenda. Colpa mia: ho lanciato un giro a mano mentre ne stava
girando uno automatico. Non è un guasto e non si ripete da solo; se dovesse ricapitare senza
che nessuno forzi, servirà un segnale di «giro in corso». Le due schede sono state fuse in una
dopo aver rimisurato le distanze.

2026-07-28 09:45 · rimedio non confermato · Una prova tecnica lanciata alle 08:52 — solo
`checkout -B claude/proposte`, una riga scritta qui, commit e push — non ha fatto comparire
nessun branch dopo cinquanta minuti. Quindi il prefisso `claude/` da solo **non** basta.
Sospetto rimasto: la routine è stata creata da una sessione di lavoro, e in quel modo il
repository non risulta *collegato* alla routine; il proxy di GitHub concede le credenziali solo
per i repository collegati, e allora il push cade a prescindere dal nome del branch. Si verifica
aggiungendo `Calcaterra-casa` fra le Repositories della routine su claude.ai. Finché non è
confermato, la consegna buona resta il messaggio finale.

2026-07-28 16:20 · rivalutazione · L'itinerario è stato rifatto da capo, e i giudizi dati sul
percorso precedente non valevano più: tutte e sette le schede riesaminate con le distanze
rimisurate. Due si sono ribaltate. **Pointe Saint-Mathieu**, che era «fuori perché sta dall'altra
parte del Finistère», ora è sulla linea del Giorno 6-7: spostando la notte da Porspoder a
Le Conquet si guadagnano due tappe e si risparmiano sei minuti. **Concarneau**, uscita
dall'itinerario, resta a undici minuti dalla strada della mattina del 13. È la ragione per cui le
schede vanno ricontrollate quando cambia il percorso, non solo quando arriva una proposta nuova.

2026-07-28 18:25 · otto giri a vuoto · Due proposte arrivate alle 11:43 e alle 17:54 sono rimaste
non analizzate. La routine **è partita regolarmente** ogni ora — l'ultimo giro alle 18:14 — ma il
suo branch è fermo alle 9:54: nessun commit, nessuna scheda, nessun messaggio. Non ho visibilità
dentro quelle sessioni, quindi il perché resta ignoto.

Un difetto però l'ho trovato ed è mio: il prompt faceva ripartire la routine **dal proprio branch**
con `merge --ff-only`, che non porta mai dentro `main`. Il branch è rimasto indietro di otto ore,
cioè di tutta la riscrittura dell'itinerario: anche se avesse funzionato, avrebbe analizzato le
proposte contro un percorso che non esiste più. Ora il primo passo è `git merge origin/main`, ed è
dichiarato obbligatorio. Aggiunta anche una regola in testa al prompt: se non riesci, **dillo nel
messaggio finale** invece di uscire in silenzio.

Le due proposte sono state analizzate a mano.

2026-07-29 01:15 · battito · nessuna proposta nuova; 6 in archivio.
