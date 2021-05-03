# OPTIMISTIC CONCURRENCY

***

digresija:

`mongoose-update-if-current` PACKAGE KOJI AUTOR WORKSHOPA KORISTI, JA NECU KORISTITI, JER JE MOGUCE ONO STO OVAJ PAKET NUDI PODESITI, KROZ PAR OPCIJA U SCHEMA-I

***

JA NAIME ZELIM DA POSTIGNEM DVE STVARI

1. DA KADA DOBIJEM DOKUMENT DA ONAJ `__v` FIELD DOBIJEM POD NEKIM DRUGIM IMENOM, NA PRIMER VERSION

2. I ZELIM DA S TAJ FIELD INCREMENTIR, NAKON UPDATE-A DOKUMENTA

MEDJUTIM IMAM `NEKOLIKO PROBLEMA, KOJE SAM JA PROUZROKOVAO`, KORISTECI METODE ZA UPDATING DOKUMENTA, ZA KOJE SE NE MOZE PODESITI DA SE NAKON NJIHOVE UPOTREBE version, USTVARI INCREMNTIRA

**NAKON STO POPRAVIM POMENUTO, PODESICU PAR OPCIJA ZA SCHEMA-E, KAKO BI MOGAO POSTICI DVE GORE POMENUTE STVARI**

## SVUGDE GDE SAM KORISTIO `model.findOneAndUpdate`, JA CU KORISTITI, USTVARI `Document.set()` I `await Document.save()`

**TO JE ZATO STO SE INCRMENTING versin-A MOZE JEDINO OBAVLJATI, KADA SE POZIVA `.save()`**

URADICU TO U SVIM MICROSERVICE-OVIMA, GDE SAM KORISTIO UPDATING DOKUMENTA

- `code tickets/src/routes/update.ts`

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../events/nats-wrapper";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("title has invalid format"),
    body("price").isFloat({ gt: 0 }).withMessage("price has invalid format"),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser?.id;
    const { title, price } = req.body;

    const data: { title?: string; price?: number } = {};

    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    const ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    // UMESTO OVOGA
    /* ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      { price: data.price, title: data.title },
      { new: true, useFindAndModify: true }
    ).exec(); */

    // DEFINISEM OVO
    ticket.set("ticket", data.title);
    ticket.set("price", data.price);
    // I OVO
    await ticket.save();

    
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });


    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };

```

- `code orders/src/routes/delete.ts`

```ts
import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model";

// UVOZIM OVO
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
//

const router = Router();

router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestError("order id is invalid mongodb object id");
    }

    const order = await Order.findOne({ _id: orderId })
      // .populate("ticket")
      .exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    // UMESTO OVOGA
    /* order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: OSE.cancelld },
      { new: true, useFindAndModify: true }
    )
      .populate("ticket")
      .exec(); */
    // DEFINISEM OVO
    order.set("status", OSE.cancelled);

    // I DEFINISEM OVO
    await order.save();
    // I OVO
    await order.populate("ticket").execPopulate();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as deleteSingleOrderRouter };
```
