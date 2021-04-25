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

DAKLEE NECU TI OBJASNJAVATI KAKO SAM EXPOSE-OVAO NATS STREMING SERVER, I KAKO SAM PALIO LISTENERA I PUBLISHERA, JER SAM TO URADIO NEBROJENO PUTA U NEKIM PREDHODNIM BRANCHEVIMA, SAMO CU TI POKAZATI KOMANDE I TERMINALE

TERMINAL 1: (**EXPOSING NATS**)

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          3d
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          3d
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          3d
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          3d
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          3d
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          3d

```

- `kubectl port-forward nats-depl-f878fb4f9-k6fgq 4222:4222`


TERMINAL 2: (**RUNNING LISTENER ON MY LOCAL MACHINE**)

- `cd nats_test_project`

- `yarn listen`

**OVO KADA POKRENES TREBALO BI DA NATS POSALJE SVE ONE EVENT-OVE KOJI SU SE IKADA DESILI ZA KANAL `"ticket:created"`**

**TO JE ZATO STO SMO RANIJE SLALI NA TAJ KANAL TOKOM UCENJA**

OVO CE BITI OUTPUT, KOJI NE PRIKAZUJEM U ELOSTI JER MA DOSTA EVENTOVA

```zsh
# ...
# ...
Event data! { id: '123', title: 'concert', price: 20 }
Mesage received:
          subject: ticket:created
          queueGroup: payments-service
        
Event data! { id: '123', title: 'concert', price: 20 }
Mesage received:
          subject: ticket:created
          queueGroup: payments-service
```

**BITNO JE SAM ODA SAM JA DEEFINISAO DA SO OVO GORE STAMA KROZ `onMessage` METODU, MOJE KLASE** (ALI TO JE I DRUGO STMAPANJE KOJE SAM DEFINISAO U SAMOM message HANDLERU PRI DEFINISANJU ABSTRACT KLASE)

TERMINAL 3: (**RUNNING PUBLISHER ON MY LOCL MACHINE**)

- `cd nats_test_project`

- `yarn run publish`

**OVO CE DAKLE UCINITI I DA SE ODMAH POSALJE EVENT, ZATO STO SAM TAK ODEFINISAO U `nats_test_project/src/publisher.ts`**

A RESAVINGOM OVOG FAJLA RESTARTUJEM EXECUTABLE STO ZNACI DA TAKO OPET MOGU SLATI EVENT NA TAJ NACIN
