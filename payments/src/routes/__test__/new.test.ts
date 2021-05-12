import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// UVOZIM POMENUTO
import { stripe } from "../../stripe";
//

const { ObjectId } = Types;

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

// A DOLE NA DNU CU DA PRAVIM NOVI TEST
// U KOJEM CU DA NAPRAVIM ASSERTION O TOME DA JE

// OSTLE TESTOVE KOJE SAM RANIJE PRAVIO
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

// SAMO POPRAVLJAM USTVARI OVAJ TEST, TAKO STO CU NAPRAVITI
// EXPECTATION DA JE MOCK USTVARI CALLED
it("returns 201 if charge is created; stripe.charges.create was called", async () => {
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

  // EVO GA TAJ EXPECTATION
  expect(stripe.charges.create).toHaveBeenCalled();
});
