import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
// import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    // ---- SADA MORAM NAPRAVITI expirationDate
    const expirationDate = new Date(new Date().getTime() + 15 * 60 * 1000);
    // MOZES SE IGRATI U KONZOLI SA OVIM GORE DA VIDIS KAKO SAM DOSAO DO OVOGA
    // OVO GORE JE MOGL ODA SE RADI KROS date.setSeconds(ate.getSeconds + 15 * 60)
    // ALI ME MRZI DA KORISTIM RAZNE METODE NA DATE-U
    // --------------------------------------------------

    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // DALJE CU NASTAVITI UBRZO

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };
