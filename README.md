# listener ABSTRACT CLASS

***

digresija:

ABSTRACT CLASSES MOGU BITI SAMO EXTENDED A NE I INSTANTIATED

**ABSTRACT PROPERTIES I METODE SU ONI, KOJE SUBCLASS-A MORA DA IMA**

**ALI ONI NE SMEJU BITI DEFINED KADA PRAVIS ABSTRACT KLASU (SAMO IH MOZES TYPE-OVATI)**

***

U ISTOM FILE-U GDE JE `nats_test_project/src/listener.ts` ,PRAVICU POMENUTI ABSTRACT CLASS, NE BRIN ISE KASNIJE CU GA SKLONITI ODATLE

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";

// OVAJ CODE MOZES KORISTITI KAO PODSETNIK I REFERENCU
// DOK GRADIS ABSTRACT CLASSU Listener NA DNU FILE-A

console.clear();

const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)

    .setDeliverAllAvailable()

    .setDurableName("some-microservice");

  const subscription = stan.subscribe(
    "ticket:created",

    "novi-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);

    msg.ack();
  });
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});

//
// EVO KREIRM ABSTRACT CLASS-U Listener

abstract class Listener {
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
   * @description Sets option
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
      // MISLI MDA CE TI TU TREBATI DA POZOVES msg.ack INSIDE onMessage
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
