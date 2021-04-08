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

**ALI TEST NECE PROCI ,A SVA JE SRECA DA SAM U ERROR HANDLING MIDDLEWARE-U STAMPAO ERROR, PA SAM SAZNAO U CEMU JE GRESKA**

```bash
console.log
    ERROR --> Error: secretOrPrivateKey must have a value
        at Object.<anonymous>.module.exports [as sign] (/home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_micro_ticket/auth/node_modules/jsonwebtoken/sign.js:107:20)
        at /home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_micro_ticket/auth/src/routes/signup.ts:53:21
        at step (/home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_micro_ticket/auth/src/routes/signup.ts:33:23)
        at Object.next (/home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_micro_ticket/auth/src/routes/signup.ts:14:53)
        at fulfilled (/home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_micro_ticket/auth/src/routes/signup.ts:5:58)
        at processTicksAndRejections (internal/process/task_queues.js:93:5)

      at errorHandler (src/middlewares/error-handler.ts:24:11)

 FAIL  src/routes/__test__/signup.test.ts (28.405 s)
  ✕ returns 201 on successful signup (451 ms)

  ● returns 201 on successful signup

    expected 201 "Created", got 400 "Bad Request"

      19 |       // OVO SU ASSERTIONS (TVRDNJE) ABOUT THE RESPONSE
      20 |       // OCEKUJEMO DAKLE STATUS CODE 201
    > 21 |       .expect(201)
         |        ^
      22 |   );
      23 | });
      24 |

      at src/routes/__test__/signup.test.ts:21:8
      at step (src/routes/__test__/signup.test.ts:33:23)
      at Object.next (src/routes/__test__/signup.test.ts:14:53)
      at src/routes/__test__/signup.test.ts:8:71
      at Object.<anonymous>.__awaiter (src/routes/__test__/signup.test.ts:4:12)
      at Object.<anonymous> (src/routes/__test__/signup.test.ts:6:40)
      ----
      at Test.Object.<anonymous>.Test._assertStatus (node_modules/supertest/lib/test.js:296:12)
      at node_modules/supertest/lib/test.js:80:15
      at Test.Object.<anonymous>.Test._assertFunction (node_modules/supertest/lib/test.js:311:11)
      at Test.Object.<anonymous>.Test.assert (node_modules/supertest/lib/test.js:201:21)
      at Server.localAssert (node_modules/supertest/lib/test.js:159:12)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        29.074 s
Ran all test suites.

Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.

```

**MOZES PROCITTI GORE NA POCETKU U CEMU JE PROBLEM**

**TO JE `secretOrPrivateKey must have a value`**

**SECAS SE DA MORAS PROSLEDITI ENVIROMENT VARIABLE `JWT_KEY` (TO JE ONAJ SECRET KEY, KOJIM ZAJEDNO SA PAYLOAD-OM PRAVIS JSON WEB TOKEN)**
