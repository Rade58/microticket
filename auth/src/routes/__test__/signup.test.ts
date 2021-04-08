// OVO CE MI OMOGUCITI DA FAKE-UJEM REQUEST TO THE EXPRESS APP
import request from "supertest";
import { app } from "../../app";

// OVO PRVO JE DESCRIPTIO ZA TEST, A ZADAJES I CALLBACK
it("returns 201 on successful signup", async () => {
  // ZELIMO DA TESTIRAMO SLANJE REQUESTA DO ZADATOG ROUTE-A,
  // SA ZADATIM HTTP METHOD-OM
  // TO NAM OMOGUCAVA supertest
  return (
    request(app)
      .post("/api/users/signup")
      // ZATIM ZELIMO DA SEND-UJEMO SLEDECE
      .send({
        email: "stvros@test.com",
        password: "AdamIsCoolBird6",
      })
      // CHAIN-UJEMO DALJE
      // OVO SU ASSERTIONS (TVRDNJE) ABOUT THE RESPONSE
      // OCEKUJEMO DAKLE STATUS CODE 201
      .expect(201)
  );
});
