import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = Router();

router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestError("order id is invalid mongodb object id");
    }

    const order = await Order.findOne({ _id: orderId }).exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    order.set("status", OSE.cancelled);

    await order.save();
    await order.populate("ticket").execPopulate();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      // I OVDE DODAJEM version
      version: order.version,
      //
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as deleteSingleOrderRouter };
