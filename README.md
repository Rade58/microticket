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

- `cat auth/src/routes/__test__/current-user.test.ts`

```ts
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
```

**MOZES DA NAPISES BOLJI TEST SADA, U KOJEM CES EXPECT-OVATI, UPRAVO TE PODATKE**

- `code auth/src/routes/__test__/current-user.test.ts`

```ts
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

```

I TEST JE PASS-OVAO

U SLEDECEM BRANCH-U CU DEFINISATI DA SE GORNJA COOKIE TEST LOGIKA MOZE REUSE-OVATI, ODNOSNO DA NAPRAVIM JEDNU FUNKCIJU, KOJA CE SE SASTOJATI OD SUPERTEST SIGNUP REQUESTA, OBTAINING-A COOKIE-A SA TOG REQUEST-A, ZATIM PROVIDE-OVANJA COOKIE-E TO THE FOLLOWUP REQUEST

**TO CU URADITI JER CU U BUDUCNOSTI POMENUTO KORISTITI KADA BUDEM TESTIRAO DRUGE MICROSERVICE-OVE**

**JER TI MOZES IMATI MICROSERVICE KOJI CE ZAHTEAVTI DA KORISNIK BUDE SIGNED IN, I TI NECES MOCI TESTIRATI USPESNO RTAJ MICROSERVICE, A DA NISI OBEZBEDIO TO COOKIE LOGIKU, JER UNUTAR COOKIE JA JE {jwt} (JSON WEB TOKEN)**
