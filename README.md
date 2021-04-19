# CREATING A ROUTER

DAKLE JA SADA IMAM TESTS BACK IN MY MIND DOK SVE BUDEM DEFINISAO, UVEK DAKLE IDEM PRINCIPOM DA MORAM DA ZADOVOLJIM TSTS

- `cat tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  // MENE SADA ZANIMA OVO
});

it("can only be accessed if user is signed in", async () => {});
it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

NEMAS NI JEDAN HANDLER ZA SADA U tickets MICROSERVICE-U

ALI TO BAS I NIJE TAKO, JER SI KOPIRAO SILNI CODE, I U TOM CODE-U TI SI PODESIO HANDLER ZA CATCH ALL ROUTES

- `cat tickets/src/app.ts`

```ts
// ...
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});
//...
```

TO ZNACI DA AKO POSALJES REQUEST, PREMA tickets MICROSERVICE-U NA BILO KOJEM ROUTE-U, TI CES DOBITI 404 ERROR

**SAD CU NAPISATI TEST, I OCEKUJEM DA PRVI TEST NECE PASS-OVATI, JER CU DOBITI 404**

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  // EVO STA DEFINISEM, MISLIM DA JI JE JASNO STA SAM URAIO
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {});
it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

**I ZAIST TEST NIJE PROSAO,, JER SE ZAISTA DOBIJA STATUS CODE 404**

## SADA CU DA DEFINISEM HANDLER-A, JER UPRAVO MI JE TEST UKAZAO DA TO MORAM KREIRATI

- `touch tickets/src/routes/new.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/tickets", async (req, res) => {
  return res.status(201).send({});
});

export { router as createTicketRouter };

```

POVEZI GA NA app

- `code tickets/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

// UVEZAO
import { createTicketRouter } from "./routes/new";
//

import { errorHandler, NotFoundError } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

// EVO OVDE CU POVEZATI ROUTERA
app.use(createTicketRouter);
//

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

**CIM SI SAVE-OVAO FILE, TEST, POSTO JE U WATCH MODE-U CE NASTAVITI, DA TESTIRA, `OVOG PUTA TEST JE PROSAO`**

***
***

OPET BITNA STVAR, NEIJE BITAN INGRESS NGINX (JOS NISI POVEZAO CLUSTER IP tickets MICROSERVICE-A SA INGRESS-OM), JER TI SAMO MOZES DA TESTIRAS LOKALNO, NEMA CLUSTER-A U OVOM SLUCAJU

***
***


