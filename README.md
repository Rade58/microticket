# `"GET"` `"/api/tickets"` HANDLER FOR RETREIVING ALL DOCUMENTS FROM Tickets COLLECTION

DAKLE AUTOR WORKSHOPA KAZE DA U OVOM SLUCAJU NIJE POTREBAN AUTHENTICATED USER (TO MI JE MALO CUDNO JER ZA GETTIN USINGLE TICKETA BY ID, JA SAM DEFINISAO requireAuth HANDLERA (VIDECU MOZDA KASNIJE STA JE TU BILA GRESKA A MOZDA I NIJE))

OPET CU KRENUTI SA TEST-FIRST APPROACH-OM

- `touch tickets/src/routes/__tests__/index.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

// NAPRAVICU HELPERA ZA KRIRANJE TICKETA
const createTicket = async () => {
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", global.getCookie())
    .send({
      title: "Stavros listening",
      price: 126,
    })
    .expect(201);
};

it("it returns 200 on gettin all tickets", async () => {
  // LETS CREATE SOME TICKETS FIRST
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").send();

  expect(response.status).toEqual(200);

  console.log(response.body);

  expect(response.body.length).toBeGreaterThan(0);

  expect(response.body[0]).toHaveProperty("userId");
  expect(response.body[0]).toHaveProperty("title");
  expect(response.body[0]).toHaveProperty("price");
  expect(response.body[0]).toHaveProperty("id");
});

```

# SADA CU DA KREIRAM ROUTER-A

- `touch tickets/src/routes/index.ts`

```ts
import { Router } from "express";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get("/api/tickets", async (req, res) => {
  const tickets = await Ticket.find({});

  res.status(200).send(tickets);
});

export { router as getAllTicketsRouter };
```

**POVEZACU ROUTERA ON app**

- `code tickets/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

import { getOneTicketByIdRouter } from "./routes/show";
// UZEO OVO
import { getAllTicketsRouter } from "./routes/";
//

import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.use(createTicketRouter);
app.use(getOneTicketByIdRouter);
// DODAO OVO
app.use(getAllTicketsRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

POKRENI TEST SUITE, AKO VEC NISI

- `cd ticket`

- `yarn test`
- 
