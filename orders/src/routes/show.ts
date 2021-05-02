import { Router, Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@ramicktick/common";
// PORED SVEGA ZELI MI DA PROVERIM DA LI JE orderId VALID
// ZATO SAM UVEZAO OVAJ HELPER
import { isValidObjectId } from "mongoose";
//
import { Order } from "../models/order.model";

const router = Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // PROVERAVAMO DA LI JE VALID MONGODB ID
    if (!isValidObjectId(orderId)) {
      throw new Error("Invalid mongodb id");
    }

    // POKUSAVAMO DA UZMEMO ORDER
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new NotFoundError();
    }

    // AKO USER NIJE AUTHORIZED
    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    console.log(order);

    res.status(200).send(order);
  }
);

export { router as deatailsOfOneOrderRouter };
