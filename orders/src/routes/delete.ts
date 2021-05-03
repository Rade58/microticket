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

// UVOZIM OVO
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
//

const router = Router();

router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestError("order id is invalid mongodb object id");
    }

    const order = await Order.findOne({ _id: orderId })
      // .populate("ticket")
      .exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    // UMESTO OVOGA
    /* order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: OSE.cancelld },
      { new: true, useFindAndModify: true }
    )
      .populate("ticket")
      .exec(); */
    // DEFINISEM OVO
    order.set("status", OSE.cancelled);

    // I DEFINISEM OVO
    await order.save();
    // I OVO
    await order.populate("ticket").execPopulate();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as deleteSingleOrderRouter };
