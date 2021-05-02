import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

const { ObjectId } = Types;

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

it("returns 200 if order is obtained by id", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  // GETTING ORDER BY ID

  await request(app)
    .get(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);
});

it("it returns 404 if there is no order for provided id", async () => {
  await request(app)
    .get(`/api/orders/${ObjectId()}`)
    .set("Cookie", global.getCookie())
    .send()
    .expect(404);
});

it("returns 401 if user is asking for order, not belonging to him", async () => {
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
    .get(`/api/orders/${orderIds[0]}`)
    // OTHER USER IS TRYING TO OBTAIN AN ORDER OF ANOTHER USER
    .set("Cookie", cookie2)
    .send()
    .expect(401);
});
