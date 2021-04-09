import request from "supertest";
import { app } from "../../app";

// DODAO SAM OVDE I DESCRIPTIO NDA CU TESTIRATI I SLANJE
// REQUESTA ZA NON EXISTING email
it("returns 200 on successful signin; return 400 on non existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(200);

  // EVO DODAJEM TEST ZA TO DA SE OCEKUJE 400 STATUS CODE
  // KADA SE REQUEST-UJE NON EXISTING USER
  await request(app)
    .post("/api/users/signin")
    .send({ email: "stavi@mail.com", password: "Someoncool55" })
    .expect(400);
});
