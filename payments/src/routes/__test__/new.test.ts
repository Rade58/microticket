import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// OVO VISE NE KORISTIS OVAKO, JER OVO JE SLUZILO
// RANIJE DA SE UVEZE MOCK
// import { stripe } from "../../stripe";
//

const { ObjectId } = Types;

const price = 69;

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

// --------
it("returns 201 if charge is created; stripe.charges.create was called", async () => {
  const userPayload = {
    id: new ObjectId().toHexString(),
    email: "stavros@mail.com",
  };

  const order = await makeAnOrder({ userPayload });

  // OVO MOZEMO SADA DA STAVIMO U VARIJABLU
  // VIDECES KASNIJE ZASTO SAM TO URADIO
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.getOtherCookie(userPayload))
    .send({
      token: "tok_visa",
      orderId: order.id,
    });

  // I NE OCEKUJEM NIKAKAV ERROREUS RESPONSE
  // STO ZNACI DA CE SE CHARGE USPENO KREIRATI
  expect(response.status).toEqual(201);

  // OVO VISE NIJE RELEVANTNO
  /* expect(stripe.charges.create).toHaveBeenCalled();

  expect((stripe.charges.create as jest.Mock).mock.calls[0][0].source).toEqual(
    "tok_visa"
  );
  expect(
    (stripe.charges.create as jest.Mock).mock.calls[0][0].currency
  ).toEqual("usd");
  expect((stripe.charges.create as jest.Mock).mock.calls[0][0].amount).toEqual(
    price * 100
  ); */
});
