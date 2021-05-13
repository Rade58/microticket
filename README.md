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

```
