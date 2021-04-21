import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

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

    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    // IF IT'S NOT A RIGHT USER
    // TREBA DA SE POKLOPI PRONLAZAK userId, id (U ISTOM DOKUMENTU)

    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    ticket = await Ticket.findByIdAndUpdate(id, { data }).exec();

    res.status(201).send(ticket);

    // const ticket = await Ticket.findByIdAndUpdate(id,).exec
  }
);

export { router as updateOneTicketRouter };
