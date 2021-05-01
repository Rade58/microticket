# TEST SUITE SETUP FOR `orders` MICROSERVICE

I OVDE CU DOSTA KOPIRATI STVARI IZ tickets MICROSERVICE-A

- `mkdir orders/src/test`

- `mkdir orders/src/routes/__test__`

NA PRIMER IZ tickts MICROSERVICE-A SAM KOPIRAO SVE IZ `src/test/setup` FILE-A

- `touch orders/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// import request from "supertest";
// import { app } from "../app";
import { sign } from "jsonwebtoken";
// import crypto from "crypto";

jest.mock("../events/nats-wrapper");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "test";
  mongo = new MongoMemoryServer();

  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // EVO OVO DEFINISEM CLEARING MOCKS
  jest.clearAllMocks();
  //

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// NEKA SE FUNKCIJA ZOVE getCookie

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      // NEE TREBA DA BUDE ASYNC JER NISATA SYNC NECU RADITI
      // getCookie(): Promise<string[]>;
      getCookie(): string[];
      getOtherCookie(payload: { id: string; email: string }): string[];
    }
  }
}

// OVO NE MORA DA BUDE ASYNC
global.getCookie = () => {
  // MOAMO BUILD-OVATI JSON WEB TOKEN PAYLOAD
  // {id: string; email: string}
  const payload = {
    // OVO SAM SMISLIO FAKE DATA
    id: "fdfhf324325ffb",
    email: "stavros@test.com",
  };

  // KREIRATI JSON WEB TOKEN
  //
  const jwt = sign(payload, process.env.JWT_KEY as string);

  // MORAMO KREIRTI SESSION OBJECT
  // {jwt: <JSON WEB TOKEN> }
  //
  const session = { jwt };

  // SESSION OBJECT PRETVORITI U JSON
  // "{"jwt": "<json web token>"}"
  //
  const sessionJSON = JSON.stringify(session);

  // UZETI TAJ JSON I ENCODE-OVATI GA INTO BASE64
  // ZANS DA TO OBICNO RADI ONAJ cookie-session PACKAGE
  // PRE PODESAVANJA COOKIE
  const buf = Buffer.from(sessionJSON, "utf-8");

  //
  // KONACNO RETURN-UJEMO TAJ BASE64
  // ALI VODIM RACUNA DA ISPRED SEB IMA ONAJ `"express:sess="`
  // TO STAVLJAM JER COOKIE TAKO IZGLEDA KADA SAM GA PREGLEDAO
  // U BROWSERU
  // RETURN-UJEM ARRAY, JER supertest
  // CE OCEKIVATI STRING INSIDE ARRAY
  return [`express:sess=${buf.toString("base64")}`];
};

global.getOtherCookie = (payload: { id: string; email: string }) => {
  const jwt = sign(payload, process.env.JWT_KEY as string);

  const session = { jwt };

  const sessionJSON = JSON.stringify(session);

  const buf = Buffer.from(sessionJSON, "utf-8");

  return [`express:sess=${buf.toString("base64")}`];
};
```

## PREKOPIRACEMO IZ `tickets` MICROSERVICE-A I ONO STO SMO DEFINISALI AROUND MOCKS

- `mkdir orders/src/events/__mocks__`

- `touch orders/src/events/__mocks__/nats-wrapper.ts`

```ts
export const natsWrapper = {
  client: {
    /* publish(channelName: string, data: any, callback: () => void): void {
      callback();
    }, */

    // DAKLE PASS-UJEMO IN POMENUTU FAKE FUNKCIJU
    // KROZ METOFU mockImplementation
    publish: jest
      .fn()
      .mockImplementation(
        (channelName: string, data: any, callback: () => void): void => {
          //
          //
          //
          // I DALJE DAKLE OVDE MORAMO
          // PZVATI callback
          callback();
        }
      ),
  },
};
```

# TRENUTNO NEMAM NI JEDAN TEST, ALI MOGU DA PROBAM DA RUNN-UJEM TEST SUITE, KAKO BI VIDEO DA LI FUNKCIONISE

- `cd orders`

- `yarn test`

IZGLEDA DA TEST SUITE FUNKCIONISE

```zsh
No tests found, exiting with code 0

Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```
