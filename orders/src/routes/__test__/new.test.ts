import request from "supertest";
import { app } from "../../app";
// MORACEMO MANUELNO DA NAPRAVIMO TICKET, ZATO CE NAM TREBATI
// Ticket MODEL
import { Ticket } from "../../models/ticket.model";

it("returns 201 if ticket exists", async () => {
  // PRVO MORAMO KREIRATI TICKET
  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  // console.log(ticketResponse);
  //
  const ticketId = ticket.id;
  const cookie = global.getCookie();
  console.log({ ticketId, cookie });
  //
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId,
    })
    .expect(201);
});
