import { Router, Request, Response } from "express";
import "express-async-errors";

import { requireAuth, NotFoundError } from "@ramicktick/common";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
  "/api/tickets/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    console.log({ ticket });

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as getOneTicketByIdRouter };
