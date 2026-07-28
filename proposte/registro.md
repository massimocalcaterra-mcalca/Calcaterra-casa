# Registro dei controlli automatici

A che serve: un controllo che non trova niente e un controllo che si rompe **si assomigliano
troppo** — in entrambi i casi non succede nulla e nessuno se ne accorge. Qui restano le tracce
che permettono di distinguerli.

Cosa viene scritto, e cosa no:

| Situazione | Finisce qui? |
|---|---|
| Proposte nuove analizzate | No — la traccia sono le schede in `analisi.md` e il commit |
| Proposte nuove trovate ma **non** analizzabili (errore, fonte irraggiungibile, dato non verificabile) | **Sì**, con il motivo |
| Nessuna proposta nuova | No, tranne una riga al giorno (il giro delle 8:14) |
| Battito quotidiano | **Sì**, una riga sola: data, quante proposte in totale, nessuna nuova |

Così un registro fermo da più di un giorno significa che qualcosa non gira, e non che non
è arrivato niente.

Formato di una riga: `AAAA-MM-GG HH:MM UTC · esito · dettaglio`

---

2026-07-27 18:04 UTC · nessuna traccia · Il primo giro automatico è partito ma non ha lasciato
nulla: la proposta su Crozon delle 17:33 è rimasta non analizzata ed è stata poi lavorata a mano.
Motivo accertato il 28 (vedi sotto). È la ragione per cui esiste questo file.

2026-07-28 05:10 UTC · non analizzate · `ms3jqrs9-6312f9b8` e `ms3jt72f-30322d61` — arrivate
il 27 alle 18:14 e 18:16, la routine è girata dieci volte fino alle 04:14 del 28 senza
analizzarle e senza scrivere qui. Il giro parte (lo conferma `last_fired_at`) ma non produce
nulla: il guasto è nella sessione automatica, non nella raccolta. Analizzate a mano.

2026-07-28 05:21 UTC · causa accertata · Un giro di diagnostica ha isolato **due guasti
indipendenti**, entrambi nell'infrastruttura e non nel lavoro:

1. **Push negato.** La sessione programmata ha accesso al repository in **sola lettura**:
   ogni `git push`, su qualunque branch, viene rifiutato con **403**.
2. **Firma dei commit assente.** Il file della chiave di firma è vuoto (0 byte), quindi
   con `commit.gpgsign=true` git non produce alcuna firma e il commit non passa.

Le sessioni programmate **partono davvero** — girano però in un contenitore diverso da quello
di lavoro, che è il motivo per cui prima sembravano non partire affatto. Il lavoro che avevano
prodotto restava committato lì e non arrivava mai al repository: analisi fatta, consegna
impossibile. Nessuna proposta è andata persa: tutte quelle raccolte fino a qui sono state
analizzate a mano e sono in `analisi.md`.

2026-07-28 05:52 UTC · rimedio · La routine oraria è stata **riscritta perché non usi git**.
Ora legge le proposte dall'API del sito e `viste.json` da GitHub in sola lettura — le due cose
che funzionano — e **consegna la scheda finita nel messaggio finale**, che arriva per notifica
e per email. Le schede rientrano nel repository passando dalla sessione di lavoro, che ha
accesso in scrittura. Se non c'è niente di nuovo la routine risponde con una riga sola e si
ferma. Resta da fare, lato infrastruttura: dare accesso in scrittura e una chiave di firma
valida alle sessioni programmate. Finché non succede, il percorso qui sopra è quello buono.
