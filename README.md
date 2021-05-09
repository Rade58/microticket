# REJECTING EDITS OF RESERVED TICKET

RANIJE SMO REKLI DA CEMO OVO URADITI

JER VEC SADA SMO DEFINISALI DA `Ticket` DOKUMENT MOZE IMATI `orderId`, A KADA TO IMA IZ UGL RICKETA TO ZNACI DA NE BI TREBAL ODA BUDE MOGUC NJEGOV EDIT, ODNONO UPDATING, OD STRANE KORISNIKA KOJI JE ORIGINALLY KREIRAO TICKET, JER SAMO KORISNIK KOJI GA JE KREIRAO SME I DA GA EDIT-UJE

DAKLE U `"PUT"` `/api/tickets/:id` HANDLERU ,POTREBNO JE DEFINISATI IF STATMENT, KOJI PROVERAVA DA LI POSTOJI `orderId` NA TICKETU, I AKO POSTIJ ITAJ FIELD, ODNOSNO AKO JE TRUTHY, MOZEMO THROW-OVATI ERROR

- `code tickets/src/routes/update.ts`

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  // MISLIM DA J MOST APPROPRIATE ERROR OVDE, UPRAVO BadRequestError
  BadRequestError,
  // -----
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

    // ---- MOZEMO TU USLOVNU IZJAVU DA STAVIMO OVDE ----

    if (ticket.orderId) {
      throw new BadRequestError(
        "can not edit the ticket, it is already reserved"
      );
    }

    // ------------------------------------------------------

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    if (data["title"]) {
      ticket.set("title", data.title);
    }
    if (data["price"]) {
      ticket.set("price", data.price);
    }

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

## MOZEMO DA NAPISEMO TEST

- `code tickets/src/routes/__tests__/update.test.ts`

```ts
// ...
// ...

// UVESCU I Ticket MODEL
import { Ticket } from "../../models/ticket.model";
//


// ...
// ...
// ...
// ...

it("it returns 400 if there is orderId on the ticket", async () => {
  // KREIRACEMO JEDAN TICKET
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({
      title: "Stavros the Miighty",
      price: 69,
    });

  const { id } = response1.body;

  // NE POSTOJI ROUTE KOJI MOZES HIT-OVATI DA BI PROMENIO orderId
  // ZATO KORISTIM Ticket MODEL, MADA SAM GA MOGAO KORISTITI I DA KREIRAM RICKET ALI NEMA VEZE

  const ticket = await Ticket.findById(id);

  if (ticket) {
    ticket.set("orderId", new Types.ObjectId().toHexString());

    await ticket.save();

    // SADA MOZEMO DA POKUSAMO DA HIT-UJEMO UPDATE HANDLER

    const response2 = await request(app)
      .put(`/api/tickets/${id}`)
      .set("Cookie", global.getCookie())
      .send({
        title: "Nick Mullen estin cullen",
        price: 420,
      });

    expect(response2.status).toEqual(400);
  }
});
```

- `cd tickets`

- `yarn test` p `Enter` update `Enter`

TEST JE PROSAO

## ZA SADA SAM ZAVSIO SA orders I tickets MICROSERVICE-OVIMA

ALI NECU SE BAVITI FRONTENDOM DOK NE ZAVRSIM SVE NA BACKEND-U

A OD SLEDECEM BRANCH CU POCETI DA SE BAVIM NASIM `expiration` MICROSERVICE-OM, KOJEG TREBAM NAPRAVITI
