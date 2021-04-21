import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest, // OVO JE ONAJ HANDLER, KOJI THROW-UJE VALIDATION ERROR
  //                 KOJE PASS-UJE EXPRESS VALIDATOR
  requireAuth,
} from "@ramicktick/common";

// OVO NECU ODMAH UPOTREBITI
import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser?.id;
    const { title, price } = req.body;

    const data: { title?: string; price?: number } = {};

    // OVAKO NIJE RADIO AUTOR WORKSHOP-A
    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    // FINDING TICKET FIRST
    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    // IF IT'S NOT A RIGHT USER
    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    // UPDATING
    ticket = await Ticket.findByIdAndUpdate(id, { data }).exec();

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
