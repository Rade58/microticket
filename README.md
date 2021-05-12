# IMPLEMENTING CREATE CHARGE HANDLER

DAKLE KORINSIK BI TREBALO DA HIT-UJE OVAJ ENDPOINT

**I U BODY-JU REQUESTA NARAVNO, BICE `TOKEN PROVIDED BY STRIPE JS LIBRARY`, ZATIM `orderId`**

U HANDLERU CE SE ONDA RADITI SLEDECE:

1. PRONALAZENJE ORDERA-A, ZA KOJI USER POKUSAVA DA PAY-UJE

2. POSTARAJ SE DA ORDER ACTUALLY BELONGS TO THE USER

3. POSTARAJ SE DA AMOUNT OF MONEY KOJI DISPLAY-UJES INSIDE THE ORDER, USTVARI MATCH-UJE AMOUNT OF MONEY ZA KOJI NAS JE USER AUTHORIZE-OVAO TO CHARGE CREDIT CARD FOR

4. MAKING REQUEST TO STRIPE API TO VERIFY PAYMENT; ODNONO TO CHATRGE USER CREDIT CARD; DAKLE TO JE BILLING USER-A

5. CREATING `CHARGE` RECORD U NASEM DATBASE-U (PRAVLJANJE Charge DOKUMENTA U Charges KOLEKCIJI DTABASE-A VEZANOG ZA `paymments` MICROSERVICE); U CHARGE RECORDU TREBA INFORMACIJA DA SMO SUCCESSFULLY BILL-OVALI USER-A FOR SOME AMOUNT OF MONEY

I TO JE OD PRILIKE SVE

**MI CEMO OVO SVE MOCI TESTIRATI SA JESTOM, KAO NASIM AUTOMATED TEST RUNNEROM**

**MI NECEMO NISTA IMPLEMENTIRATI U BROWSERU, JOS UVEK**

JER PRVO ZELIMO DA SE UVERIMO DA ALL THIS STUFF WORKS AS EXPECTED

# PRAVIMO CREATE CHARGE HANDLER U KOJEM CEMO IMPLENETIRATI GORNJU SERIJU STEP-OVA, ALI NE ODMAH; PRVO CU SVE DA WIRE-UJEM UP

- `mkdir payments/src/routes`

- `touch payments/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("toket").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //
    // ZA SADA CU SAMO DA SEND-UJEM ARBITRARY THING
    // KOJI CU KASNIJE REPLACE-OVATI, VEMO BRZO
    res.send({ success: true });
  }
);

export { router as createChargeRouter };
```

**DA SADA WIRE-UJEMO UP POMENUTI HANDLER**

- `code payments/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

// UVOZIM HANDLER-A
import { createChargeRouter } from "./routes/new";

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

// POVEZUJEM GA OVDE
app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

AKO TI NIJE SKAFFOLD UPALJEN POKRENI GA

- `skaffold dev`

**TESTIRACEMO ROUTE U INSOMNII**


