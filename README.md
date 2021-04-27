# CUSTOM PUBLISHER: `TicketUpdatedPublisher`

KREIRALI SMO PUBLISHER KLASU CIJU INSTANCU KORISTIM ODA DEFINISEMO PUBLISHING EVENTA U SLUCAJU TICKET CREATION-A

SADA CEMO SLICNO DA URADIMO I ZA TICET UPDATING

- `touch tickets/src/events/publishers/ticket-updated-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";
import {
  Publisher,
  TicketUpdatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEventI> {
  channelName: CNE.ticket_updated;

  constructor(stan: Stan) {
    super(stan);

    this.channelName = CNE.ticket_updated;

    Object.setPrototypeOf(this, TicketUpdatedPublisher.prototype);
  }
}
```

## SADA DA PUBLISH-UJEM EVENT

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
// UVOZIM CUSTOM PUBLISHER-A
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
// UVOZIM I STAN CLIENT-A ,ODNONO WRAPPER INSTANCU
import { natsWrapper } from "../events/nats-wrapper";
//

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

    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      { price: data.price, title: data.title },
      { new: true, useFindAndModify: true }
    ).exec();

    // EVO OVDE MOGU DA IZVRSIM SLANJE EVENTA

    if (ticket) {
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      });
    }
    // -------------------------------------

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

