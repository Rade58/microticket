import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

// EVO UVOZIM POMENUTI FILE, NARAVNO RELATIVNO TO THIS FILE
// DAKLE TI UVEZIS PRVI FILE, ALI OCEKUJES DA CE BITI UVEZENO
// ONO IZ MOCKED ONE-A
import { natsWrapper } from "../../events/nats-wrapper";
// JA CU TO STMAPTI DA BI PROVERIO

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("can be accessed if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "ssdfsdf", price: 442 });

  expect(response.status).toEqual(201);

  expect(response.status).not.toEqual(401);
});

it("it returns an error if invalid 'title' is provided", async () => {
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ title: 16, price: 122 });

  expect(response1.status).toEqual(400);

  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ title: "", price: 122 });

  expect(response2.status).toEqual(400);

  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ price: 122.4 });

  expect(response3.status).toEqual(400);
});
it("it returns an error if invalid 'price' is provided", async () => {
  // OVO DEFINISEM
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ title: "nebula", price: -16 });

  expect(response1.status).toEqual(400);

  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ title: "nebula", price: 0 });

  expect(response2.status).toEqual(400);

  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "nebula" });

  expect(response3.status).toEqual(400);
});

it("it creates ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({
      // BITNO JE STA CES SLATI
      title: "Some event",
      price: 408,
      userId: "assf6sdgdfh4564",
    });

  expect(response.status).toEqual(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);

  expect(tickets[0].price).toEqual(408);
  expect(tickets[0].title).toEqual("Some event");
});

it("publishes an event", async () => {
  // PRVO CEMO KREIRATI NOVI TICKET
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "nebula", price: 69 })
    .expect(201);

  // A STAMPACEMO ONAJ IMPORT
  // DA TI POKAZEM DA CE SE STAMPATI MOCK MODUL
  // UMESTO THE REAL ONE
  console.log(natsWrapper);
  //
});
