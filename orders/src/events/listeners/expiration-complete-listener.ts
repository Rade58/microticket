import {
  Listener,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { orders_microservice } from "../queue_groups";
import { Order } from "../../models/order.model";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEventI> {
  channelName: CNE.expiration_complete;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.expiration_complete;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, ExpirationCompleteListener.prototype);
  }

  async onMessage(parsedData: ExpirationCompleteEventI["data"], msg: Message) {
    const { orderId } = parsedData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.cancelled);

    await order.save();

    // PRAVIMO REQUERY
    const sameOrder = await Order.findById(order.id).populate("ticket").exec();

    if (sameOrder) {
      // KORISTIMO REQUERIED DATA
      await new OrderCancelledPublisher(this.stanClient).publish({
        id: sameOrder.id,
        version: sameOrder.version,
        ticket: {
          id: sameOrder.ticket.id,
        },
      });
    }

    msg.ack();
  }
}
