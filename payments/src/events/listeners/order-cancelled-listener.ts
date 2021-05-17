import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { payments_microservice } from "../queue_groups";

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = payments_microservice;

    Object.setPrototypeOf(this, OrderCancelledListener.prototype);
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {
    const order = await Order.findOneByEvent(parsedData);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.cancelled);

    await order.save();

    msg.ack();
  }
}
