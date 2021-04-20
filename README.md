# KREIRANJE `"GET"` `/api/tickets/:id`

***

digresija:

OBRATI PAZNJU NA CastError KOJI MOZE NASTATI KADA GETT-UJES NESTO IZ DATBASE BY _id A NE PROVIDE-UJES ID KOJI NIJE U TACNOM FORMATU (KOJI NEMA 12 KARAKTERA)

***

DAKLE KREIRAM ROUTER ZA GETTING SINLE TICKET DOKUMENT-A

**NARAVNO I OVDE KORISTIM TEST-FIRST APPROACH**

TAKO DA KRECEM OD TEST FILE-A

- `touch tickets/src/routes/__tests__/show.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  // BITNO JE DA ID IMA 12 KARAKTERA
  // TO JE JER CE SE PRI GETTINGU BY ID DESITI CastError
  // I KOJI JE CONFUSING I NIGDE NECES MOCI VIDETI DA
  // JE U PITANJU TAJ ERROR
  const someRandomId = "sfsdsdfasd46";
  // TO SAM TEK NAKNADNO SAZNAO, TAKO STO SAM
  //  STAMPAO ERRORS U ERROH HANDLERU
  // JOS JEDNA DOBRA STVAR TESTOVA JE STO BI OVO BILO TESKO 
  // CATCH-OVATI INSIDE BROWSER
  // ALI I TADA JE TESKO CATCH-OVATI, AKO TI NE STMAPAS ERRORS
  // JA SAM SLUCAJNO DEFINISAO TO STMPANJE ERROR-A KADA SAM 
  // PRAVIO ERROR HANDLER-A, KOJEG KORISTIM DA CATCH-UJE ERRORS
  // IZ SVAKOG OD MOJIH HANDLER-A


  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send();

  // MOZE I OVAKO
  // expect(response.status).toEqual(404);
  // ALI MOZE I CHAINING
  expect(response.status).toEqual(404);
});

it("returns the ticket if the ticket is found", async () => {
  // OVDE SE PRVO MORA KREIRATI TICKET

  const price = 206;
  const title = "Stavros going";

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  const { id } = response1.body;

  const response2 = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response2.status).toEqual(200); // I OVO SI MOGAO DA CHAIN-UJES ALI NEMA VEZE

  expect(response2.body.title).toEqual(title);
  expect(response2.body.price).toEqual(price);
});

```

NE MORAS JOS DA TESTIRAS, DOK NE IMPLEMENTIRAS SAMI HANDLER

**ISTO TAKO KADA BI IMAO CastError JER NISI PROVIDE-OVAO ID KOJI IMA TACNO 12 KARAKTERA TI BI IMAO 400 UMESTO 404**

TO BI BILO CONFUSING, ALI STMAPAJUCI RESPONSE LAKO CES MOCI VIDETI KAKV ERORO IMAS

## KREIRAM HANDLER, ZA KOJI SAM PISAO GORNJE TESTOVE

- `touch tickets/src/routes/show.ts`

```ts
import { Router, Request, Response } from "express";

import { requireAuth, NotFoundError } from "@ramicktick/common";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
  "/api/tickets/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    console.log({ ticket });

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as getOneTicketByIdRouter };

```

MORAM SADA DA GA POVEZEM

- `code tickets/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

// UZEO OVO
import { getOneTicketByIdRouter } from "./routes/show";

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
// DODAO OVO
app.use(getOneTicketByIdRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

**TESTOVI SU PROSLI**


# `CastError`

***

JOS TI JEDNOM NAPOMINJEM DA SE MOZE DESITI I CastError KOJI JE 400, A NE 404, KADA POKUSAS DA OBTAIN-UJES DOKUMENT IZ KOLEKCIJE, KORISCENJEM _id-JA, A KADA TAJ ID NIJE U PRAVOM FORMATU, KADA NEMA 12 KARARAKTERA

**ALTERNATIVNI NACIN DEBUGGING-A U OVOM SLUCAJU BI BIO DA PRONADJES ERROR HANDLER MIDDLEWARE, I DA TAMO STMAPAS SVE ERRORS**

ALI TAJ JE MIDDLEWAR, IAKO GA KORISTIM D CATCH-UJEEM BILO KOJI ERROR U APLIKACIJI, IPAK JE ON DEO TVOG LIBRARY-JA KOJEG SI PUBLISH-OVAO NA NPM, I KOJEG SI INSTALIRAO OVDE U tickets MICROSERVICE-U

TAKO DA BI MORAO DA KOPAS PO node_modules

TACNIJE OVDE `tickets/node_modules/@ramicktick/common/build/middlewares/error-handler.js`

I DA TAMMO DODAS CONSOLE LOG, STO JE TEMPORRRY PROMENA, JER SVAKIM NOVIM INSTALIRANJEM MODULA, TAJ TVOJ CHANGE CE NESTATI

**ALI POSEZES ZA TRAZENJU PO NODE MODULIMA KADA NEMAS DRUGOG RESENJA**

**JA SAM TO STMAPANJE SLUCAJNO ODRADIO, KADA SAM PRAVIO SAMI LIBRARY, TAKO DA NE MORAM DA KOPAM I TRAZIM ERROR HANDLERA**

***

# SADA IDELANA STVAR BI BILA DA TI NAPRAVIS CUSTOM ERROR, U SVOM PAKETU 

ALI MI CEMO U SLEDECEM BRANCH-U USTVARI MALO PROMENITI TAJ ERROR HANDLER NASEG PAKETA, JER JA SAM CONSOLE LOG-OVAO ERROR, A MOZDA JE BOLJE DA SAM KORISTIO `console.err`
