import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

// SADA CU UPOTREBITI I OVO
import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";

const router = Router();

// OVDE DAKEL NECU RADITI NISTA VISE OD DODAVANJE MIDDLEWARE-OVA

router.put(
  "/api/tickets/:id",
  requireAuth,

  // DODAJEM OVE MIDDLEWARES
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("title has invalid format"),
    body("price").isFloat({ gt: 0 }).withMessage("price has invalid format"),
  ],
  // DAKLE AKO body MIDDLEWARI ODOZGO PRONADJU ERRORS (TO SU USTVARI ERROR MESSAGES)
  // ONI GA STAVE U REQUEST
  // A OVAJ SLEDECI MIDDLEWRE CE AKO SE NADJE I JEDNA TAKVA STVAR NA REQUEST-U,
  //  USTVARI THROW-UJE ERROR DO MOG ERROR HANDLER-A
  validateRequest,
  //
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

    // UPDATING
    ticket = await Ticket.findByIdAndUpdate(id, { data }, { new: true }).exec();

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
