import nats, { Message } from "node-nats-streaming";

// EVO SA OVIM CU DA GENERISEM RANDOM STRING
import { randomBytes } from "crypto";

console.clear();

// EVO VIDIS, GENERISEM ID
const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  subscription.on("message", (msg: Message) => {
    const eventNumber = msg.getSequence();
    const topic = msg.getSubject();
    console.log({ topic, eventNumber });
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);

      console.log(dataObject.title);
      console.log(dataObject.id);
      console.log(dataObject.price);
    }
  });
});
