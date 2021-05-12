# IMPLEMENTING CREATE CHARGE HANDLER

DAKLE KORINSIK BI TREBALO DA HIT-UJE OVAJ ENDPOINT

**I U BODY-JU REQUESTA NARAVNO, BICE `TOKEN PROVIDED BY STRIPE JS LIBRARY`, ZATIM `orderId`**

U HANDLERU CE SE ONDA RADITI SLEDECE:

1. PRONALAZENJE ORDERA-A, ZA KOJI USER POKUSAVA DA PAY-UJE

2. POSTARAJ SE DA ORDER ACTUALLY BELONGS TO THE USER

3. POSTARAJ SE DA ORDER NIJE ALREDY CANCELLED

4. POSTARAJ SE DA AMOUNT OF MONEY KOJI DISPLAY-UJES INSIDE THE ORDER, USTVARI MATCH-UJE AMOUNT OF MONEY ZA KOJI NAS JE USER AUTHORIZE-OVAO TO CHARGE CREDIT CARD FOR

5. MAKING REQUEST TO STRIPE API TO VERIFY PAYMENT; ODNONO TO CHATRGE USER CREDIT CARD; DAKLE TO JE BILLING USER-A

6. CREATING `CHARGE` RECORD U NASEM DATBASE-U (PRAVLJANJE Charge DOKUMENTA U Charges KOLEKCIJI DTABASE-A VEZANOG ZA `paymments` MICROSERVICE); U CHARGE RECORDU TREBA INFORMACIJA DA SMO SUCCESSFULLY BILL-OVALI USER-A FOR SOME AMOUNT OF MONEY

I TO JE OD PRILIKE SVE

**MI CEMO OVO SVE MOCI TESTIRATI SA JESTOM, KAO NASIM AUTOMATED TEST RUNNEROM**

**MI NECEMO NISTA IMPLEMENTIRATI U BROWSERU, JOS UVEK**

JER PRVO ZELIMO DA SE UVERIMO DA ALL THIS STUFF WORKS AS EXPECTED

# PRAVIMO CREATE CHARGE HANDLER U KOJEM CEMO IMPLENETIRATI GORNJU SERIJU STEP-OVA, ALI NE ODMAH; PRVO CU SVE DA WIRE-UJEM UP

- `mkdir payments/src/routes`

- `touch payments/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //
    // ZA SADA CU SAMO DA SEND-UJEM ARBITRARY THING
    // KOJI CU KASNIJE REPLACE-OVATI, VEMO BRZO
    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
```

**DA SADA WIRE-UJEMO UP POMENUTI HANDLER**

- `code payments/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

// UVOZIM HANDLER-A
import { createChargeRouter } from "./routes/new";

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

// POVEZUJEM GA OVDE
app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

AKO TI NIJE SKAFFOLD UPALJEN POKRENI GA

- `skaffold dev`

**TESTIRACEMO ROUTE U INSOMNII**

`"POST"` `https://microticket.com/api/payments/`

BODY:

```json
{
	"token": "rndom thing",
	"orderId": "random thing"
}
```

RECEIVED DATA:

```json
{
  "success": true
}
```

KAO STO VIDIS HANDLER FUNKCIONISE KAKO TREBA

**SADA MOZEMO DA IMPLEMENTIRAMO ONE STEPS OF BUSYNESS LOGIC INSIDE ROUTE HANDLER**

# SADA CEMO URADITI PRVA 3 OD STEP-OVA, KOJE SAM TI REKAO DA CEMO IMPLEMENTIRATI U HANDLER-U

- `code payments/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // PRONALAZENJE ORDER-A KOJ IUSER ZELI DA PAY-UJE
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    // MAKING SURE THAT THE ORDER BELONGS TO THE USER

    if (req.currentUser?.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    // MAKE SURE THAT ORDER IS NOT ALREADY CANCELLED
    if (order.status === OSE.cancelled) {
      throw new BadRequestError("cant't pay fo already cancelled order");
    }

    // ------------------------
    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };

```

**NARAVNO, NISAM SVE ZAVRSIO DO KRAJA ALI CU TESTIRATI LOGIKU, KOJU SAM DO SADA IMPLEMENTIRAO U GORNJEM HANDLER-U**

PISACU AUTOMATED TESTS, DAKLE KOORISTICU JEST, JER BI BILO TEDIOUS DA U INSOMNII, SVE OVO TESTIRAM

## DAKLE PISEM TESTOVE ZA `payments/src/routes/new.ts` HANDLER

- `mkdir payments/src/routes/__test__`

- `touch payments/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

const { ObjectId } = Types;

// HELPER
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

// DAKLE SVI ASSERTIONI KOJE CU SADA NAPRAVITI, BICE SA FAILING CASE-OVE
it("returns 404 if order doesn't exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getCookie())
    .send({
      token: "some stripe token",
      orderId: new ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401, if user didn't make an order", async () => {
  const order = await makeAnOrder({});

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getCookie())
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 if status of the order, is already cancelled", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const status = OSE.cancelled;

  const order = await makeAnOrder({ status, userPayload });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(400);
});

// OVO CE BITI TEST ZA SUCCESS, KOJI MOGU OVDE POCETI
// A NARAVNO MENJACU GA NARAVNO JER NISAM IMPLEMENTIRAO
// SVE INSIDE HANDLER FOR CHARGE CREATING

it("returns 201 if charge is created", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(201);
});

```

- `cd payments`

- `yarn test` p `Enter` new `Enter`

**SVI TESTOVI SU PROSLI**
