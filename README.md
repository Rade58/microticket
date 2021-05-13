# DEFINING AND THEN PUBLISHING `"payment:created"` EVENT

OPET KRECEMO OD NASEG LIBRARY-JA `@ramicktic/common` ,GDE DEFINISEMO INTERFACE ZA EVENT

- `code common/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (ALSO KNOWN AS SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  ticket_updated = "ticket:updated",
  order_created = "order:created",
  order_cancelled = "order:cancelled",
  expiration_complete = "expiration:complete",
  // DODAO OVO IME KANALA
  payment_created = "payment:created",
}
```

- `touch common/src/events/event-interfaces/payment-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface PaymentCreatedEventI {
  channelName: CNE.payment_created;
  data: {
    id: string;
    orderId: string;
    stripeChargeId: string;
  };
}

```

TI SI GORE UVRSTIO stripeCharge ID, IAKO GA NE TREBA TRENUTNO NI JEDAN DEO TVOJE APLIKACIJE, NI JEDAN MICROSERVICE (PREDPOSTAVLJAM DA JE OVO FUTURE PROOFING; DAKLE NE KAZEM DA HOCEMO IMATI U NASEM PROJEKTU; ALI MOZE SE DESITI DA SE NEKAD NA PRIMER U BUDUCNOSTI DODA NOVI MICROSERVICE, KOJI CE VERIFIKOVATI PAYMENTS ILI HANDLE-UJE RETURNS ILI WHO KNOWS WHAT)

IZVOZIM INTERFACE IZ MODULA

- `code common/src/index.ts`

```ts
// ...
// ...
// ...
// ...

// EVO DODAO SAM OVO
export * from "./events/event-interfaces/payment-created-event";
```

DA SAD REPUBLISH-UJEMO MODULE

- `cd common`

- `npm run pub`

**I SADA CU U SVIM MICROSERVICE-OVIMA, UPDATE-OATI MOJ MODUL** (NE KAZEM DA CE NAJNOVIJA VERZIJA TREBATI U SVIM MICROSERVICE-OVIMA, AL IZASTO NE BI SVAKI MICROSERVICE IMAO LATEST VERZIJU)

- `cd tickets`

- `yarn add @ramicktick/common --latest`

- `cd orders`

- `yarn add @ramicktick/common --latest`

- `cd expiration`

- `yarn add @ramicktick/common --latest`

- `cd payments`

- `yarn add @ramicktick/common --latest`

# MOGU SADA DA U `payments` NAPRAVIM CUSTOM PUBLISHERA ZA `"payment:created"`

- `mkdir payments/src/events/publishers`

- `touch payments/src/events/publishers/payment-created-publisher.ts`

```ts
import {
  Publisher,
  PaymentCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEventI> {
  channelName: CNE.payment_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.payment_created;

    Object.setPrototypeOf(this, PaymentCreatedPublisher.prototype);
  }
}

```

# SADA CU DA PUBLISH-UJEM OVAJ EVENT, NAKON USPESNOG KREIRANJA `Payment` DOKUMENTA U HANDLERU `payments/src/routes/new.ts`

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
import { Payment } from "../models/payment.model";
import { stripe } from "../stripe";
// UVOZIM NASEG CUSTOM PUBLISHER-A
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
// UVOZIM I natsWrappeer-A
import { natsWrapper } from "../events/nats-wrapper";

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

    const { id: stripeChargeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.create({
      order: order.id,
      stripeChargeId,
    });

    await payment.populate("order").execPopulate();

    // EVO OVDE PUBLISH-UJEMO
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.order.id,
      stripeChargeId: payment.stripeChargeId,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };

```

# MOGU DA PROSIRIM JEDAN TEST, KAKO BI SE UVERIO DA SE `natsWrapper.client.publish` KOJI JE MOCKED USTVARI POZIVA, I DA NAPRAVIM EXPECTATIONS ABOUT ARGUMENTS HE IS CALLED WITH

- `code `

```ts
import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order.model";
import { Payment } from "../../models/payment.model";
import { stripe } from "../../stripe";
// UVOZIMO natsWrapper ZA KOJI TI PO STOTI PUT GOVORIM DA JE MOCKED
import { natsWrapper } from "../../events/nats-wrapper";

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

it("returns 201 if charge is created; stripe.charges.create was called; stripe chare object created, payment object created; and published to 'payment:created' channel", async () => {
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

  const payment = await Payment.findOne({
    order: order.id,
    stripeChargeId: lastCharge.id,
  });

  console.log({ payment, order });

  if (payment) {
    await payment.populate("order").execPopulate();

    expect(payment.stripeChargeId).toEqual(lastCharge.id);

    expect(payment.order.id).toEqual(order.id);

    const sameCharge = await stripe.charges.retrieve(payment.stripeChargeId);

    expect(sameCharge.id).toEqual(lastCharge.id);

    expect(sameCharge.amount).toEqual(order.price * 100);

    // EVO OVDE PRAVIM TVRDNJU DA JE natsWrapper.client.publish ZAISTA CALLED

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // console.log((natsWrapper.client.publish as jest.Mock).mock.calls);

    const argumentsOfPublish = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(argumentsOfPublish.orderId).toEqual(order.id);
    expect(argumentsOfPublish.id).toEqual(payment.id);
    expect(argumentsOfPublish.stripeChargeId).toEqual(sameCharge.id);
  }
});
```

- `code payments`

- `yarn test` p `Enter` new `Enter`

**I TEST JE PROSAO**
