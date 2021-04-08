# OUR FIRST TEST

U PROSLOM BRANCH-U SAM DEFINISAO JEST HOOKS, KOJI CE MI POMOCI DA PRE POKREATNAJA TEST-OVA SPINN-UJEM IN MEMORY MONGO DATABASE, ATIM KONEKTUJEM MONGOOSE, ZATIM DA IZMEDJU INDIVIDUAL TESTOVA TAJ DATBASE BUDE WIPED, A KADA SE ZAVRSI SA TESTIRANJEM DA SE DATABASE SERVER ZAUSTAVI, A DA SE MONGOOSE DISKONEKTUJE (SVE SAM TO DEFINISAO U `auth/src/test/setup.ts` (A SCRIPTS I jest BLOK SAM DEFINISAO U `package.json`-U))

SAD CU DA NAPISEM MOJ PRVI TEST

## TEST KOJI PRAVIM BICE AROUND OUR `/signup` HANDLER

PRAVIM PRVO FOLDER `__test__` U ISTOM FOLDERU GDE SE NALAZW HANDLERI ,I TO JE KONVENCIJA DA SE PORED ONOG FILE-A KOJEG TESTIRAS NALAZI POMENUTI FOLDER

- `mkdir auth/src/routes/__test__`

**A FILE KOJI SE KREIRA U TOM FOLDERU IMA ISTO IME KAO FILE KOJI SE TESTIRA; ALI SA DODATOM `.test` EKSTENZIJOM**

- `touch auth/src/routes/__test__/signup.test.ts`

```ts
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
```

I TO JE SVE STO SAM TREBAO NAPISATI ZA JEDAN BASIC I STRAIGHT FORWARD TEST

async SAM KORISTIO GORE KAO HABIT, JER CES TI U BUDUCNOSTI POKUSATI DA RADIS MULTIPLE REQUEST IN SINGLE TEST I ZATO CES KORISTIT Iawait

## SADA CEMO DA RUNN-UJEMO NAS PRVI TEST

- `cd auth`

- `yarn test`
