# `await`ING EVENT PUBLISHING

TI SI OVO URADIO KOD OBA DOSADASNJA PUBLISHINGA IZ tickets MICROSERVICE-A

EVO POGLEDAJ STA SI URADIO KOD TICKET CREATING-A

- `cat tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../events/nats-wrapper";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = (req.currentUser as {
      id: string;
      email: string;
      iat: number;
    }).id;

    const ticket = await Ticket.create({ title, price, userId });

    // EVO OVDE SI DEFINISAO PUBLISHING EVENTA
    // I POSTO publish RETURN-UJE PROMISE
    // KOJI JE RESOLVED KADA SE USPENO POSALJE EVENT
    // ONDA JE MOGUCE TO AWAIT-OVATI
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    // -----------------------------------------------------
    // DAKLE OVAJ RED BUKVALNO CEKA DA SE USPESNO
    // PUBLISH-UJE EVENT
    // U SLUCAJU DA SE TO NE DOGODI
    // OVDE CE BITI THROWN ERROR (A NEMA STA DA GA CATCH-UJE)
    // USTVARI ERROR CE BITI CATCHED BY ERROR HANDLER KOJEG SAM PODESIO
    // NA NIVOU CELOG EXPRESS APP-A

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

```

EVO STA SI URADIO KOD TICKET UPDATING-A

I TU JE ISTI SLUCAJ

- `cat tickets/src/routes/update.ts`

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../events/nats-wrapper";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("title has invalid format"),
    body("price").isFloat({ gt: 0 }).withMessage("price has invalid format"),
  ],

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

    let ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      { price: data.price, title: data.title },
      { new: true, useFindAndModify: true }
    ).exec();

    if (ticket) {
      // EVO I OVDE J ISTI SLUCAJ I OVDE SAM AWAIT-OVAO
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      });
    }
    // -------------------------------------

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

# IZ OVOGA TI JE JASNA JEDNA STVAR; AKO PUBLISHING FAIL-UJE RESPONSE NECE BITI POSLAT KORISNIKU. IAKO TICKET JETE CREATED; USTVARII BICE MU POSLAT ERROREUS RESPONSE IZ ERROR HANDLERA

USTVARI BICE MU POSLAT CONSISTANT ARRAY U KOJEM JE ERROR DATA (TU SE NALAZI ERROR MESSAGE)

ODNOSNO NECE DOCI DO ONOG SENDINGA RESPONSE-A IZ SAMOG EVENT HANDLER-A (STATUS NECE BITI 201)

BICE NESTO U RNGU 500 ILI 400, U ZAVISNOSTI STA GOD TAJ FAILURE PRODUCE-UJE

# NA KRAJU KRAJEVA, DA LI TI UPSETE TREBAS DA SALJES DO BROWSERA, INFORMACIUJU DA JE EVENT FAIL-OVAO?

KAO PRVO TI TU DODAJE LATENCY, KORISNIK NECE DOBITI DATA, JOS ZA TOLIKO VREMENA, KOLIKO TRBA DA SE PUBLISH-UJE EVENT

DAKLE IMACES TINY BIT OF LATENCY

**ALI TO I NIJE TAKAV PROBLEM, KAKAV BI PROBLEM IMAO KADA NEBI KOMUNICIRAO FAILING PUBLISHING-A**

SADA CES VIDETI KAKV BI TO PROBLRM IMAO

ISTO TAKO SECAS SE DA SMO REKLI DA CEMO STORE-OVATI TRASACTIONS, ODNOSNO DA CEMO STOORE-OVATI EVENTS I PAZITI NA NJIHOVE RETNE BROJEVE, KAKO BISMO IZBEGLI CONCUURRENCY IISSUES

## OD POMENUTOG LATENCY, POSTOJI BIGGER ISSUE, O KOJEM TREBAS DA RAZMISLJAS; A NAJLLAKSE CES TO SHVATITI AKO POSMATRAS SCENARIO JEDNE BANKING APLIKACIJE

NA PRIMER IMAS `transction` MICROSERVICE, I ON PRIMA REUEST OD USER-A, A U TO  REQUESTO JE DATA KOJA IMA NEKI USER ID VISINU DEPOZITA KOJI KORISNIK PRAVI

KONKRETNO HIIT-OVAO BI SE NEKI: CREATE TRANSCTION ROUTE HANDLER

POMENUTI HANDLER CE **"OBRACATI PAZNJU NA CONCURRENCY ISUES"**

POMENULI SMO JEDNOM TU STRATEGIJU

STORE-OVACE SE TRANSACTION DATA INSIDE TRANSCTION DTABASE, ODNONO TRANSACTION COLLECTION

DAKLE DOKUMENT CE IMATI USER ID, DEPOZIT, I NEKI ID

NAKON STORINGA U DATBASE, SALJEMO EVENT, KOJI CE PORED SVIH PODATKA IMATI I REDNI BROJ (**REKLI SMO DA CEMO TAKO RESAVATI CONCURRENCY ISSUES**)

EVENT CE OTICI DO NATS STREAMING SERVER-A, DO APPROPRIATE KNALA

A OND CE NEKI LISTENER MICROSERVICE, ODNOSNO NEKI ACCOUNT MICROSERVICE, DOBITI TAJ EVENT JE LISTEN-UJE NA TAJ KANAL

I U RELATED  DATABASE-U ZA TAJ MICROSERVICE, TREBA DA SE STORE-UJE DATA O DEPOZITU

**`STA BI SE DESILO DA NAS PUBLISHING EVENTA`, U SLUCAJU NEKE HAVARIJE; NA PRIMER U SLUCAJU CRACHINGA NATS STREAMING SERVERA, ILI NEKOG DRUGOG RAZLOGA ZBOG KOJEG JE STAN CLIENT IZGUBIO KONEKCIJU; `NE THROW-UJE ERROR DO ERROR HANDLER MIDDLEWARE-A`**

U SLUCAJU OVE BANKING APLIKACIJE SIGURNO BI IMALI NEKI DATA INTEGRITI ISSUES

ZASTO?

**PA KORISNIKU BI BIO POSLAT RESPONSE DA JE SVE OK; DA JE NAPRAVLJEN DEPOZIT**

**ALI NIJE SVE OK, JER DEPOZIT NIJE STORED U DATABSE-U account MICROSERVICE-A**

`DAKLE KORISNIK BI IMAO INFO DA JE NESTO DEPOSIT-OVAO, IAKO SE TAJ DEPOSIT, UOPSTE NIJE NI DOGODIO NA KRAJU`

# DAKLE REAL QUESTION U OVOM SLUCAJU, ONO STO JE REALLY RELEVANT JESTE: `"HOW DO WE SOMEHOW CAPTURE THE FACT THAT WE FAILED TO PUBLISH EVENT"`

DAKLE KAKO TREBA CAPTURE-OVATI FAILIURE OF EVENT, DA NE BI IMALI CRITICAL DAT INTEGRITI ISSUES BETWEEN OUR MICROSERVICES

TO JE PRAVO PITANJE
