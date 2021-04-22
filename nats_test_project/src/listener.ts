// EVO UVEZO SAM Message TYPE
import nats, { Message } from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  // EVO SAD SAM TYPE-OVA OMESSAGE
  subscription.on("message", (msg: Message) => {
    // EVO OVDE IMAM FUNKCIJU getData
    // PROBACU DA STMAPAM DATA

    const data = msg.getData();
    const sequence = msg.getSequence();

    console.log({ data, sequence });
  });
});
