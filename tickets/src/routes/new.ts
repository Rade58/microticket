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

    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log(ticket.version);
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");
    console.log("-------------------------------------");

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      // EVO DODAO SAM I version FIELD
      version: ticket.version,
      //
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
