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

## JEDINO ST MOZES JE DA U NAPRAVIS GLOBALNU FUNKCIJU JEST, KOJA CE DA FABRIKUJE, ODNOSNO BUILD-UJE COOKIE FROM SKRATCH

PROCES CE BITI KOMPKIKOVAN ALI RADICEM OSVE ONO STO SMO DOSADA RADILI U AUTHENTICATION-U

SAMO STO CE TO SADA BITI STEPS KREIRANI BY HAND

## HAJDE DA USTVARI UZMEMO JEDAN COOKIE, PA DA SE PODSETIMO STA JE INSIDE OF IT

OTVORI `https://microticket/api/users/signup` DA BI NAPRAVILI NOVOG USERA

BICES NARAVNO REDIRECTED NA INDEX PAGE

ALI TI SADA **OTVORI `Network` SEKCIJU BROWSER TOOLS-A ,STIKLIRJ `XHR`**

**KLIKNI NA RESPONSE, U PITANJU JE `current-user` (JER SE PREMA TOME IZVRSIO REQUEST PO REDIRECTING-U NA MAIN PAGE, KAKO BI SE UZEO CURRENT USER)**

**INSPECT-UJ HEADERS, I PRONADJI `cookie` HEADER**

EVO GA

```zsh
express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW5OMFlYWnlhR3hyYjI5elFHMWhhV3d1WTI5dElpd2lhV1FpT2lJMk1EZGtPV1kyTUdSa1lXSTBOekF3TWpNM1pEaGxZakFpTENKcFlYUWlPakUyTVRnNE5EVTFNelo5LmtYdjRVMl81X3lHYzQyS0hCcHFfNkl2eXI4dGotY3pBU1ZiQmxsRmpHN1EifQ==
```

**KAO STO SMO REKLI U PITANJU JE BASE64 STRING, KOJEG MOZEMO DECODE-OVATI**

```js
// browser
// STAVI OSVE OSIM ONOG   express:sess= 
> atob("eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW5OMFlYWnlhR3hyYjI5elFHMWhhV3d1WTI5dElpd2lhV1FpT2lJMk1EZGtPV1kyTUdSa1lXSTBOekF3TWpNM1pEaGxZakFpTENKcFlYUWlPakUyTVRnNE5EVTFNelo5LmtYdjRVMl81X3lHYzQyS0hCcHFfNkl2eXI4dGotY3pBU1ZiQmxsRmpHN1EifQ==")

// I OVO SAM DOBIO ZAUZVRAT (STRING U JSON FORMATU)
// I SAM VIDIS STA JE U NJEMU
"{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0YXZyaGxrb29zQG1haWwuY29tIiwiaWQiOiI2MDdkOWY2MGRkYWI0NzAwMjM3ZDhlYjAiLCJpYXQiOjE2MTg4NDU1MzZ9.kXv4U2_5_yGc42KHBpq_6Ivyr8tj-czASVbBllFjG7Q"}"
```

## NA OSNOVU SVEGA STO MOZES DA VIDIS IZ GORNJEG COOKIE-A, HAJDE DA VIDIMO STA BI TO SVE MORALI DA RADIMO U NOVOJ GLOBALNOJ FUNKCIJI JESTA, KOJ UCEMO KREIRATI

- `code tickets/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "test"; // OVO CE TI ZNACITI JER CE TI I OVO TREBATI
  //                                I TO SAM KOPIRAO IZ auth MICROSERVICE-A
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

// NEKA SE FUNKCIJA ZOVE getCookie

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      getCookie(): Promise<string[]>; // ZBOG supertest
      //                                VRACAM ARRAY
    }
  }
}

global.getCookie = async () => {
  // MOAMO BUILD-OVATI JSON WEB TOKEN PAYLOAD
  // {id: string; email: string}
  //
  // KREIRATI JSON WEB TOKEN
  //
  // MORAMO KREIRTI SESSION OBJECT
  // {jwt: <JSON WEB TOKEN> }
  //
  // SESSION OBJECT PRETVORITI U JSON
  // "{"jwt": "<json web token>"}"
  //
  // UZETI TAJ JSON I ENCODE-OVATI GA INTO BASE64
  // ZANS DA TO OBICNO RADI ONAJ cookie-session PACKAGE
  // PRE PODESAVANJA COOKIE
  //
  // KONACNO RETURN-UJEMO TAJ BASE64 STRING
  // USTVARI RETURN-OVACEMO OBJEKAT
  // KJI CE IMATI cookie PROPERTI
};

```

KADA SVE OVO NAPRAVIS MOCI CES DA SIMULIRAS AUTHENTICATION SA POMENUTOM FUNKCIJOM, U TEST ENVIROMENT-U

# SADA CU DA IMPLEMENTIRAM CODE, MOJE, JESTOVE GLOBALNE `getCookie` FUNKCIJE

- `code tickets/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

// UVEZAO SAM sign METHOD
import { sign } from "jsonwebtoken";
// UVOZIM I
import crypto from "crypto";
//

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

// NEKA SE FUNKCIJA ZOVE getCookie

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      // NEE TREBA DA BUDE ASYNC JER NISATA SYNC NECU RADITI
      // getCookie(): Promise<string[]>;
      getCookie(): string[];
    }
  }
}

// OVO NE MORA MORA DA BUDE ASYNC
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
```

# SADA MOZEMO DA KORISTIMO OVU JEST GLOBALNU FUNKCIJU U NASEM TESTIRANJU

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

// -------------------------------
it("can be accessed if user is signed in", async () => {
  // FUNKCIJA JE DOSTUPNA GLOBLNO, I NE MORAS DA JE UVOZIS
  // ALI JE KORISTIS SA global OBJECT-A

  const response = await request(app)
    .post("/api/tickets")
    // EVO
    .set("Cookie", global.getCookie())
    //
    .send({});

  expect(response.status).toEqual(201);
});
// --------------------------------

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

POKRENI TEST, AKO TI JE BIO UGASEN

- `cd tickets`

- `yarn test`

**TEST JE PASS-OVAO**


