# INITIAL SETUP FOR `payments` MICROSERVICE

DAKLE OPET DUPLICATE-UJEM A LOT OF STUFF FROM OTHER MICROSERVICE DA BI NAPRAVIO OVAJ (MOZES KORISTITI tickets MICROSERVICE ZA TA INICIJALNA KOPIRANJA FAILE-OVA KOJI SU ISTI U SVIM MICROSERVICE-OVIMA)

- `mkdir -p payments/src/events`

NAKON KOPIRANJA IMAM OVO

- `ls -a payments/`

```zsh
Dockerfile  .dockerignore  package.json  src  tsconfig.json
```

- `ls -a payments/src`

```zsh
app.ts  events  index.ts  test
```

- `ls -a payments/src/events`

```zsh
__mocks__  nats-wrapper.ts
```

- `ls -a payments/src/test`

```zsh
setup.ts
```

# PREPRAVLJAMO SAMO name U package.json

- `code package.json`

```json
{
"name": "payments",
// ...
``` 

# IZ `index.ts` UKLANJAMO SVE LISTENER UVOZE I NJIHOVO INSTATICIZIRANJE, I LISTENING

TAKO DA CE FILE SADA IZGLEDATI OVAKO

- `code payments/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";

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

    console.log("Connected to nats streaming server");

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (payments-mongo)");
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

# IZ `app.ts` UKLANJAMO SVE USED ROUTERS

- `code payments/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
```

# MOZEMO DA INSTALIRAMO DEPENDANCIES

- `cd payments`

- `yarn`

# DOCKER IMAGE NE PRAVIMO, I NE PUSH-UJEMO, JER KAO STO SAM TI REKAO, MNOGO PUTA RANIJE, MI IMAMO CUSTER NA GOOGLE CLOUD-U, I ZBOG TOGA TO NE MORAMO DA RADIMO

A AKO KORISTIS MINICUBE RADIO BI OVO

- `cd payments`

- `docker build -t radebajic/payments .`

OPET TI NA POMEINJEM DA NE RADIS OVO AKO KORISTIS GOOGLE CLOUD
