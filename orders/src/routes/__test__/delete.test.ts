import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

const { ObjectId } = Types;

// ...
// ...

import { natsWrapper } from "../../events/nats-wrapper";
import { Order } from "../../models/order.model";

// ...
// ...

// HELPERI
const createOrders = async (
  ticketIds: number[],
  numOfOrders: number,
  cookie: string[]
) => {
  const orderIds = [];

  // CREATING SOME ORDERS
  for (let i = 0; i < numOfOrders; i++) {
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticketIds[i] });

    orderIds.push(response.body.id);
  }

  return orderIds;
};

const createTickets = async (num: number) => {
  //
  const ticketIds = [];

  for (let i = 0; i < num; i++) {
    const ticket = await Ticket.create({
      price: 69,
      title: "tooll band",
    });

    ticketIds.push(ticket.id);
  }

  return ticketIds;
};
// ---------------------------------------------------

it("returns 201 if order is cancelled, and making sure that status field is really 'cancelled'", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  // CANCELLING

  const response = await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response.status).toEqual(200);

  // PROVERAVAM populate
  expect(response.body.ticket.price).toBeTruthy();

  // PROVEVAM status
  expect(response.body.status).toEqual(OSE.cancelled);

  // JOS BOLJA POTVRDA DA JE status, SADA cancelled
  const response2 = await request(app)
    .get(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response2.body.status).toEqual(OSE.cancelled);
});

it("it returns 404 if there is no order for provided id", async () => {
  await request(app)
    .get(`/api/orders/${ObjectId()}`)
    .set("Cookie", global.getCookie())
    .send()
    .expect(404);
});

it("returns 401 if user is wanting to cancel order, not belonging to him", async () => {
  // USER ONE
  const cookie1 = global.getCookie();
  // USER TWO
  const cookie2 = global.getOtherCookie({
    email: "stavroscool@stavros.com",
    id: "adasfsfsdsdg",
  });

  // CREATING TICKETS

  const ticketIds = await createTickets(1);

  // CREATING ORDERS
  const orderIds = await createOrders(ticketIds, 1, cookie1);

  await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    // OTHER USER IS TRYING TO CANCEL AN ORDER OF ANOTHER USER
    .set("Cookie", cookie2)
    .send()
    .expect(401);
});

it("returns 400 if order id is not valid mongodb id", async () => {
  await request(app)
    // STAVICU OVDE NAVALIDAN ID
    .patch("/api/orders/124ab")
    .set("Cookie", global.getCookie())
    .send()
    .expect(400);
});

it("publishes order:cancelled event", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  // ------------

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("'version' field is on Ticket document and Order document; and it is being incremented when upating document", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(1);

  const orderIds = await createOrders(ticketIds, 1, cookie);

  // CANCELLING

  const response = await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response.body.version).toBeDefined();
  // 1 ZATO TO JE PRI KREIRANJU BILO 0, A UPDATINGOM JE POSTALO 1
  expect(response.body.version).toEqual(1);

  const order = await Order.findOne({ _id: orderIds[0] });

  if (order) {
    order.set("status", OSE.awaiting_payment);
    await order.save();

    // OVD BI TEBAL ODA BUDE 2
    expect(order.version).toEqual(2);
  }

  const ticket = await Ticket.findOne({ _id: ticketIds[0] });

  // SAD PROVERAVAMO version I ZA Ticket DOKUMENT
  if (ticket) {
    expect(ticket.version).toBeDefined();
    expect(ticket.version).toEqual(0);

    ticket.set("price", 208);

    await ticket.save();

    expect(ticket.version).toEqual(1);

    ticket.set("title", "Tool is the band");

    await ticket.save();

    expect(ticket.version).toEqual(2);
  }
});
