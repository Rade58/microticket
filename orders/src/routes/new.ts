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
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

// EVO DEFINISEM COTANTU
const EXPIRATION_PERIOD_SECONDS = 15 * 60; // EVO OVO SADA IMA
//                                          15 min U SEKUNDAMA

const router = Router();

router.post(
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

    const userId = req?.currentUser?.id;

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

    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    // KREIRAMO DOKUMENT
    const order = await Order.create({
      ticket: ticket.id,
      userId: userId as string,
      expiresAt: expirationDate,
      status: OSE.created,
    });

    // --------------------------------------------------

    // - OSTAJE DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI USTOM EVENT KLASU) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    // ------

    // SADA MOZEMO DA SEND-UJEMO ORDER BACK
    res.status(201).send(order);
  }
);

export { router as createNewOrderRouter };
