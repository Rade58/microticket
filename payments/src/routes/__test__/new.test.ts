import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order.model";
// UVESCEMO I Payment MODEL
import { Payment } from "../../models/payment.model";
//
import { stripe } from "../../stripe";

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

// NEM ARAZLOGA DA PRAVIM NOVI TEST, SAMO CU OVAJ TEST PROSIRITI
it("returns 201 if charge is created; stripe.charges.create was called; stripe chare object created, and payment object created", async () => {
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

  const charges = await stripe.charges.list();

  const lastCharge = charges.data[0];

  expect(lastCharge.amount).toEqual(price * 100);

  expect(lastCharge.currency).toEqual("usd");

  // MOZEMO DA PROBAMO DA UZMEMO Payment DOKUMRNT
  // PREMA ORDER ID-JU

  const payment = await Payment.findOne({ order: order.id });

  console.log({ payment });

  if (payment) {
    //
  }
});
