import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";
// UVOZIMO Payment MODEL
import { Payment } from "../models/payment.model";
//
import { stripe } from "../stripe";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser?.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    if (order.status === OSE.cancelled) {
      throw new BadRequestError("cant't pay fo already cancelled order");
    }

    // UZIMAMO ID CHARGE-A
    const { id: stripeChargeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    // OVDE PRAVIMO Payment DOKUMENT
    await Payment.create({
      order: order.id,
      stripeChargeId,
    });

    // OPER SA RESPONSE-OM NE SALJEM NISTA OOSIM
    // POTVRDE DA JE SVE PROSLO USPESNO

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
