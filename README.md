# Order CREATION LOGIC

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
// TREBACE MI NEKI CUSTOM ERRORS
import {
  requireAuth,
  validateRequest,
  NotFoundError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
// UVESCEMO OBA MODELA
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";
//

const router = Router();

router.get(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // OVO CE JEDINO BITI U BODY-JU
    const { ticketId } = req.body;

    // POTREBNO JE UZETI USER-A

    // OVDE CEMO IMATI USERA ZBOG requireAuth
    // MIDDLEWARE
    // OVO SAMO RADI MZBOG TYPESCRIPT-A
    // MI ZNAMO DA CE USER OVDE BITI ZASIGURNO
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    // PRVO UZIMAMO Ticket DOKUMENT IZ Tickets KOLEKCIJE
    const ticket = await Ticket.findById(ticketId).exec();

    // AKO TICKET NE POSTOJI, MORAMO THROW-OVATI ERROR
    if (!ticket) {
      throw new NotFoundError();
    }

    // SADA CEMO DA VIDIMO STA SVE MORAMO OVDE DA URADIMO

    // - PRE NEGO STO KREIRAM ORDER, MORAMO SE UVERITI DA
    // TICKET NIJE VEC RESERVED (A TO CEMO TAK OSTO CEMO
    // SEARCH-OVATI Orders KOLEKCIJU, PREMA TICKET ID-JU)

    // ONDA MORAMO DA PROVERIMO status


    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };

```

# FINDING RESERVED TICKETA CE MOZDA BITI MALO CHALLENGING

**MORAMO DA ZNAMO STA TO ZNACI KADA JE NEKI TICKET RESERVED**

PA AKO NE PRONADJES ORDER OBJEKAT, TO ZNACI DA NIJE RESERVED

AKO JE ORDER U `cancelled` STATUSU TO ZNACI DA NIJE RESERVED

DOBRO, KADA TO ZNAM, MOGU DA NASTVIM SA DEFINISANJEM

A SADA CU DA NASTAVIM SA DEFINISANJEM HANDLER-A

- `code orders/src/routes/new.ts`

```ts

```

