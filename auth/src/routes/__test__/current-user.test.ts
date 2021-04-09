import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  // UMESTO OVOGA

  /* const signUpResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const setCookieHeader = signUpResponse.get("Set-Cookie"); */

  const setCookieHeader = await global.signup();

  console.log({ setCookieHeader });

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", setCookieHeader)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("stavros@mail.com");
});
