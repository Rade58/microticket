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
