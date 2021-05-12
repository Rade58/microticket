import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

const { ObjectId } = Types;

// HELPER
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
    price: 69,
  });

  return order;
};

// DAKLE SVI ASSERTIONI KOJE CU SADA NAPRAVITI, BICE SA FAILING CASE-OVE
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

it("returns 401, if user didn't make an order", async () => {
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

// OVO CE BITI TEST ZA SUCCESS, KOJI MOGU OVDE POCETI
// A NARAVNO MENJACU GA NARAVNO JER NISAM IMPLEMENTIRAO
// SVE INSIDE HANDLER FOR CHARGE CREATING

it("returns 201 if charge is created", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "some stripe token",
      orderId: order.id,
    })
    .expect(201);
});
