# PUBLISHING AN EVENT FROM `tickets` MICROSERVICE

MI SMO TAJ PUBLISHING VEC DEFINISALI U NASEM HANDLERU, EVO POGLEDAJ

- `cat tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

// EVO UVOZIM, PRVO MOJ UCUSTOM PUBLISHER KLASU
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
// UVOZIM I NATS WRAPPER-A, S KOJEG CU UZETI NATS CLIENT-A
import { natsWrapper } from "../events/nats-wrapper";
//

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = (req.currentUser as {
      id: string;
      email: string;
      iat: number;
    }).id;

    const ticket = await Ticket.create({ title, price, userId });

    // OVDE JE TICKET CREATED
    // I MOZEMO OVDE DA PUBLISH-UJEMO EVENT NA SLEDECI NACIN
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      // BITNO JE DA OVAKO DODELJUJEM VREDNOSTI, JER GARANTUJEM DA SAM DAT UZEO
      // SA DOKUMENTA KOJI JE KREIRAN
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

```

ALI KAKO DA SUCCESSFULY LISTEN-UJEMO PRILIKOM PUBLISHING-A; USTVARI KKO DA TESTIRAMO DA LI TAJ PUBLISHING USTVARI SALJE EVENT

PA MORAMO IMATI LISTENERA, A CONVINIENTLY, MI SMO GA VEC DEFINISALI JEDANPUT, KADA SMO RADILI NAS SUBPROJECT

EVO GA

- `cat nats_test_project/src/listener.ts`

```ts
import { connect } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/tickets-created-listener";

console.clear();

const stan = connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const ticketCreatedListener = new TicketCreatedListener(stan);

  ticketCreatedListener.listen();
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
```
