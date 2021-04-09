import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  // SADA POSTO SI RESPONSE ASSIGN-OVAO TO VARIABLE, MOZES DA EXTRACT-UJES
  // VREDNOST `Seet-Cookie` HEADER-A

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
    // I OVDE PODESVAM HEADER `Cookie` ,SA EXTRACTED VREDNOSCU
    .set("Cookie", setCookieHeader)
    //
    .send()
    .expect(200);

  console.log(response.body); // OVO CE SADA BITI OBJEKAT
  // U OVOM FORMATU {currentUser: {id, email, iat}}
  // STO CES MOCI DA VIDIS KADA RUNN-UJES TEST
});
