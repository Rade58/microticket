# SETTING COOKIES DURING TEST

`"Cookie"` HEADER NE MOZE DOCI SA FOLLOW UP REQUESTOM

**DAKLE TEST NIJE BROWSER, ON NEMA MOC DA AUTOMATSKI SALJE "Cookie" HEADER, KAO STO TO RADI BROWSER PREMA SAME DOMAIN-U, KADA ALJE FOLLOW UP REQUESTS (TEST NEMA PREDSTAVU O DOMENU)**

JA IMAM HANDLER: `auth/src/routes/current-user.ts` I ON USTVARI INIREKTNO (UZ KORISCENJE MIDDLEWARE-A) UZIMA `Cookie` HEADER SA REQUEST-A, SA NJEGOVE VREDNOTI DECODE-UJE JWT, U KOJEM JE PAYLOAD, UZIMA PAYLOAD I SALJE GA U RESPONSE-U

BOG TOGA OVAJ TEST DAJE NEOCEKIVANE REZULTAT

- `cat auth/src/routes/__test__/current-user.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);

  console.log(response.body);  // {currentUser: null}
});
```

# JA CU U TEST ENVIROMENTU MORATI MALO DA BUDEM MANUELNIJI, MORACU DA UZMEM VREDNOST `Set-Cookie` HEDERA SA RESPONSE-A, PRI SIGNINGUP-U; PA CU ONDA PODESITI TU VREDNOST ZA `Cookie` HEADER NA FOLLOW UP REQUEST-U




