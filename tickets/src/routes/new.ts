import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../events/nats-wrapper";

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
    body("price").isFloat({ gt: 0 }).withMessage("can't set negative number"),
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

    // EVO OVDE SI DEFINISAO PUBLISHING EVENTA
    // I POSTO publish RETURN-UJE PROMISE
    // KOJI JE RESOLVED KADA SE USPENO POSALJE EVENT
    // ONDA JE MOGUCE TO AWAIT-OVATI
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    // -----------------------------------------------------
    // DAKLE OVAJ RED BUKVALNO CEKA DA SE USPESNO
    // PUBLISH-UJE EVENT
    // U SLUCAJU DA SE TO NE DOGODI
    // OVDE CE BITI THROWN ERROR (A NEMA STA DA GA CATCH-UJE)
    // USTVARI ERROR CE BITI CATCHED BY ERROR HANDLER KOJEG SAM PODESIO
    // NA NIVOU CELOG EXPRESS APP-A

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
