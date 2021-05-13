# MORE REALISTIC TEST ZA STRIPE CHARGING

DAKLE JA, ZA RAZLIKU OD ONOG STO SAM RADIO U PROSLOM BRANCH-U ZELIM DA SE HITT-UJE STRIPE API

RANIJE SAM MOCK-OVAO INSTATIATED `Stripe` INSTANCU

ODNONO MOCKOVAO SAM POZIVANJE `stripe.charges.create` FUNKCIJU

ALI SADA ZELI MORE REALISTIC TEST, U KOJEM CE SE HIT-OVATI ACTUAL STRIPE API

# PRVA STVAR KOJU CEMO URADITI JESTE DA CEMO NAS SECRET STRIPE API KEY STORE-OVATI INSIDE `.env` FILE, KOJI CEMO `gitignore`-OVATI NARAVNO, A KORISTICEMO PAKET `dotenv` ZA UCITAVANJE ENV VARIJABLE

- `touch payments/.env`

- `code .gitignore`

```py
# ...
# ...

# payments
payments/node_modules
# dodao ovo
payments/.env
```

- `code payments/.env`

MISLIM DA NE MORAM DA TI GOVORIM DA ACTUAL SECRET STRIPE KEY MOZES KOPIRATI IZ STRIPE DASBOARD-A, A AKO SI ZABORAVIO IME ENV VARIABLE KOJU SI UCITAO U SECRET OBJECT CLUSTERA, TO MOZES VIDETI U DEPLOYMENT CONFIG FILE-U

```py
STRIPE_KEY=<tvoj secret stripe key>
```

SADA MOZEMO DA INSTALIRAMO `dotenv`

- `cd payments`

- `yarn add dotenv --dev`

PA MOZEMO, POMENUTI PAKET DA ISKORISTIMO U SETUP FILE-U ZA JEST

- `code payments/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

// EVO STA SAM DODAO
require("dotenv").config();

// ...
// ...
// ...
// ...
```

**SADA KADA BILO GDE U FILE-OVIMA KUCAS `process.env.STRIPE_KEY` KORISTICE SE TVOJ SECRET STRIPE KEY**

# SADA MOZES UKLONITI MOCKS ZA `stripe.ts`

NAJLAKSE MI JE DA CEO TAJ MOCKS FOLDER (U KOJEM IMAM SAMO JEDAN FILE) PREIMENUJEM (ZA SVAKI SLUCAJ)

PREIMENOVAO SAM `payments/src/__mocks__` U `payments/src/trash`

**I UKLANJAM OZNACAVANJE, `stripe.ts` KAO MOCK-A**

- `code payments/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

require("dotenv").config();

jest.mock("../events/nats-wrapper");

// EVO OVO UKLANJAM
// jest.mock("../stripe.ts");

// ...
// ...
// ...
```

# SADA MOZES KORIGOVATI TESTOVE GDE SI GOD KORISTIO `stripe.charges.create` KAO MOCK

TO JE U SUSTINI U SAMO JEDNOM TESTU

- `code payments/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// OVO VISE NE KORISTIS OVAKO, JER OVO JE SLUZILO
// RANIJE DA SE UVEZE MOCK
// import { stripe } from "../../stripe";
//

const { ObjectId } = Types;

const price = 69;

const makeAnOrder = async (options: {
  userPayload?: { id: string; email: string };
  status?: OSE;
}) => {
  const { status, userPayload } = options;

  const _id = new ObjectId().toHexString();

  const order = await Order.create({
    _id,
    userId: userPayload ? userPayload.id : new ObjectId().toHexString(),
    version: 0,
    status: status ? status : OSE.created,
    price,
  });

  return order;
};


// ...
// ...
// ...
// ...
// ...


// --------
it("returns 201 if charge is created; stripe.charges.create was called", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  // OVO MOZEMO SADA DA STAVIMO U VARIJABLU
  // VIDECES KASNIJE ZASTO SAM TO URADIO
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "tok_visa",
      orderId: order.id,
    });

  // I NE OCEKUJEM NIKAKAV ERROREUS RESPONSE
  // STO ZNACI DA CE SE CHARGE USPENO KREIRATI
  expect(response.status).toEqual(201);

  // OVO VISE NIJE RELEVANTNO
  /* expect(stripe.charges.create).toHaveBeenCalled();

  expect((stripe.charges.create as jest.Mock).mock.calls[0][0].source).toEqual(
    "tok_visa"
  );
  expect(
    (stripe.charges.create as jest.Mock).mock.calls[0][0].currency
  ).toEqual("usd");
  expect((stripe.charges.create as jest.Mock).mock.calls[0][0].amount).toEqual(
    price * 100
  ); */
});
```

# POKRENUCU TEST

- `cd payments`

- `yarn test` p `Enter` new `Enter`

**TEST JE PROSAO**

A ZELIM DA ODEM U DASBOARD STRIPE-A, MOJE ORGANIZACIJE

**ZELIM DA SE UVEERIM DA JE CHARGING NASEG FAKE USERA BIO USPESAN; ODNOSNO DA VIDIM DA LI CREDIT CARD, NASEG FAKE USER-A, ZAISTA BILLED**

IDES U `Payments` U DASHBOARD-U

I ZISTA MOGU DA VIDIM PROCESSED PAYMENT, KOJI SI TI INICIRAO KROZ TEST

STO ZNACI DA SMO USPESNO HIT-OVALI STRIPE API TOKOM TESTA

# ALI JA I DALJE NISAM ZADOVOLJAN, JER BI ZELO DA, U TESTU DOBIJEM DETAILS OF THE CHARGE FROM STIPE, KADA USPESNO BILL-UJES FAKE USERS CREDIT CARD

JER BI ZELEO DA NPISEM NEKE EXPECTATIONS ZA TE DETAILS OF THE CHARGE

