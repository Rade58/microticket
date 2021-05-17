import {
  Listener,
  PaymentCreatedEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { orders_microservice } from "../queue_groups";

export class PaymentCreatedListener extends Listener<PaymentCreatedEventI> {
  channelName: CNE.payment_created;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.payment_created;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, PaymentCreatedListener.prototype);
  }

  async onMessage(parsedData: PaymentCreatedEventI["data"], msg: Message) {
    const { orderId } = parsedData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.complete);

    await order.save();

    msg.ack();
  }
}
