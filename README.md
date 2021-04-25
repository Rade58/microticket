# EXTENDING `Listener` ABSTRACT CLASS

MENI JE DAKLE ZELJA DA OVU ABSTRAKTNU KLASU, KORISTIM KAKO BI LAKSE DEFINISAO LISTENER KLASE ZA ALL DIFFERENT KINDS OF EVENTS KOJI CE FLOW-OVATO AROUND OF OUR APPLICATION  

CISTO DA TE PODSETIM, TVOJ PUBLISHER, TRENUTNO IMA DEFINISAN JEDAN SUBJECT, ODNOSNO JEDAN KANAL PREMA KOJEM PUBLISH-UJE; TO JE `"ticket:created"`

**ZATO CEMO MI NAPRAVITI KLASU `TicketCreatedListener` KOJA CE ECTEND-OVATI ABSTRACT `Listener` CLASS**

POGLEDAJ OPET KAKO IZGLEDA POMENUTA ABSTRACT CLASS-A KOJU SAM DEFINISAO NA DNU `nats_test_project/src/listener.ts` FILE-A

ONE PROPERTIJE I METODE KOJE SAM TAMO DEFINISAO KAO ABSTRACR, AK OJE ONDA MORS DEFINISATI ZA CHILD KLASU, JESU `channelName`, ZATIM `queueGroupName` I `onMessage`

- `code nats_test_project/src/listener.ts`

```ts
// ...
// ...


// TicketCreatedListener

class TicketCreatedListener extends Listener {
  public channelName: string;
  public queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = "ticket:created";
    this.queueGroupName = "payments-service";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  onMessage(parsedData: any, msg: Message) {
    // DAKLE SIGURNO CES OVDE KADA NESTO URADIS
    // NA PRIMER STORE-UJES NESTO U DATBASE, DA POZOVES
    // msg.ack() KAKO BI OBZANIO NATS STREAMING SERVERU DA JE
    // EVENT PROCESSED, KKO SE NE BI SLAO OPET TAJ EVNT DO LISTENERA

    // ZA SADA CONSOLE LOG-UJEM OSOME DATA

    console.log("Event data!", parsedData);

    // DAKLE AKO SVE PRODJE CORRECTLY, ZOVE SE
    msg.ack();

    // AKO NE PRODJE CORRECTLY msg.ack NEBI TREBAL ODA SE IZVRSI
    // NARAVNO TU LOGIKU CES IMPLEMENTIRATI
    // KADA BUDEMO KREIRALI NEKI KONKRETNIJI PRIMER
  }
}
```
