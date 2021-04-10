import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  // UMESTO OVOGA
  /*

  const signUpResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const setCookieHeader = signUpResponse.get("Set-Cookie");

  */
  // UPOTREBLJAVAM GLOBALNU FUNKCIJU

  const cookieEmailAndPassword = await global.makeRequestAndTakeCookie();

  console.log({ cookieEmailAndPassword });

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookieEmailAndPassword.cookie)
    .send()
    .expect(200);

  // EVO IAKO MOZDA NIJE PD VELIKE VAZNOSTI PROVERAVAMO MAIL
  expect(response.body.currentUser.email).toEqual(cookieEmailAndPassword.email);

  console.log({ cookieHere: response.get("Set-Cookie") });

  // OVDE PRAVIMO TVRDNJU ZA COOKIE I PROVERAVMO
  // expect(response.get("Set-Cookie")).toEqual(cookieEmailAndPassword.cookie);
});
