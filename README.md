# KREIRANJE `Payment` DOKUMENTA U HANDLERU ZA KREIRANJE STRIPE CHARGE-A

PRO CEMO OPET DA POGLEDAMO STRIPE API DOCS, A ONO STA NAS ZANIMA JESTE STA IMA NA OBJEKTU KOJI DOBIJEMO KADA KREIRAMO STRIPE CHARGE

[DAKLE TAJ CHARGE OBJEKAT PORED OSTALOG IMA id](https://stripe.com/docs/api/charges/create) ,KOJI NAS TRENUTNO ZANIMA

ISTO TAKO DA TI OPET KAZEM [DA CHARGE PREKO ID-JA MOZES RETRIEVE-OVATI IS STRIPE API-A](https://stripe.com/docs/api/charges/retrieve) ,KORISCENJEM ONE METODE `stripe.charges.retrieve` DAKLE AKO ZELIS DA VIDIS CHAREGE IN THE FUTURE, MOZES KORISTITI POMENUTU METODU, A KADA KOMPLETIRAMO HANDLER, TAJ STRIPE CHARGE ID, BICE NA Payment

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
// UVOZIMO Payment MODEL
import { Payment } from "../models/payment.model";
//
import { stripe } from "../stripe";

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
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser?.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    if (order.status === OSE.cancelled) {
      throw new BadRequestError("cant't pay fo already cancelled order");
    }

    // UZIMAMO ID CHARGE-A
    const { id: stripeChargeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    // OVDE PRAVIMO Payment DOKUMENT
    await Payment.create({
      order: order.id,
      stripeChargeId,
    });

    // OPER SA RESPONSE-OM NE SALJEM NISTA OOSIM
    // POTVRDE DA JE SVE PROSLO USPESNO

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
```

# SADA CEMO NAPISATI TEST SA ASSERTIONOM DA JE KREIRAN NOVI `Payment` OBJEKAT U DATBASE-U

- `code payments/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order.model";
// UVESCEMO I Payment MODEL
import { Payment } from "../../models/payment.model";
//
import { stripe } from "../../stripe";

const { ObjectId } = Types;

const price = Math.round(Math.random() * 100);

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


// NEMA RAZLOGA DA PRAVIM NOVI TEST, SAMO CU OVAJ TEST PROSIRITI
it("returns 201 if charge is created; stripe.charges.create was called; stripe chare object created, and payment object created", async () => {
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

  expect(response.status).toEqual(201);

  const charges = await stripe.charges.list();

  const lastCharge = charges.data[0];

  expect(lastCharge.amount).toEqual(price * 100);

  expect(lastCharge.currency).toEqual("usd");

  // MOZEMO DA PROBAMO DA UZMEMO Payment DOKUMRNT
  // PREMA ORDER ID-JU, ALI I PREMA STRIPE CHARG ID-JU

  const payment = await Payment.findOne({
    order: order.id,
    stripeChargeId: lastCharge.id,
  });

  console.log({ payment, order });

  if (payment) {
    await payment.populate("order").execPopulate();
    // SADA MOZEMO DA NAPRAVIMO NEKE ASSERTIONS

    expect(payment.stripeChargeId).toEqual(lastCharge.id);

    expect(payment.order.id).toEqual(order.id);

    // A MOGLI SMO DA PONOVO FETCH-UJEMO CHARGE
    // NEMA VEZE STO NAM JE VEC DOSTUPNA
    // ZELIMO DA PROBAMO stripe.charges.retrieve
    const sameCharge = await stripe.charges.retrieve(payment.stripeChargeId);

    expect(sameCharge.id).toEqual(lastCharge.id);

    expect(sameCharge.amount).toEqual(order.price * 100);
  }
});
```

- `cd payments`

- `yarn test` p `Enter` new `Enter`

I TEST JE PROSAO
