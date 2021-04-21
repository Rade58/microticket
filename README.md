# `"PUT"` `/api/tickets/:id` HANDLER FOR UPDATING SINGLE DOCUMENT FROM Tickets COLLECTION

KAO STO VIDIS SLACU I body SA OVIM REQUESTOM, A TAKODJE ROUTE IMA I PARMAETAR

**OPET CU KORISTITI TEST FIRST APPROACH**

AUTOR WORKSHOPA KAZE DA CE OVE TESTOVI, U SLUCAJU "PUT"-A, ODNOSNO PRI UPDATINGU BITI SUPER CRITICAL

***

NE SADA, BUT LATER IN THE PROJECT MI CEMO POCETI DA DODAJEMO OTHER SERVICES, ZA DEALING WITH ORDERS I PAYMENTS I DRUGE STVARI

**POSTOJACE CRITICAL LOGIC AROUND DA LI USER MOZE DA  UPDATE-UJE TICKET**

I TESTOVI CE U TOM SLUCAJU BITI CRITICAL DA IH ODRADIS

***

NEKI MOGUCI ASSERTIONI:

"if id doesn't exist return 404 right away"
"if thers is no user return 401" (POSTO JE ZA OVO ODGOVORAM MIDDLEWARE, ALI MOZES DA TESTIRAS (requireAuth MIDDLEWARE))
"if user doesn't own a ticker (userId OF THE TICKET AND id OF req.currentUser DOESN'T MATCH), return 401"
"if there isn't title OR price field in the body of request, return 400"
"if price field is updated, or if title field is updated, return 201"

DA KRECEM SA DEFINISANJEM TESTA

- `touch tickets/src/routes/__tests__/update.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

const titleCreate = "Stavros is hone";
const priceCreate = 602;

const title = "Nick M is here";
const price = 406;

// CREATE TICKET HELPER
/**
 * @description id OF THE TICKET CAN BE OBTAINED FROM THE .body
 * @description userId OF THE TICKET CAN BE OBTAINED FROM THE .body
 */
const createTicketResponse = async () =>
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: titleCreate, price: priceCreate });

// TESTS

it("if ticket with that id doesn't exist, return 400", async () => {
  const randomId = new Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${randomId}`)
    .set("Cookie", global.getCookie())
    .send({ title, price })
    .expect(404);
});

it("if the user does not own a ticket, return 401", async () => {
  // MISLIM DA CE MI OVDE TREBATI JOS JEDNA POMOCNA
  // FUNKCIJA, KOJA BI PRAVILA COOKIE, ALI SA RAZLICITIM PODACIMA
  // OD KOJIH IH PRAVI global.getCookie()
  // ALI OVA FUNKCIJA BI KORISTILA PAYLOAD KAO INPUT
  // SVE TO DA BI USPENO DA BI OBAVIO OVAJ TEST

  // JA CU OPET KRIRATI JEST GLOBAL FUNKCIJU

});
```

**NAPRAVICU GLOBAL JEST HELPER-A, O KOJEM SAM GOVORIO**

- `code tickets/src/test/setup.ts`

```ts
// ...

global.getOtherCookie = (payload: { id: string; email: string }) => {
  const jwt = sign(payload, process.env.JWT_KEY as string);

  const session = { jwt };

  const sessionJSON = JSON.stringify(session);

  const buf = Buffer.from(sessionJSON, "utf-8");

  return [`express:sess=${buf.toString("base64")}`];
};
```

MEDJUTIM, UMESTO OVOGA STA SAM JA RADIO, KORISNIK JE SAMO U POSTOJECOJ `global.getCookie` FUNKCIJI DEFINISAO DA SE id PAYLOAD-A GENERISE KORISCENJEM `new mongoose.Types.ObjectId.toHexString()` (MENE MRZZI DA TO SADA RADIM, **IPAK CU U TESTOVIMA KORISTITI, OVU MOJU GLOBALNU JEST FUNKCIJU, KOJ UAM MALOCAS NAPRAVIO**)

## SADA MOGU DA NASTAVIM SA TESTOM U KOJM PRAVIM ASSERTION "if a user doesn't own a ticket return 401"

- `code tickets/src/routes/__tests__/update.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

import { Types } from "mongoose";

const titleCreate = "Stavros is hone";
const priceCreate = 602;

const title = "Nick M is here";
const price = 406;

/**
 * @description id OF THE TICKET CAN BE OBTAINED FROM THE .body
 * @description userId OF THE TICKET CAN BE OBTAINED FROM THE .body
 */
const createTicketResponse = async () =>
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: titleCreate, price: priceCreate });

it("if ticket with that id doesn't exist, return 400", async () => {
  const randomId = new Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${randomId}`)
    .set("Cookie", global.getCookie())
    .send({ title, price })
    .expect(404);
});

// DODACU I U TEST KOJI PROVERAVA SAMO DA LI POSTOJI KORISNIK
it("if there is no authenticated user, it returns 401", async () => {
  const response = await createTicketResponse();

  const { id } = response.body;

  // SLACU REQUEST BEZ COOKIE-A I OCEKUJEM 401

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title, price })
    .expect(401);
});

// NASTAVLJAM SA OVIM TESTOM ZA KOJI SAM REKAO DA CU GA PISATI

it("if the user does not own a ticket, return 404", async () => {
  // NASTAVLJAM SA OVIM TESTOM
  // CREATING A TICKET
  const response = await createTicketResponse();

  // TICKET ID
  const { id } = response.body;

  // TRYING AN TICKET UPDATE BUT WITH DIFFERENT CREDENTIALS
  await request(app)
    .put(`/api/tickets/${id}`)
    // COOKIE BUT WITH DIFFERENT JWT
    .set(
      "Cookie",
      global.getOtherCookie({ email: "otherguy@test.com", id: "sdfdsdgfd34" })
    )
    //
    .send({ price })
    .expect(401);
});
```

# HAJDE SADA DA NAPRAVIMO HANDLERA I DA GA WIRE-UJEMO UP, PA DA ONDA PROBAMO TESTOVE

- `touch tickets/src/routes/update.ts`

SAMO CU TI TRCI DA SAM GA DRUGACIJE MALO NAPRAVIO NAEGO AUTOR WORKSHOPA

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest, // OVO JE ONAJ HANDLER, KOJI THROW-UJE VALIDATION ERROR
  //                 KOJE PASS-UJE EXPRESS VALIDATOR
  requireAuth,
} from "@ramicktick/common";

// OVO NECU ODMAH UPOTREBITI
import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser?.id;
    const { title, price } = req.body;

    const data: { title?: string; price?: number } = {};

    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    // FINDING TICKET FIRST
    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    // IF IT'S NOT A RIGHT USER
    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    // UPDATING
    ticket = await Ticket.findByIdAndUpdate(id, { data }).exec();

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

SADA DA WIRE-UJEM HANDLER-A

- `code tickets/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

import { getOneTicketByIdRouter } from "./routes/show";
import { getAllTicketsRouter } from "./routes/";
// UZEO OVO
import { updateOneTicketRouter } from "./routes/update";
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
app.use(getAllTicketsRouter);
// DODAO OVO
app.use(updateOneTicketRouter);
//

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

**MOZES DA POKRENES TESTOVE, AKO VEC NISI**

- `cd tickets`

- `yarn test`

**I TEST-OVI SU PASS-OVALI**

## OSTAJE MI DA NAPISEM TEST O TOM DA LI SU PROVIDED VALIDNI INPUTI, ODNONO DA SU U VALIDNOM FORMATU `title` I `price`



