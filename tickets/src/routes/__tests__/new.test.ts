import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {});
it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});
