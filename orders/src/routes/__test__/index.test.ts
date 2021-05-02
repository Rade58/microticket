import request from "supertest";
import { app } from "../../app";
// OVO UZIMAM JER CU ZELETI DA NAPRAVIM NEKOLIKO TICKETA
import { Ticket } from "../../models/ticket.model";
//
// ZELIM I

// NAPRAVICU HELPER, KOJI CE DA KREIRA MULTIPLE TICKETS
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
//
// NAPRAVICU I HELPERA KOJ ICE DA KREIRA ORDERS
const createOrders = async (
  ticketIds: number[],
  numOfOrders: number,
  cookie: string[]
) => {
  // CREATING SOME ORDERS
  for (let i = 0; i < numOfOrders; i++) {
    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticketIds[i] });
  }
};

//
it("returns 200, and returns empty array if no orders for the user", async () => {
  await request(app)
    .get("/api/orders")
    .set("Cookie", global.getCookie())
    .send()
    .expect(200);
});

// OVDE CU KORISTITI HELPERA
it("returns 200, returns full array of orders for the user ", async () => {
  // CREATING TICKETS
  const ticketIds = await createTickets(18);

  // ONE USER
  const cookie1 = global.getCookie();
  // SECOND USER
  const cookie2 = global.getOtherCookie({
    id: "sfdsgdsg",
    email: "cooladam@mail.com",
  });

  // CREATING ORDERS FOR ONE USER (8 ORDERS)
  await createOrders(ticketIds, 8, cookie1);

  ticketIds.reverse(); // OVO RADIM SAMO ZBOG USTEDE VREMENA (OVO TRJNO MNJA NIZ)

  // CREATING ORDERS FOR SECOND USER
  await createOrders(ticketIds, 10, cookie2);

  ticketIds.reverse();
  //

  // --------------------------------
  // GETTING ALL ORDERS FOR THE USER

  const response1 = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie1)
    .send();

  expect(response1.status).toEqual(200);

  // PROVERAVAM DA U body-JU IMA VISE OD JEDNOG OBJEKTA
  // USTVARI TREBA DA IH IMA TACNO 8

  expect(response1.body.length).toEqual(8);

  // ----------------------------------
  // GETTING ALL ORDERS FOR SECOND USER

  const response2 = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie2)
    .send();

  expect(response2.status).toEqual(200);

  expect(response2.body.length).toEqual(10);

  // MOGU DA NAPRAVIM EXPECTATIONS U VEZI VREDNOSTI

  expect(response1.body[0].ticket.id).toEqual(ticketIds[0]);
});
