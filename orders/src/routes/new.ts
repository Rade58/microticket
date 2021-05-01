import { Router, Request, Response } from "express";
// AL ITREBACE NAM I ONAJ ENUM ZA status FIELD
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Order } from "../models/order.model";
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

    // - PRE NEGO STO KREIRAM ORDER, MORAMO SE UVERITI DA
    // TICKET NIJE VEC RESERVED (A TO CEMO TAK OSTO CEMO
    // SEARCH-OVATI Orders KOLEKCIJU, PREMA TICKET ID-JU)

    // ALI DAKLE MI TRAZIMO PREMA status-U KOJI NE SME BITI cancelled

    // AUTOR WORKSHOPA JE OVO ODRADIO DRUGACIJE OD MENE

    const existingOrder = await Order.findOne({
      ticket: ticketId,
      status: {
        // ON JE ZA STATUSOM QUERY-EOVAO OVAKO
        $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
        // JA SAM TO ZELEO OVAKO DA URADIM
        /* $not: [
          OSE.cancelld
        ] */
        // ALI MISLIM DA JE NJEGOV NACIN BOLJI
      },
    }).exec();

    // NJEGOV NACIN JE BOLJI JER MOZE ODMAH DA THROW-UJE ERROR
    // OVAKO
    if (existingOrder) {
      // I THROW-UJEMO BadRequestError
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }
    // DALJE CU NASTAVITI KASNIJE

    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };
