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

## KAO STO VIDIS PO REDNOM BROJU (SEKVENCI), TI MOZES VIDETI DA JE OBEMA LISTENERIMA, KOJI SU SUBSCRIBED, USTVARI POSLAT SAME EVENT

DA LI TO MOZE BITI PROBLEMATICNO?

USTVARI DA LI JE TO PROBLEMATICNO, AKO MI SIMULIRAMO TO DA IMAMO DVE INSTANCE ISTOG MICROSERVICE-A, KOJI RECEIVE-UJU EVENT

DA LI JE PROBLEM STO OBE INSTANCE DOBIJAJU SAME EXACT EVENT

**MOZDA BI TO ZA NJIH PRESENT-OVALO AN ISSUE**

USTVARI ZAISTA BI TO BILO PROBLEM

AKO ZAMISLIS PROJEKAT, KOJI SAM RADIO NA POCETKU UPOZNAVANJA S MICROSERVICE-OVIMA

GDE SAM KORISTIO query MICROSERVICE, KOJI JE STORE-OVAO EVENTS, DODUSE IN MEMORY U JEDNOM ARRAY-U

**NAROCITO BI BIO PROBLEMATICAN EVENT, PRI KOJEM SE NESTO KEIRA, NA PRIMER `CommentCreated`, A RECIMO DA ZAMISLIS DA SI TADA KORISTIO DATBASE ZA STORING SVAKOG COMMENT-A**

**STA DA TI IMAS DVE INSTANCE ISTOG MICROSERVICE-A KOJE SU OBE SUBSCRIBED NA TKAV EVENT**

**PA DESILO BI SE DA OBE INSTANCE POCNU DA STORE-UJU ISTU STVAR U DATBASE; DAKLE MOGUCI SU DUPLIKATI U DATBASE-U**

# VEOMA CESTO TI NECES ZELETI DA DOZVOLIS DA ISTI EVENT FROM NATS STREMING SERVER ODE DO SVAKE KOPIJE NEKOG SERVICE-A, KOJ ISI TI HORIZONTALNO SCALE-OVAO DA IMA VISE INSTANCI TOG MICROSERVICE-A

**ZELIS DA SE POSTARAS DA EVENT UVEK DODJE DO JEDNE KOPIJE MICROSERVICE-A**

