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

  const setCookieHeader = signUpResponse.get("Set-Cookie");

  */
  // UPOTREBLJAVAM GLOBALNU FUNKCIJU

  const { cookie } = await global.makeRequestAndTakeCookie();

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  console.log(response.body);
});
