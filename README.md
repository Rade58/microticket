# TEST-FIRST APPROACH

***

digresija:

TI VEC IMAS `tickets/src/test/setup.ts` U KOJEM JE ODREDJEN ISETTING

***

DAKLE SADA CU POCETI SA PRAVLJENJEM HANDLER-A ZA `tickets` MICROSERVICE

ALI CU KORISTITI TEST DRIVEN DEVELOPMENT APPROACH

## PRVO CU NAPISATI TESTOVE AROUND "POST" `/api/tickets` ROUTE HANDLER, I ONDA CU POKUSATI DA UCINIMA DA TI TEST-OVI PASS-UJU

- `mkdir tickets/src/routes`

- `mkdir tickets/src/routes/__tests__`

KREIRAM TEST FILE NA new ROUTE HANDLER, JER CU KASNIJE IMATI ROUTE HANDLER KOJI CE SE ZVATI new (new ROUTE HANDLER CE BITI HANDLER ZA CREATING NEW TICKET)

- `touch tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

// SADA DOLAZI VELIKO PITANJE, A STA TIO MI ZELIMO DA TESTIRAMO

// PA MORAMO DA TESTIRAMO VALIDIRANJE REQUEST BODY
// MORAM IMATI BODY SA {title:string; price: string;}

//  ISTO TAKO TESTIRANJE DA LI JE USER AUTHETICATED
// USER MORA BITI SIGNED IN DA BI SMEO DA HIT-UJE OVAJ ROUTE HANDLER

// EVENTUALLY TREBCE MI TEST KOJI CE RECI DA SAM KREIRAO TICKET, I SOMETHING LIKE THAT

```

- `touch tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  request(app).post("/api/tickets");
});

it("can only be accessed if user is signed in", async () => {});

it("it returns an error if invalid 'title' is provided", async () => {});

it("it returns an error if invalid 'price' is provided", async () => {});

it("it creates ticket with valid inputs", async () => {});

```

## MOZES POKRENUTI TEST SUITE

- `cd tickets`

- `yarn test`

SVI SU PASSED JER ACTUALLY NISTA NISI TESTIRAO

TO CES URADITI U SLEDECIM BRANCH-EVIMA