ZASTO TO NE MOZES VIDETI NA RESPONSE-U

PA ZATO STO NE SALJEM NISTA IZ HANDLERA, STO BI MOZDA PROIZVEO ONAJ POZIV `stripe.charges.create`; JA USTVARI SAMO SALJE GENERIC DATA; USTVARI OVO `{success: true}`, DAKLE SALJEM HARDCODED MESSAGE I NISTA DRUGO

`TI USTVARI MOZES REDEFINISATI ONO STO SALJES SA RESPONSE-OM IZ HANDLERA; DA TU USTVARI BUDU DETAILS OF THE CHARGE`

**ALI TO NE BI VALJALO, JER TI BI MENJAO, IMPLEMENTACIJU SAMOG HANDLERA, SAMO DA BI MOGAO DA TESTIRAS NESTO U VEZI TOG HANDLERA**

TO JEDNOSTAVNO NIJE DOBRA PRAKSA

# MI USTVARI MOZEMO KOMUNICIRATI SA STRIPE API-EM DA UZMEMO CHARGE, KOJI JE CREATED; I NA TAJ NACIN MOZEMO TESTIRATI, ODNOSNO PRAVITI EXPECTATIONS ZA DETAILS OF THAT CHARGE

EVO, IMAS UPRAVO [OPISANO U DOKUMENTACIJI](https://stripe.com/docs/api/charges/retrieve), KAKO SE GET-UJE CHARGE

KORISTI SE `stripe.charges.retrieve`

MEDJUTIM MORAMO PROVIDE-OVATI ID OF THE MADE CHARE, U SLUCAJU POMENUTE METODE

MEDJUTIM [MOZEMO UZETI SVE CHARGES](https://stripe.com/docs/api/charges/list#list_charges)

TADA KORISTIMO `stripe.charges.list`

> The charges are returned in sorted order, with the most recent charges appearing first.

PO DEFULTU CE FUNKCIJA IZLISTATI 10 POSLEDNJIH CHARGES, A TI TO MOZES MENJATI SA OPCIJOM `limit` (SME DA IDE DO 100)

DAKLE MI CEMO FROM TEST REACH-OVATI DO STRIPE API I UZETI LISTU CHARG-OVA ,GDE CE MENE ZANIMATI SAMO PRVI CHARGE, ZA KOJI CU DA NAPRAVIM EXPPECTATIONS

- `code payments/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// UVOZIM NASU stripe INSTANCU
// KOJU CU D AKORISTIM U TESTU
import { stripe } from "../../stripe";
// ---------------------------------

const { ObjectId } = Types;

// ALI OVOG PUTA CU DA RANDOMLY GENERISEM price
const price = Math.round(Math.random() * 100);
// A VIDECES I ZASTO

const makeAnOrder = async (options: {
  userPayload?: { id: string; email: string };
  status?: OSE;
}) => {
  const { status, userPayload } = options;

  const _id = new ObjectId().toHexString();

  const order = await Order.create({
    _id,
    userId: userPayload ? userPayload.id : new ObjectId().toHexString(),
    version: 0,
    status: status ? status : OSE.created,
    price,
  });

  return order;
};

// ...
// ...
// ...
// ...

it("returns 201 if charge is created; stripe.charges.create was called", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "tok_visa",
      orderId: order.id,
    });

  // DAKLE NAPRAVILI SMO JEDAN CHARGE
  // KAO I RANIJE
  // I HANDLER BI TREBAO DA POSALJE 201 STATUS
  expect(response.status).toEqual(201);

  // EVO UZIMAMO LISTU CHARGE-VA
  const charges = await stripe.charges.list();

  // DOBICU USTVARI OBJEKAT, U KOJEM JE LISTA U
  // data PROPERTIJU

  // console.log({ charges: charges.data });

  const lastCharge = charges.data[0];

  // POSTO MI JE price U DOLARIMA, A DOBICU NAZAD CENTS
  // MNOZIM SA 100
  expect(lastCharge.amount).toEqual(price * 100);

  // MOGU DA PRAVIM EXPECTATION I ZA currency
  expect(lastCharge.currency).toEqual("usd");
});

```

- `cd payments`

- `yarn test` p `Enter` new `Enter`

I ZAISTA TEST JE PROSAO

AUTOR WORKSHOP JE NAPRAVIO DRUGACIJI TEST, GDE JE PRAVIO VISE CHARGE-OVA, PA JE GET-OVAO ALL CHARGES I ITERATE-OVAO DA NADJE CHARGE BY RANDOMLY GENERATED PRICE

MENE MRZI TO DA RADIM, SHVATIO SAM POENTU

# MEDJUTIM JA NISAM JOS ZAVRSIO SA DEFINICIJOM MOG HANDLER-A ZA CREATING CHARGE

PA REKAO SAM DA CU U DATBASE-U TIED TO `payments` IMATI PRIMARNU KOLEKCIJU, A TO CE BITI `Charges`; A REPLICATED KOLEKCIJA JE `Orders`

ZA Orders SAM NAPRAVIO MODEL I KORISTIO SAM GA DA BI NA `"order:create"` I `"order:cancelled"`, KRIRAO/UPDATE-OVAO REPLICATED ORDER

I ZATO IMAMO GAP I U NASEM HANDLERU ZA KREIRANJE CHARGE-A

MI JESMO KREIRALI CHARGE, VEZANO ZA STRIPE, ALI NISMO ODREDJENI DATA CHARGE-A STORE-OVALI U DATBASE, TACNIJE NAS CHARGE NEMA NA SEBI NIKAKV DATA KOJI GA POVEZUJE, SA ODREDJENIM ORDEROM

OVIM CEMO SE POZABAVITI U SLEDECEM BRANCH-U
