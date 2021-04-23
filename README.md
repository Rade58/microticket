# QUEUE GROUPS

DAKLE U PROSLOM BRANCHU SAM TI POKAZO KAKO TO SVAKI CLIENT, ODNOSNO SVAKI PUBLISHER I LISTENER MORAJ UBITI CONNECTED SA ISTIM CLIENT ID-JEM (SAMO TAKAV CONNECTING JE I MOGUC)

A TRENUTNO IMAM JEDNOG PUBLISHERA I DVA LISTENER-A

HAJDE DA MALO POPRAVIM LISTNER CODE, DA STMAPAM NESTO LEPSE, ON message

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  subscription.on("message", (msg: Message) => {
    // const eventNumber = msg.getSequence();
    // const topic = msg.getSubject();
    // console.log({ topic, eventNumber });
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);

      // console.log(dataObject.title);
      // console.log(dataObject.id);
      // console.log(dataObject.price);
    }
    // EVO ZELIM DA STMAPAM OVAKAV STRING
    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    //
  });
});

```

SADA KADA RESTARTUJES PUBLISHERA (CIME SE PUBLISH-UJE EVENT), I KADA NATS STREAMING SERVER POSALJE EVENT-OVE, U TERMINALIMA LISTENERA CE SE STMAPTI OVO

ZA PRVI:

```zsh
Received event #16, with data: {"id":"123","title":"concert","price":20}

```

I ZA DRUGI:

```zsh
Received event #16, with data: {"id":"123","title":"concert","price":20}

```
