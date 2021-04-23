# GRACEFUL SHUTDOWN OF THE stan CLIENT

MOZES PROCITATI U PROSLOM BRANCHU KAKV SAM PROBLEM IMAO

SADA CU TI RACI STA ZELIM

**ZELIM DA POSTIGNEM DA NAKON UNISTENJA  CLIENT-A, KADA GA DISCONEKTUJM USTVARI, DA UOPSTE NATS STRAMING SERVER NE POKUSAVA DA SALJE EVENT DO TOG CLIENTA, ODNOSNO DA NE ASSUME-UJE DA JE TAJ CLIENT SAMO PRIVREMENO DOWN DUE TO NETWORK CONNECTION OR SOMETHING ELSE, ER TO OBICNO RADI**

DO OREDJENE MERE S CONFIGURATION OPTIONSIMA, KOJI SU SE ODNSILI NA HEARTBEAT, KOJI PROVERAVA DOWNTIME (VIDI STA JE TO U PROSLOM BRANCH-U)

DAKLE ZELIM DA NATS STREAMING SERVER RAZUME DA JE CLOSED CLIENT REALLY CLOSED I DA NE POKUSAVA NJEMU DA EMITUJE EVENT

# JA CU USTVARI DODATI CODE I U LISTENER I U PUBLISHER

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

  // DODACU JOS JEDNOG LISTNERA OVDE
  // OVO CE SE IZVRSITI SVAKI PUT KADA SE POKUSA CLOSING CLIENT-A
  // ODNOSNO NJEGOV DISCONECTING FROM THE RUNNING SERVER
  stan.on("close", () => {
    console.log("NATS connection closed!");

    // RADIMO process.exit() STO CE NAS KICK-OVATI OUT
    // RECI END THIS PROCESS I DON'T DO ANYTHING ELLSE
    process.exit();
  });
  //

  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-microservice-queue-group",
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

// A OVDE NA KRAJU DODAJEM DVA HANDLERA, KOJU WATCH-UJU ALL THE TIME
// DA LI NEKO ZATVARA OVAJ PROCESS
// DAKLE OVO JE HANDLER KOJI SLUSA KADA NEKO ODRADI
// Ctrl + C
// USTVARI PRVI JE HANDLER ZA INTERUPT SIGNAL, A DRUGI JE
// SIGNAL ZA TERMINATE SIGNAL
process.on("SIGINT", () => {
  // KADA SE TO DESI RADIMO
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});

// DAKLE OVO ZNACI DA KADA PRITISNES CTRL + C ILI KADA
// POKUSAS DA CLOSE-UJES KONEKCIJU NNATS STREAMING SERVERA
// RECI CE SE HEJ SACEKAJ DA UNISTIM OVOG CLIENT-A

// NAJVAZNIJE JE OVDE DA stan.close() GOVORI
// NATS STREAMING SERVERU DA NE SALJE VISE ANY NEW MESSAGES
// TO THIS CLIENT

// A KADA SE CLIENT ZATVORI, TEK TADA CE SE DESITI ONO
//  IZ "close" HANDLERA, KOJEG SAM DEFINISAO GORE
// I TADA CE SE IZVRSITI process.close CIME SE ZATVARO NODJS PROCESS

```

# MOZEMO OVO DA TESTIRAMO

IMAS DVA TERMINALA GDE SE RUNN-UJU LISTENERI

IMAS I JEDAN GDE SE RUNN-UJE PUBLISHER

PRITISNI CTRL + C DA UNISTIS ONA OBA LISTENER-A

BRZO IH POKRENI

I BRZO RESTARTUJ PUBLISHER, JER SI PODESIO DA SE TAKO SALJU EVENT-OVI

**ONO STO NE BI TREBAL ODA SE DESI SADA JESTE DA SE TA JEVENT NE POSALJE LISTENERU**

**ON TREBA DA BUDE POSLAT LISTENERU KOJI JE NEWLY CONNECTED, A NE ONI MSTARIM KOJI SU UNISTENI, JER SMO EKSPLICITNO REKLI NATS STREAMING SERVERU DA SU ONI UNISTENI**

I SVE JE OK

# MEDJUTIM OVO CES BOLJE DA VIDIS GLEDAJUCI U ONU STRANICU GDE TI JE MONITORING

<http://localhost:8222/streaming/channelsz?subs=1>

SADA KADA SVE RADI TI IMAS DVA OBJEKTA KOJA POKAZUJU RUNNING LISTENER CLIENTE

```json
{
  "cluster_id": "microticket",
  "server_id": "gJdbZHGPGN7jortjoENBVc",
  "now": "2021-04-23T15:51:13.447315825Z",
  "offset": 0,
  "limit": 1024,
  "count": 1,
  "total": 1,
  "channels": [
    {
      "name": "ticket:created",
      "msgs": 36,
      "bytes": 2556,
      "first_seq": 1,
      "last_seq": 36,
      "subscriptions": [
        {
          "client_id": "052e9178",
          "inbox": "_INBOX.10B8APIMZQC1ABDD18C736",
          "ack_inbox": "_INBOX.gJdbZHGPGN7jortjoENCx8",
          "queue_name": "orders-microservice-queue-group",
          "is_durable": false,
          "is_offline": false,
          "max_inflight": 16384,
          "ack_wait": 30,
          "last_sent": 35,
          "pending_count": 0,
          "is_stalled": false
        },
        {
          "client_id": "61905e71",
          "inbox": "_INBOX.3HFPLARLS5N0QG46WFCYXQ",
          "ack_inbox": "_INBOX.gJdbZHGPGN7jortjoENCvw",
          "queue_name": "orders-microservice-queue-group",
          "is_durable": false,
          "is_offline": false,
          "max_inflight": 16384,
          "ack_wait": 30,
          "last_sent": 36,
          "pending_count": 0,
          "is_stalled": false
        }
      ]
    }
  ]
}
```

SADA KADA RESTARTUJES LISTENERE I KADA RELOADUJES PAGE, NE BI NA OVOJ LISTI TREBAL ODA SE NADJE VISE OD DVA LISTNERA

I ZISTA JE TAKO

ALI TAKO NIJE BILO RANIJE KADA NISM PODESIO SVE STO SAM TI POKZO U OVOM BRANCH-U


***

ps 

OVO NAWINDOWSU MOZE DA NE FUNKCIONISE, ALI JA NE RADIM NA WINDOWS-U

***
