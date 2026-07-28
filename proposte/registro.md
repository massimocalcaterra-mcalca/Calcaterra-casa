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

2026-07-28 09:45 · rimedio non confermato · Una prova tecnica lanciata alle 08:52 — solo
`checkout -B claude/proposte`, una riga scritta qui, commit e push — non ha fatto comparire
nessun branch dopo cinquanta minuti. Quindi il prefisso `claude/` da solo **non** basta.
Sospetto rimasto: la routine è stata creata da una sessione di lavoro, e in quel modo il
repository non risulta *collegato* alla routine; il proxy di GitHub concede le credenziali solo
per i repository collegati, e allora il push cade a prescindere dal nome del branch. Si verifica
aggiungendo `Calcaterra-casa` fra le Repositories della routine su claude.ai. Finché non è
confermato, la consegna buona resta il messaggio finale.
