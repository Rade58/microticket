# NAPRAVICEMO SADA AUTOMATED TESTING ZA PAYMENT, ODNOSNO ZA CHARGING

U PROSLOM BRANCH-U USPESNO SAM KREIRAO CHARGE, A KORISTIO SAM LAZNI, ILI SPECIAL `STRIPE TOKEN` (GOVORIM O TOKENU KOJI SE SALJE SA FRONTENDA A U KOJEM TRBAJU DA BUDU INFO O CREDIT CARD-U)

JA SAM TO URADIO KROZ MANUELNO TESTIRANJE, KORISTECI INSOMNIU

**MEDJUTIM DOBRO BI BILO DA SVE TESTIRAM KROZ AUTOMATED TESTS**

ST OSE TICE TESTIRANJA `stripe.charges.create({...})`, `POSTOJE DVA APPROACH-A, KOJA MOZEMO PREDUZETI` 

1. MOZEMO TESTIRATI USING ACTUAL STRIPE LIBRARY

TDA BISMO UVEK HITT-OVAL ISTRIPE API

ALI BILO BI ANOYING TO PUT TOGETHR

**PROBLEM BI BILA ONA ENV VARIABL-A `STRIPE_KEY`, KOJU UZIMAMO IZ SECRET OBJECT-A NA CLUSTER-U, A MI NASE AUTOMATED TESTS RUNN-UJEMO LOKALNO, ODNONO NAS TESTING SUITE RUNN-UJEMO NA NASEM MACHINE-U**

2. SECOND APPROACH BI BIO PISANJE ANOTHER MOCKA, A OVOG PUTA TO BI BIO MOCK ZA `stripe.charges.create`

VEC SMO TO RADILI RANIJE ZA `natsWrapper`

TAKO DA CEMO TO URADITI

A KASNIJE MOZDA SE ODLUCIMO DA KORISTIMO ACTUAL STRIPE API

# NAPRAVICEMO MOCK ZA `stripe.charges.create` ;ODNOSNO PRECIZNIJE ZA `stripe.ts` FILE, KOJI IMAMO U `src` FOLDERU

- `mkdir payments/src/__mocks__`

- `touch payments/src/__mocks__/stripe.ts`

```ts
export const stripe = {
  charges: {
    create: jest
      .fn()
      // ZASTO OVDE NE KORISTIM `mockImplemntation` KAO STO SA
      // KORISTIO SA natsWrapper-OM
      // ZATO STO create FUNKCIJA TREBA DA RETURN-UJE Promise
      .mockResolvedValue(
        {}
        // OVO SAM JA POMISLI ODA TREBAM DEFINISATI FUNKCIJU
        // ALI NIJE TAKO, DAKLE OVA mockImplemntation CE UZIMATI
        // PRAZAN OBJEKAT
        /* async (options: {
          currency: string;
          amount: number;
          source: string;
        }) => {} */
      ),
  },
};
```

ALI UMALO DA ZABORAVIM

**MORAMO U SETUP FILE-U DA OZNACIMO STA MOCK-UJEMO**

- `code payments/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

jest.mock("../events/nats-wrapper");
// EVO DODAO SAM OVO, I OVO JE RELATIVNO NA OVAJ FILE
// U KOJEM PISEM
jest.mock("../stripe.ts");

// OSTALO TI NE MORAM POKAZIVATI
// ...
// ...
```

# OPET U TEST FILE, KAO POKUSAVAMO DA UVEZEMO REAL THING, ALI CE BITI UVEZEN MOCK, A U OVOM SLUCAJU TO JE MOCKED `stripe`, ODNOSNO MOCKED `Stripe` INSTANCA

- `code payments/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// UVOZIM POMENUTO
import { stripe } from "../../stripe";
//

const { ObjectId } = Types;

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
    price: 69,
  });

  return order;
};

// A DOLE NA DNU CU DA PRAVIM NOVI TEST
// U KOJEM CU DA NAPRAVIM ASSERTION O TOME DA JE

// OSTLE TESTOVE KOJE SAM RANIJE PRAVIO
// ...
// ...


// SAMO POPRAVLJAM USTVARI OVAJ TEST, TAKO STO CU NAPRAVITI
// EXPECTATION DA JE MOCK USTVARI CALLED
it("returns 201 if charge is created; stripe.charges.create was called", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      // OVDE NISAM KORISTIO SPECIAL "tok_visa" ZA TOKEN (JER NIJE BITNO)
      // (ODNONO MOCKU NIJE BITN DA LI CE ZA TOKEN UZETI ILI NECE )
      // TAKO SAM NAPISAO MOCK
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(201);

  // EVO GA TAJ EXPECTATION
  expect(stripe.charges.create).toHaveBeenCalled();
});
```

- `cd payments`

- `yarn test` p `Enter` new `Enter`

SVI TESTOVI SU PROSLI, UKLJUCUJUCI I POSLEDNJI KOJI SAM MALOCAS DODAO



