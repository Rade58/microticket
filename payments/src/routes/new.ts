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
    // PRONALAZENJE ORDER-A KOJ IUSER ZELI DA PAY-UJE
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    // MAKING SURE THAT THE ORDER BELONGS TO THE USER

    if (req.currentUser?.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    // MAKE SURE THAT ORDER IS NOT ALREADY CANCELLED
    if (order.status === OSE.cancelled) {
      throw new BadRequestError("cant't pay fo already cancelled order");
    }

    // ------------------------
    res.send({ success: true });
  }
);

export { router as createChargeRouter };
