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

  await request(app).get("/api/users/current-user").send().expect(200);

  // IAKO MISLIS DA CE OVAJ TEST PROCI POGRESIO SI, JER GORNJI
  // TEST NIJE PROSAO, GORE JE USTVARI TREBAL ODA EXCEPT-UJES
  // STATUS CODE 400

  // expect(response.body).toEqual()
});
