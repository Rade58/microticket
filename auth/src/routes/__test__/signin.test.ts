import request from "supertest";
import { app } from "../../app";

it("returns 200 on successful signin; return 400 on non existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(200);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "stavi@mail.com", password: "Someoncool55" })
    .expect(400);
});

// --------

it("returns 400 if password is empty string", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "siann@mail.com", password: "" })
    .expect(400);
});
