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





