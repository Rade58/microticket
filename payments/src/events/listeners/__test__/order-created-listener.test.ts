import { OrderCreatedEventI, OrderStatusEnum as OSE } from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../nats-wrapper"; // ovo je mock, iako uvozis original
import { Order } from "../../../models/order.model";

const { ObjectId } = Types;

const setup = async () => {
  const parsedData: OrderCreatedEventI["data"] = {
    id: new ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    status: OSE.created,
    version: 0,
    userId: new ObjectId().toHexString(),
    ticket: {
      id: new ObjectId().toHexString(),
      price: 69,
    },
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCreatedListener(natsWrapper.client);

  return { listener, parsedData, msg };
};

it("creates replicated Order inside Orders collection inside 'payments' microservices; and calls ack", async () => {
  const { listener, parsedData, msg } = await setup();

  await listener.onMessage(parsedData, msg);

  // PROVERAVAM DA LI JE ORDER CREATED

  const order = await Order.findById(parsedData.id);

  console.log({ order });

  if (order) {
    expect(order.id).toEqual(parsedData.id);

    expect(order.version).toEqual(0);
  }

  expect(msg.ack).toHaveBeenCalled();
});
