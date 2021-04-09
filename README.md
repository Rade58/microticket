# TESTING /current-user ROUTE HANDLER

LAST ROUTE HANDLER KOJI TREBA DA TESTIRAMO

OVDE CU ENCOUNTER-OVATI SOME ISSUES, ALI TO CE IMATI FAR REACHING IMMPACT NA NEKE TESTOVE KOJE CEMO KASNIJE PISATI ZA NEKE DRUGE MICROSERVICES

- `touch auth/src/routes/__test__/current-user.test.ts`

```ts
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

  // OVDE OCEKUJEMO 200 SSTATUS KADA GET-UJEMO CURRENT USER-A
  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);

  // SADA DAKLE DAT O USER-U TREBA DA SE NALAZE NA body-JU
  // STAMPACU GA CITO DA VIDIM
  console.log(response.body);
});
```

TEST JE PASS-OVAO ALI TO NIJE POENTA, U TOME NIJE PROBLEM

PROBLEM JE TO STO SE OVO STAMPALO

```json
{ currentUser: null }
```

OCIGLEDNO JE DA `"Cookie"` HEADER NIJE DOSAO SA REQUEST-OM

**ALI TEST NIJE BROWSER, ON NEMA MOC DA AUTOMATSKI SALJE "Cookie" HEADER, KAO STO TO RADI BROWSER PREMA SAME DOMAIN-U, KADA ALJE FOLLOW UP REQUESTS (TEST NEMA PREDSTAVU O DOMENU)**
