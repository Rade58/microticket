import {
  Listener,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
  // TREBA NAM ENUM ZA STATUS
  OrderStatusEnum as OSE,
  //
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { orders_microservice } from "../queue_groups";
// TREBA NAM Order MODEL
import { Order } from "../../models/order.model";
// TREBA NAM I PUBLISHER
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

    console.log({ order });

    await order.populate("ticket").execPopulate();

    console.log({ order });

    await new OrderCancelledPublisher(this.stanClient).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
