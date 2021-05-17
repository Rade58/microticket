import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stvros@test.com",
      password: "AdamIsCoolBird6",
    })
    .expect(201);
});

it("returns 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something",
      password: "AdamIsCoolBird6",
    })
    .expect(400);
});

it("returns 400 on invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stavvy@mail.com",
      password: "me",
    })
    .expect(400);
});

// -------

it("returns 400 on invalid email and password, or when email and password are missing", async () => {
  // EVO OVDE await
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "",
      password: "",
    })
    .expect(400);

  // A OVDDE return
  return request(app)
    .post("/api/users/signup")
    .send({
      // email: "",
      // password: "",
    })
    .expect(400);
});

it("returns 400 if u try to create user with a existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "nickmullen@comedy.com", password: "Sammich284" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "nickmullen@comedy.com", password: "Sammich284" })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  // PRVO PRVIMO SIGNAUP
  // ODNOSNO TESTIRAMO PRVLJANJE NOVOG USERA, I OCEKUSEMO STATUS CODE 201
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "ian@mail.com",
      password: "JonTheKingzly6",
    })
    .expect(201);

  // ALI KAO STO SI VIDEO CEO GORNJI CALL ETURN-UJE RESPONE
  // TAKO DA GA MOZEMO INSPECT-OVATI DA VIDIMO DA LI JE NA NJEMU COOKIE
  // DAKLE OCEKUJEMO DA "Set-Cookie" HEADER RESPONSE OBJEKTA BUDE DEFINED
  expect(response.get("Set-Cookie")).toBeDefined();
});
