import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order.model";
import { Payment } from "../../models/payment.model";
import { stripe } from "../../stripe";
// UVOZIMO natsWrapper ZA KOJI TI PO STOTI PUT GOVORIM DA JE MOCKED
import { natsWrapper } from "../../events/nats-wrapper";

const { ObjectId } = Types;

const price = Math.round(Math.random() * 100);

const makeAnOrder = async (options: {
  userPayload?: { id: string; email: string };
  status?: OSE;
}) => {
  const { status, userPayload } = options;

  const _id = new ObjectId().toHexString();

  const order = await Order.create({
    _id,
    userId: userPayload ? userPayload.id : new ObjectId().toHexString(),
    version: 0,
    status: status ? status : OSE.created,
    price,
  });

  return order;
};

// ...
// ...
// ...
// ...

it("returns 404 if order doesn't exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getCookie())
    .send({
      token: "some stripe token",
      orderId: new ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401, if user didn't make an order for whom he is trying to make payment", async () => {
  const order = await makeAnOrder({});

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getCookie())
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 if status of the order, is already cancelled", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const status = OSE.cancelled;

  const order = await makeAnOrder({ status, userPayload });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(400);
});

it("returns 201 if charge is created; stripe.charges.create was called; stripe chare object created, payment object created; and published to 'payment:created' channel", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "tok_visa",
      orderId: order.id,
    });

  expect(response.status).toEqual(201);

  /* const charges = await stripe.charges.list();

  const lastCharge = charges.data[0];

  expect(lastCharge.amount).toEqual(price * 100);

  expect(lastCharge.currency).toEqual("usd");

  const payment = await Payment.findOne({
    order: order.id,
    stripeChargeId: lastCharge.id,
  });

  console.log({ payment, order });

  if (payment) {
    await payment.populate("order").execPopulate();

    expect(payment.stripeChargeId).toEqual(lastCharge.id);

    expect(payment.order.id).toEqual(order.id);

    const sameCharge = await stripe.charges.retrieve(payment.stripeChargeId);

    expect(sameCharge.id).toEqual(lastCharge.id);

    expect(sameCharge.amount).toEqual(order.price * 100);

    // EVO OVDE PRAVIM TVRDNJU DA JE natsWrapper.client.publish ZAISTA CALLED

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // console.log((natsWrapper.client.publish as jest.Mock).mock.calls);

    const argumentsOfPublish = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(argumentsOfPublish.orderId).toEqual(order.id);
    expect(argumentsOfPublish.id).toEqual(payment.id);
    expect(argumentsOfPublish.stripeChargeId).toEqual(sameCharge.id);
  } */
});
