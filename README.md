# PUBLISHING TO `"order:created"` CHANNEL

***

digresija:

**ZA TIMESTAMP MORAS PROVIDE-OVATI UTC FORMAT (ISOS string),KAKO NE BI IMAO NESTO STO UKAZUJE NA TIMEZONE ,VEC DA IMAS NEKI GLOBALNI TIMESTAMP** (TAKVA JE PRAKSA KADA SALJES DATE)

***

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

// UVOZIMO WRAPPERA ZA NATS CLIENT
import { natsWrapper } from "../events/nats-wrapper";
//
// UVOZIMO NASEG CUSTOM PUBLISHER-A
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
//

const EXPIRATION_PERIOD_SECONDS = 15 * 60;

const router = Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const userId = req?.currentUser?.id;
    const ticket = await Ticket.findOne({ _id: ticketId }).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    const order = await Order.create({
      ticket: ticket.id,
      userId: userId as string,
      expiresAt: expirationDate,
      status: OSE.created,
    });

    // OVO SU NEKE MOJE PROVERE KOJA SAM RADIO POKRETAJUCI TEST
    console.log(
      "EXPIRES AT",
      { date: order.expiresAt },
      JSON.stringify(order.expiresAt, null, 2),
      new Date(order.expiresAt).toISOString()
    );
    // JER SAM IMA ODILEMU KAKO DA GA FORMIRAM PRE PUBLISHINGA

    // --------------------------------------------------
    // - OSTAJE DA PUBLISH-UJEMO EVENT
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      // TYPESCRIPT YELL-UJE NA MENE KADA AM URADIO OVAKO NESTO
      // expiresAt: order.expiresAt.toISOString(),
      // AL ISAM OVO MOGAO URADITI
      expiresAt: new Date(order.expiresAt).toISOString(),
      //
      userId: order.userId,
      status: order.status,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    // --------------------------------------------

    res.status(201).send(order);
  }
);

export { router as createNewOrderRouter };
```
