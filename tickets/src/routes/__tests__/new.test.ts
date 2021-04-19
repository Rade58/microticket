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

// -------------------------------
it("can be accessed if user is signed in", async () => {
  // FUNKCIJA JE DOSTUPNA GLOBLNO, I NE MORAS DA JE UVOZIS
  // ALI JE KORISTIS SA global OBJECT-A

  const response = await request(app)
    .post("/api/tickets")
    // EVO
    .set("Cookie", global.getCookie())
    //
    .send({});

  expect(response.status).toEqual(201);
});
// --------------------------------

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});
