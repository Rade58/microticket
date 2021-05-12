import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

const { ObjectId } = Types;

// HELPER
const makeAnOrder = async () => {
  const _id = new ObjectId().toHexString();
  const userId = new ObjectId().toHexString();

  const order = await Order.create({
    _id,
    userId,
    version: 0,
    status: OSE.created,
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
      token: "some token",
      orderId: new ObjectId().toHexString(),
    })
    .expect(404);
});
