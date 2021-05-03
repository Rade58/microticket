# INITIALIZING THE LISTENERS

DAKLE LISTENING CEMO DEFINISATI U SAMOM `index.ts` FILE-U

- `code orders/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
// UVOZIMO NASE CUSTOM LISTENER KLASE
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
//

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );
    // --------------------------------------

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    // DAKLE OVDE, NAKON SVE ONE INCILIZACIJE NATS CLIENTA
    // MOGU DEFINISATI LISTENING
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    //

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (orders-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();
```

# POKRENUCEMO SKAFFOLD KAKO BI SVE CHANGES APPLY-OVALI NA POD U CLUSTERU, U KOJEM RUNN-UJE orders MICROSERVICE

- `skaffold dev`

VIDIM DA JE SVE PROSLO OK

# SADA MOZEMO POKRENUTI JEDAN MANUA TESTING U INSOMNII

TAKO STO CEMO HITT-OVATI TICKET CREATION HANDLER, A POSLE TOGA I TICKET UPDATING HANDLER

ISTO TAKO MORAS SE POSTARATI DA BUDES SIGNED IN (ZANS KOJI ROUTE DA HITT-UJES ZA TO)

## PRVO CEMO TESTIRATI RECEIVING EVENTA IZ "`ticket:created`" KANALA

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 69
}
```

USPESNO JE POSLAT REQUEST, I DOBIO SAM DATA

```json
{
  "title": "Mastodon",
  "price": 69,
  "userId": "608089c4eedc6e0018ea6301",
  "id": "60900ff41a1c27001828b56d"
}
```

**ALI VAZNIJE JE OVO STO SE STAMAPLO U SKAFFOLD-OVOM TERMINALU**

```zsh
[orders] Mesage received:
[orders]           subject: ticket:created
[orders]           queueGroup: order-microservice
[orders]         
[tickets] 
[tickets]             Event Published
[tickets]             Channel: ticket:created
[tickets]   
```

KAO STO VIDIS EVENT JE USPESNO PUBLIHED IZ tickets MICROSERVICE-A

A USPESNO JE RECEIVED U `orders` MICROSERVICE-U

## SADA CEMO TESTIRATI RECEIVING EVENTA IZ "`ticket:updated`" KANALA
