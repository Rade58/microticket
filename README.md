# EXTENDING `Listener` ABSTRACT CLASS

MENI JE DAKLE ZELJA DA OVU ABSTRAKTNU KLASU, KORISTIM KAKO BI LAKSE DEFINISAO LISTENER KLASE ZA ALL DIFFERENT KINDS OF EVENTS KOJI CE FLOW-OVATO AROUND OF OUR APPLICATION  

CISTO DA TE PODSETIM, TVOJ PUBLISHER, TRENUTNO IMA DEFINISAN JEDAN SUBJECT, ODNOSNO JEDAN KANAL PREMA KOJEM PUBLISH-UJE; TO JE `"ticket:created"`

**ZATO CEMO MI NAPRAVITI KLASU `TicketCreatedListener` KOJA CE ECTEND-OVATI ABSTRACT `Listener` CLASS**

POGLEDAJ OPET KAKO IZGLEDA POMENUTA ABSTRACT CLASS-A KOJU SAM DEFINISAO NA DNU `nats_test_project/src/listener.ts` FILE-A

ONE PROPERTIJE I METODE KOJE SAM TAMO DEFINISAO KAO ABSTRACR, AK OJE ONDA MORS DEFINISATI ZA CHILD KLASU, JESU `channelName`, ZATIM `queueGroupName` I `onMessage`

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";


console.clear();

// ... OVDE SAM STAVIO ABSTRACT Listener CLASS
// ALI NECU TI JE OVDE POKAZIVATI, JER ZAUZIMA MNOGO MESTA

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

## NARAVNO DA BI KORISTIO MOJU NOVU KLSU, MORAM DA JE INSTATICIZIRAM

SECAS SE DA SAM JA VEC U PRIMERU KREIRAO STAN CLIENT-A

KORISTICU TOG CLIENT, ALI IMAM SADA DOSTA CODE-A KOJI VISE NE TREBA ZA KOJI CE BITI ODGOVORNA MOJA INSTATICIZIRANA KLASA, TAK ODA MORAM REFAKTORISATI

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";


console.clear();

// ... OVDE JE DCLARED abtract Listener CLASS (ALI NE 
// ... PRIKAZUJEM TI JE JER ZAUZIMA DOSTA PROSTORA)

// ... OVDE SAM KREIRAO TicketCreatedListener KLASU, ALI NE
// ... PRIKAZUJEM TI JE JER ZAUZIMA MNOGO PROSTORA

// ...
// OVO JE OK, KORITICU GA KAO JEDINI ARGUMENT PRI INSTATICIZIRANJU
// MOJE KLASE, JER TAKO I TREBA
const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

// OVAJ CONNECT JE I DALJE POTREBAN
stan.on("connect", () => {
  console.log("Listener connected to nats");

  // I OVALOGIKA KOJA JE TU ZBOG PREVAZILAZENJANJ CONCURRENCY PROBLEMA
  //  I DALJE TREBA DA OSTANE
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  // DAKLE NISTA OD OVOGA MI VISE NE TREBA

  /* const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)

    .setDeliverAllAvailable()

    .setDurableName("some-microservice");

  const subscription = stan.subscribe(
    "ticket:created",

    "novi-queue-group",
    options
  ); */
  /*
  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);

    msg.ack();
  }) */

  // EVO OVDE INSTATIZIRAM MOJU KLASU, IAKO JE NISI MORAO
  // DA JE CUVAS U VARIJABLOJ
  const ticketCreatedListener = new TicketCreatedListener(stan);
  //

  // SVA LOGIKA SUBSCRIPTION JE U METODI listen KOJA JE NA
  // INSTANCI
  ticketCreatedListener.listen(); // DAKLE OVO SI MOGAO CHAIN-OVATI GORE
  // JER CES INSTANCU KORISTITI SAMO DA POZOVES .listen
});

// OVO JE OPET ONA LOGIKA SA KOJOM PREVAZILAZIM CONCURRENCY ISSUES I TO OSTAJE
process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
```

# SADA MOZEMO DA TESTIRAMO OVO

