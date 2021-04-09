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
