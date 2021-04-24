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
    .setManualAckMode(true)
    // DAKLE UZ OVO
    .setDeliverAllAvailable()
    // PODESAVAM I OVO
    // DODAJEM STRING KOJI CE SLUITI KAO NAME ILI IDENTIFIER
    // ZA SUBSCRIPTION
    // OBICNO TREBAS DA MU DAS SAME NAME, KAKO TI SE ZOVE OVERAL MICROSERVICE
    // NA PRIMER STAVIO BI "orders-service" ILI "accounting-service"
    .setDurableName("some-microservice");

  const subscription = stan.subscribe(
    "ticket:created",
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
