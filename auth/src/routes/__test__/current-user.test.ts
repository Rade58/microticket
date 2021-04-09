import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  const signUpResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const setCookieHeader = signUpResponse.get("Set-Cookie");

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", setCookieHeader)
    .send()
    .expect(200);

  // EVO DODAJEM OVO, USTVARI (ASSERT-UJEM TACNO DA JE TO ONAJ MAIL SA KOJIM JE OBAVLJEN SIGNING UP)

  expect(response.body.currentUser.email).toEqual("stavros@mail.com");
});
