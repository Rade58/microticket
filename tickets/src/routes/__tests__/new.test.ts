import request from "supertest";
import { app } from "../../app";

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
    .send({});

  expect(response.status).toEqual(201);

  expect(response.status).not.toEqual(401);
});

// ---------------------------------------------------------
it("it returns an error if invalid 'title' is provided", async () => {
  // OVO DEFINISEM , I NE ZABORAVLJAM COOKIE
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // title TREBA DA BUDE STRING ,A JA NAMERNO UBACUJEM POGRESNO
    .send({ title: 16, price: "200" });

  expect(response1.status).toEqual(400);

  // MOZEMO DA TESTIRAMO SLUCAJ SA EMPTY STRINGOM, JER NI TO NE TREBA DA BUDE VALIDNO
  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // PODESAVAMO "" ZA title
    .send({ title: "", price: "200" });

  expect(response2.status).toEqual(400);

  // OVDE PRAVIM TEST ZA MISSING FIELD title
  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ price: "200" });

  expect(response3.status).toEqual(400);
});
it("it returns an error if invalid 'price' is provided", async () => {
  // OVO DEFINISEM
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // price ISTO TREBA DA BUDE STRING, A JA NAMERNO GRESIM
    .send({ title: "nebula", price: 16 });

  expect(response1.status).toEqual(400);

  // PODESAVAMO I ZA SLUCAJ DA JE price EMPTY STRING
  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // price ISTO TREBA DA BUDE STRING, A JA NAMERNO GRESIM
    .send({ title: "nebula", price: "" });

  expect(response2.status).toEqual(400);


  // PRAVIM TEST ZA MISSING FIELD price
  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // price ISTO TREBA DA BUDE STRING, A JA NAMERNO GRESIM
    .send({ title: "nebula" });

  expect(response3.status).toEqual(400);
});
// ----------------------------------------------------------

it("it creates ticket with valid inputs", async () => {});
