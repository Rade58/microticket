import nats, { Message } from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  subscription.on("message", (msg: Message) => {
    const eventNumber = msg.getSequence();
    const topic = msg.getSubject();
    console.log({ topic, eventNumber });

    // DAKLE OVO JE JSON
    const data = msg.getData();

    // PRAVIMO JAVASCRIPT OBJECT
    // ALI TYPE JE MOGUCE DA BUDE Buffer ILI String (TKO KAZU TYPES)

    // ZATO MOZEMO NAPRAVITI OVU PROVERU

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);

      // SADA MOZES DA ACCESS-UJES PROPERTIJIMA
      console.log(dataObject.title);
      console.log(dataObject.id);
      console.log(dataObject.price);
    }
  });
});
