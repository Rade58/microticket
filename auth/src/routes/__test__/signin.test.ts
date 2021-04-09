import request from "supertest";
import { app } from "../../app";

it("returns 200 on successful signin", async () => {
  // PRVO MORAMO NAPRAVITI USERA (signup)
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    // MORAMO POSLATI ISTI email I password KAO ABOVE
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" });
});
