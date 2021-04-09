# INVALID INPUT TEST; REQUIRING UNIQUE MAIL TEST

DAAKLE TESTIRANJE KORISCENJEMM supertest LIBRARY-JA JE KAKO SI TO MOGAO VIDETI U PREDHODNIM BRNCH-EVIMA VEOMA EASY

# SADA TESTIRAM INVALID INPUTE mail-A I password-A

- `code auth/src/routes/__test__/signup.test.ts`

```ts
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

// EVO PRAVIM NOVI TEST

it("returns 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something",
      password: "AdamIsCoolBird6",
    })
    .expect(400);
});

```

STARTUJ TEST AKO GA NEMAS STARTOVANOG OD RANIJE

- `cd auth` `yarn test`

I OVAJ TESSED JE PROSAO

SLAEDECI TEST JE DA SE OCEKUJE 400 STATUS CODE AKO JE password INVALID

```ts
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

// ZA password

it("returns 400 on invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stavvy@mail.com",
      password: "me",
    })
    .expect(400);
});

```

OPET TI NAPOMINJEM DA TI JE TEST U WATCH MODE-U TAKO DA NE MORAS PONOVO DA GA POKRECES, VEC SAMO DA SAVE-UJES FILE I TEST SE SAM POKRECE (**SEM AKO NE BUDES IMAO CUDNI ERROR ZBOG TYPESCRIPT-A, STO SMO GOVORILI U PROSLOM BRANCH-U (TADA MORAS RESTART-OVATI TEST)**)
