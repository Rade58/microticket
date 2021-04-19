# FAKING AUTHETICATION DURING TESTS

U CODE-U KOJI SAM KOPIRAO IZ auth MICROSERVICE-A, A KOJI SE NALAZI U `tickets/src/test/setup.ts` JA SAM USTVARI DEFINISAO GLOBALNU JEST FUNKCIJU KOJA UPRAVO AKE-UJE AUTHETICATION; USTVARI FUNKCIJA NA KRAJU PROVIDE-UJE COOKIE

EVO POGLEDAJ

- `cat tickets/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

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
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});


// EVO OVO PA NADALJE JE SVE VEZANO ZA TU FUNKCIJU

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      
      makeRequestAndTakeCookie(): Promise<{
        cookie: string[];
      }>;
    }
  }
}


global.makeRequestAndTakeCookie = async () => {
  const email = "stavros@stavy.com";
  const password = "SuperCoolPerson66";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);


  const cookie = response.get("Set-Cookie");

  return { cookie };
};
```

**GORNJE NIJE RELEVANTNO ZA MOJ tickets MICROSERVICE, JER NECU IMATI ROUTE ZA SIGNING UP, KOJA JE PODESENA U FUNKCIJI KAO STO VIDIS**

NE MOGU DAKLE DA KORISTIM GORNJI APPROACH ZA DOBIJANJE COOKIE-A

**ISTO TAKO OTPADA MOGUCNOST DA NEKAKO PROGRMATICALLY KOPIRAMO COOKIE, KADA TESTIRAMO auth ,JER NE ZELIMO NIKAKVU MOGUCNOST DA KADA TESTIRAMO tickets D MORAMO DA REACH-UJEMO OUT U NKI DRUGI MICROSERVICE** (DAKLE TEST MICROSERVICE-A TREBA BITI SELF CONTAINED)
