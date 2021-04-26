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
