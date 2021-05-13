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
import { Payment } from "../models/payment.model";
import { stripe } from "../stripe";
// UVOZIM NASEG CUSTOM PUBLISHER-A
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
// UVOZIM I natsWrappeer-A
import { natsWrapper } from "../events/nats-wrapper";

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

    const { id: stripeChargeId } = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.create({
      order: order.id,
      stripeChargeId,
    });

    await payment.populate("order").execPopulate();

    // EVO OVDE PUBLISH-UJEMO
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.order.id,
      stripeChargeId: payment.stripeChargeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
