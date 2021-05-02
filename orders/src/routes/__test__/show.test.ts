import request from "supertest";
import { app } from "../../app";

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
