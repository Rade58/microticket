import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

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
    console.log("Event data!", parsedData);

    msg.ack();
  }
}

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

//
