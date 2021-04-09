# TESTING AROUND SIGNIN FUNCTIONALITY; TESTING AROUND SIGNIN FUNCTIONALITY

OVO CE BITI TESTOVI, NISTA DRUGACIJI OD ONIH KOJE SAM SPROVEO ZA SIGNUP FUNCTIONALITY

# NAPRAVICU NOVI FILE ZA TESTIRANJE signin ROUTE-A

PRE TOGA MOZES DA OTVORIS `auth/src/routes/signin.ts` I DA VIDIS STA TO MOZES DA TESTIRAS

MOZS DA TESTIRAS VALIDNOST EMAIL-A I PASSWORDA, ZATIM DA LI CE SE TRHROW-OVATI ERROR, AKO USER SA DATIM EMAILOM NE POSTOJI, ZATIM MOZES TESTIRATI DA CE SE THROW-OVATI ERROR, AKO NEMA MATCHING PASSWORD-A; ONDA MOZES TESTIRATI DA LI CE U RESPONSE-U BITI DEFINED 'Set-Cookie' HEADER

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

- `cd auth` `yarn test` (AKO SI UGASIO TESTIRANJE POKRENI PONOVO)

I TEST JE PROSAO
