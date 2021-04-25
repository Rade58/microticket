# REFACTORING THING AROUND ABSTRACT Listener CLASS; CREATING DIFFERENT FILES


- `mkdir nats_test_project/src/events`

***

**NEKA ABSTRACT LISTENER CLASS IMA ITS OWN FILE**

U OVJ FILE CU DA STAVIM MOJU ABSTRACT KLASU

- `touch nats_test_project/src/events/abstr-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";

export abstract class Listener {
  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */
  private stanClient: Stan;

  /**
   *
   * @description ime kanala, a mogao sam ga umesto channelName nzvati
   * i subject, ali izbrao sa mda se zove kako se zove
   * TO TI JE ONO STO JE U FORMATU    ticket:created   NA PRIMER
   */
  abstract channelName: string;

  /**
   * @description SLUZI DA SE POSTIGNE UKLANJANJE EVENTA KOJI JE PROOCESSED
   */
  abstract queueGroupName: string;

  /**
   * @description
   * @param parsedData any
   * @param msg nats.Message
   */
  abstract onMessage(parsedData: any, msg: Message): void;

  /**
   * @description BROJ MILI SEKUNDI NAKON KOJIH CE STREAMING SERVER PRESTATI
   * DA SALJE NON PROCESSED EVENT
   */
  protected ackWait: number = 5 * 1000;

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;

    Object.setPrototypeOf(this, Listener.prototype);
  }

  /**
   *
   * @description Sets subscription options
   */
  subscriptionOptions() {
    return (
      this.stanClient
        .subscriptionOptions()
        /**
         * @description ako je listener down na duze bice mu poslati zaostali events
         */
        .setDeliverAllAvailable()
        /**
         * @description ali mu nece biti poslati already processed events
         * dali smo isti name kao queued group name
         */
        .setDurableName(this.queueGroupName)
        /**
         * @description morace se pozivati msg.ack da se potvrdi u listneru da je event processed
         * sto se naravno govori nats streaming serveru da ne bi slao processed event opet
         */
        .setManualAckMode(true)
        /**
         * @description na acknoledgment ce se nats streaming server cekati
         * specificirani broj milisekundi
         */
        .setAckWait(this.ackWait)
    );
  }

  /**
   * @description SETTING UP SUBSCRIPTION
   */
  listen() {
    const subscription = this.stanClient.subscribe(
      this.channelName,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(
        `Mesage received:
          subject: ${this.channelName}
          queueGroup: ${this.queueGroupName}
        `
      );

      const parsedData = this.parseMessage(msg);

      // ZASTO PASS-UJEM IN I msg
      // PA ZA SVAKI SLUCAJ, AKO BUDES TREBAO NESTO DODATNO SA
      // TOG OBJEKAT
      // NE KAZEM DA CE TI TREBATI, ALI NEKA JE
      this.onMessage(parsedData, msg);
    });
  }

  /**
   * @description parsed message
   * @param msg nats.Message
   */
  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === "string"
      ? // DAKLE JSON SE DOBIJA IZ MESSAGE-A
        JSON.parse(data)
      : // BUFER JE ISTO MOGUCNOST
        // ALI NECES NIKAD DOBITI BUFFER ALI, OVAKO SE PARSUJE BUFER
        JSON.parse(data.toString("utf-8"));
  }
}


```

***

**NEKA I LISTENR KOJI EXTEND-UJE GORNJU KLASU IMA ITS OWN FILE**

- `touch nats_test_project/src/events/tickets-created-listener.ts`

STO CE OBICNO I IMATI, JER CES TI DAKLE NA OVAJ NACIN TOKOM DEVELOPMENTA, STALNO KORISTITI ABSTRACTNU KLASU DA STALNO EXTEND-UJES, KAKO BI NAPRAVIO U POSEBNOM FILE-U, SVOJU KLASU, KOJU CES DA KORISTIS

```ts
import { Stan, Message } from "node-nats-streaming";
import { Listener } from "./abstr-listener";

export class TicketCreatedListener extends Listener {
  public channelName: string;
  public queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = "ticket:created";
    this.queueGroupName = "payments-service";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  onMessage(parsedData: any, msg: Message) {
    console.log("Event data!", parsedData);

    msg.ack();
  }
}
```

# SADA MOZEM ODA REFAKTORISEMO CODE ONAOG FAJLA U KOJEM SMO PODESAVALI LISTENING ON NATS STREAMING SERVR EVENTS

- `code nats_test_project/src/listener.ts`

```ts
import { connect } from "node-nats-streaming";
import { randomBytes } from "crypto";

// OVDE UVOZIMO NASU KLASU, NE UVOZIMO ABSTRACTNU NARAVNO
import { TicketCreatedListener } from "./events/tickets-created-listener";
// I NIST VISE NE MORAMO DA RADIMO

console.clear();

const stan = connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const ticketCreatedListener = new TicketCreatedListener(stan);

  ticketCreatedListener.listen();
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});

```


AKO ODESU U TERMINAL LISTENERA VIDECES DA SVE FUNKCIONISE ISTO KAO I RANIJE
