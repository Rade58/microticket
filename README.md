# TESTING AROUND SIGNIN FUNCTIONALITY; TESTING AROUND SIGNIN FUNCTIONALITY

OVO CE BITI TESTOVI, NISTA DRUGACIJI OD ONIH KOJE SAM SPROVEO ZA SIGNUP FUNCTIONALITY

# NAPRAVICU NOVI FILE ZA TESTIRANJE signin ROUTE-A

PRE TOGA MOZES DA OTVORIS `auth/src/routes/signin.ts` I DA VIDIS STA TO MOZES DA TESTIRAS

MOZS DA TESTIRAS VALIDNOST EMAIL-A I PASSWORDA (NEMAS NEKI REQUIREMENT Z PASSWORD SEM DA NIJE EMPTY STRING), ZATIM DA LI CE SE TRHROW-OVATI ERROR, AKO USER SA DATIM EMAILOM NE POSTOJI, ZATIM MOZES TESTIRATI DA CE SE THROW-OVATI ERROR, AKO NEMA MATCHING PASSWORD-A; ONDA MOZES TESTIRATI DA LI CE U RESPONSE-U BITI DEFINED 'Set-Cookie' HEADER

DA KREIRAM FAJL I POCNEM SA PISANJEM TESTOVA

- `touch auth/src/routes/__test__/signin.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

// EVO OVO JE PRVI TEST
it("returns 200 on successful signin", async () => {
  // PRVO MORAMO NAPRAVITI USERA (signup)
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    // MORAMO POSLATI ISTI email I password KAO ABOVE
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(200);
});

```

ZELIM DA PROVERIM DA L ICE SVE FUNKCIONISATI

POKRECEM TEST

- `cd auth` `yarn test` (AKO SI UGASIO TESTIRANJE POKRENI PONOVO)

I TEST JE PROSAO

NASTAVLJAM SADA SA KREIRANJEM TESTOVA SA signin

- `code auth/src/routes/__test__/signin.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

// DODAO SAM OVDE I DESCRIPTIO NDA CU TESTIRATI I SLANJE
// REQUESTA ZA NON EXISTING email
it("returns 200 on successful signin; return 400 on non existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(200);

  // EVO DODAJEM TEST ZA TO DA SE OCEKUJE 400 STATUS CODE
  // KADA SE REQUEST-UJE NON EXISTING USER
  await request(app)
    .post("/api/users/signin")
    .send({ email: "stavi@mail.com", password: "Someoncool55" })
    .expect(400);
});

```

I I DALJE OVAJ TEST PASS-UJE

**SADA CU URADITI TEST ZA INVALID PASSWORD (IMJ NA UMU DA JE ZA signin ROUTE, INVALID PASSWORD SAMO EMPTY STRING)**

- `code auth/src/routes/__test__/signin.test.ts`

```ts
// ...

it("returns 400 if password is empty string", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "georgelopez@mail.com", password: "RookieSinger1" })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({ email: "georgelopez@mail.com", password: "" })
    .expect(400);
});


```

TEST JE PASS-OVAO

**SADA TESTIRAM TO DA LI CU IMATI COOKIE U RESPONSE-U**

- `code auth/src/routes/__test__/signin.test.ts`

```ts
// ....

it("response has a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "stavros@mail.com", password: "RookieSinger1" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    // MORAS OBEZBEDITI VALID CREDENTIALS
    .send({ email: "stavros@mail.com", password: "RookieSinger1" })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});

```

TEST JE PASS-OVAO

# SADA CU DA TESTIRAM `/signout` ROUTE HANDLER

POGLEDAJ KAKO IZGLEDA POMENUTI HANDLER (`auth/src/routes/signout.ts`)

OVDE MOGU NAPISATI TEST, ODNOSNO DEFINISATI ASSERTION DA NE OCEKUJEM COOKIE U RESPONSE-U, JER JE ULOGA OVOG HANDLER-A DA CLEAR-UJE TAJ COOKIE

- `touch auth/src/routes/__test__/signout.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("response shouldn't have cookie on it", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "louis@mail.com", password: "PortoSomeone66" })
    .expect(201);

  const response = await request(app)
    .get("/api/users/signout")
    .send()
    .expect(200);

  expect(response.get("Set-Cookie")).toBeUndefined();
});

```

TEST CE TI FAIL-OVATI SAM OZBOG POSLEDNJEG LINE-A, JER VREDNOST COOKIE NIJEE KOMPLETNO UNDEFINED

ZATO UMESTO ZADNJEG LINE-MI CEMO STAMPATI EZULTATI COOKIEA

- `touch auth/src/routes/__test__/signout.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("response shouldn't have cookie on it", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "louis@mail.com", password: "PortoSomeone66" })
    .expect(201);

  const response = await request(app)
    .get("/api/users/signout")
    .send()
    .expect(200);

  // expect(response.get("Set-Cookie")).toBeUndefined();
  // EVO UMESTO expect SAMO SAM PRINT-OVAO VREDNOST COOKIEA
  console.log(response.get("Set-Cookie"));
});

```

U TERMINALUU CES VIDETI DA JE OVO VREDNOT COOKIE-A

```zsh
  [
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  ]

```

USTVARI DOBIJE SE EMPTY SESSION

TEST JE PASS-OVAO, ALI TI MOZES DA STAVIS GORNJI NIZ U EXPECTATION ,KAKO BI MOZDA IMAO JACU POTVRDU (IAK OZNAS I TI DA JE SVE OK)

OVAKO

```ts
import request from "supertest";
import { app } from "../../app";

it("response shouldn't have cookie on it", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "louis@mail.com", password: "PortoSomeone66" })
    .expect(201);

  const response = await request(app)
    .get("/api/users/signout")
    .send()
    .expect(200);

  // EVO VIDIS
  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});

```

NARAVNO TEST CE I DALJE PROCI





