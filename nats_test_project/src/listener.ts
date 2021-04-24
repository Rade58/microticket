import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

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
    // DA NEKAKO KAZES NATS STREAMING SERVERU DA ZELIMO DA
    // REDELIVER-UJEMO, ILI GER-UJEMO messageS ,ODNOSNO EVENTS KOJI SU SE DELIVER-OVALI
    // IN THE PAST, DODAJEMO JOS JEDNU OPCIJU TO THE LIST OF OPTIONS
    // A MOZES DA SAZNAS KOJA JE TO OPCIJA TAKO STO CES KLIKNUTI
    // SA CTRL + ALT + CLICK NA subscriptionOptions
    // IZABRAO SAM OVU OPCIJU
    .setDeliverAllAvailable() // DAKLE CHAIN-OVAO SAM OVU OPCIJU
    //
    .setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    // DAKLE UKLANJAM QUEUE GROUPS
    // "orders-microservice-queue-group",
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
