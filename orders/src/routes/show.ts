import { Router, Request, Response } from "express";
import { requireAuth, NotFoundError } from "@ramicktick/common";
import { Order } from "../models/order.model";

const router = Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // POKUSAVAMO DA UZMEMO ORDER
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new NotFoundError();
    }

    res.status(200).send(order);
  }
);

export { router as deatailsOfOneOrderRouter };
