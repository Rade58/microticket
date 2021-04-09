import request from "supertest";

import { app } from "../../app";

// PRVO PRAVIMO TEST, U KOJEM PRAVIM ASSERTION O TOME DA JE USER

it("responds with details about the current user signed in", async () => {
  // PRAVIMO NOVOG USER-A, I TU EXPECT-UJEMO 201
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  // OVDE OCEKUJEMO 200 SSTATUS KADA GET-UJEMO CURRENT USER-A
  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);

  // SADA DAKLE DAT O USER-U TREBA DA SE NALAZE NA body-JU
  // STAMPACU GA CITO DA VIDIM
  console.log(response.body);
});
