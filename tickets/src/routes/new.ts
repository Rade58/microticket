import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";

// UVOZIM MODEL
import { Ticket } from "../models/ticket.model";
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
    // UZIMA DATA SA BODy-JA
    const { title, price } = req.body;
    // UZIMAM USER ID
    const userId = (req.currentUser as {
      id: string;
      email: string;
      iat: number;
    }).id;
    // OVAJ GORNJI TYPING SAM URADIO SAMO ZATO STO JE TYPESCRIPT
    // YELL-OVAO NA MENE
    // ALI NEM SANSE DA JE currentUser, USTVARI null, JER
    // requireAuth MIDDLEWARE BRINE O TOME

    const ticket = await Ticket.create({ title, price, userId });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
