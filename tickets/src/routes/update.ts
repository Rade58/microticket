import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  BadRequestError,
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

    if (ticket.orderId) {
      throw new BadRequestError(
        "can not edit the ticket, it is already reserved"
      );
    }

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

    // UMESTO DA KORISTIM ticket REQUERY-EOVACU GA
    //
    const sameTicket = await Ticket.findById(ticket.id);

    if (sameTicket) {
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        // I PUBLISH-UJEM DATA SA REQUERIED TICKETA
        id: sameTicket.id,
        version: sameTicket.version,
        title: sameTicket.title,
        price: sameTicket.price,
        userId: sameTicket.userId,
      });
    }
    res.status(201).send(sameTicket);
  }
);

export { router as updateOneTicketRouter };
