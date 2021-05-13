import request from "supertest";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Types } from "mongoose";
import { app } from "../../app";

import { Order } from "../../models/order.model";

// UVOZIM NASU stripe INSTANCU
// KOJU CU D AKORISTIM U TESTU
import { stripe } from "../../stripe";
// ---------------------------------

const { ObjectId } = Types;

// ALI OVOG PUTA CU DA RANDOMLY GENERISEM price
const price = Math.round(Math.random() * 100);
// A VIDECES I ZASTO

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

// --------
it("returns 201 if charge is created; stripe.charges.create was called", async () => {
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

  // DAKLE NAPRAVILI SMO JEDAN CHARGE
  // KAO I RANIJE
  // I HANDLER BI TREBAO DA POSALJE 201 STATUS
  expect(response.status).toEqual(201);

  // EVO UZIMAMO LISTU CHARGE-VA
  const charges = await stripe.charges.list();

  // DOBICU USTVARI OBJEKAT, U KOJEM JE LISTA U
  // data PROPERTIJU

  // console.log({ charges: charges.data });

  const lastCharge = charges.data[0];

  // POSTO MI JE price U DOLARIMA, A DOBICU NAZAD CENTS
  // MNOZIM SA 100
  expect(lastCharge.amount).toEqual(price * 100);

  // MOGU DA PRAVIM EXPECTATION I ZA currency
  expect(lastCharge.currency).toEqual("usd");
});
