import {
  OrderCancelledEventI,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../nats-wrapper"; // ovo je mock, iako uvozis original
import { Order, OrderDocumentI } from "../../../models/order.model";

const { ObjectId } = Types;

const setup = async (order?: OrderDocumentI) => {
  // CREATING ORDER

  const parsedData: OrderCancelledEventI["data"] = {
    id: order ? order.id : new ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: new ObjectId().toHexString(),
    },
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCancelledListener(natsWrapper.client);

  return { listener, parsedData, msg };
};

// ASSERTIONS

it("updates status of the replicated Order, to be cancelled; ack was called", async () => {
  // CREATING An ORDER

  const order = await Order.create({
    _id: new ObjectId().toHexString(),
    status: OSE.created,
    userId: new ObjectId().toHexString(),
    price: 420,
  });

  const { listener, parsedData, msg } = await setup(order);

  await listener.onMessage(parsedData, msg);

  // REQUERYING THE ORDER

  const sameOrder = await Order.findById(order.id);

  console.log({ sameOrder });

  if (sameOrder) {
    expect(sameOrder.status).toEqual(OSE.cancelled);
  }

  expect(msg.ack).toHaveBeenCalled();
});

// ASSERTION FOR FAIL
it("throws error, if order doesn't exist; ack was never called", async () => {
  const { listener, parsedData, msg } = await setup();

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.error(err);

    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});
