# SUBTLE MICROSERVICE COUPLING

**RECI CU TI ZASTO COUPLING NIJE DOBRA STAVAR, NA KARAJU OVOG BRANCHA (RECI CU TI I STA JE COUPLING)**

POCECEMO DA RADIMO NA HANDLERIMA, A POCECU SA ONIM HANDLEROM ZA KREIRANJE SINGLE ORDER-A; *NARAVNO OVDE JE NEOPHODAN AUTHENTICATED USER*

ALI OVDE CEMO POSEBNU PAZNJU OBRATITI NA VALIDACIJU FIELD-A

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
// UVOZIM OVE MIDDLEWARE-OVE
import { requireAuth, validateRequest } from "@ramicktick/common";
//
// UZIMAM bofy MIDDLEWARE SA express-validator-A
import { body } from "express-validator";

// UZECU UTILITY FROM MONGOOSE KOJI CE USTVARI RECI
// DA LI JE NEKI ID VALIDAN MONGO-V ID
import { Types as MongooseTypes } from "mongoose";
//

const router = Router();

// ZADAJEM MIDDLEWARES
router.get(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      // EVO OVO JE VALIDACIJA O TOME DA LI SE RADI
      // O ID-JU DOKUMMENTA IZ MONGO-A
      // PRAVIM OCUSTOM VALIDACIJU
      .custom((input: string) => {
        // OVO CE BITI BOOLEAN
        return MongooseTypes.ObjectId.isValid(input);
      })
      //
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // AKO NE POSTOJI AUTHENTICATED USER, MIDDLEWARE CE ODRADITI SVOJE
    // THROW-OVACE ERROR DO ERROR HANDLING MIDDLEWARE-A

    // IIZDVAJAM STVARI SA BODY-JA
    const { ticketId } = req.body;
    // OVDE CU SADA STATI DA BI TI OBJASNIO
    // ONO U VEZI MICROSERVICE COUPLING-A

    res.send({});
  }
);

export { router as listAllOrdersRouter };
```

# JA SAM GORE, STRIKNO PROVERIO DA LI SE RADI MONGODB VALIDDNOM ID-JU, ALI TI ZNAJ DA JE TO LOS PRISTUP

LOSE JE ZATO STO SE IZ orders OCEKUJE NESTO OD tickets MICROSERVICE-A

LOSE JE DAKLE TO STO orders MICROSERVICE, PRAVI ASUMPTION O TOME DA JE DATABASE tickets-OVOG MICROSERVICE-A, USTVARI MONGODB

**TAKVE ASUMPTIONS TI NE BI TREBAO DA PRAVIS INSIDE ONE MICROSERVICE, ABOUT OTHER MICROSERVICE**

JER MOGLO SE LAK O DESITI DA JE N PRIMER tickets MICROSERVICE KORISTIO POSTGRESS NA PRIMER ILI NEKI DRUGI DTABASE




