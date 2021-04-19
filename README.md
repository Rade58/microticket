# OVIM TEST FIRST APPROACH-OM ZELIM DA TESTIRAM VLIDACIJU ONOGA STO SE SALJE SA BODY-JEM "POST" REQUEST-A ZA `/api/tickets`

JA SAM RANIJE DEFINIAO CUSTOM ERROR ZA VALIDATION, TO JE `RequestValidation` ERROR, KOJI SAM STAVIO U MOJ LIBRARY `@ramicktick/common`

NJEGOV CODE IZGLEDA OVAKO

```ts
import { ValidationError } from "express-validator";
//
import { CustomError } from "./custom-error";
//

export class RequestValidationError extends CustomError {
  public errors: ValidationError[];
  public statusCode = 400;

  constructor(errors: ValidationError[]) {
    super("Invalid request params");
    this.errors = errors;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  public serializeErrors() {
    const formattedErrors = this.errors.map(({ msg, param }) => {
      return { message: msg, field: param };
    });

    return { errors: formattedErrors };
  }
}

```

**KAO STO VIDIS ON RETURN-UJE 400 STATUS CODE**

TAKO DA MOGU PRAVITI ASSERTION U TESTOVIMA ZA TAJ CODE

JER TAJ ERROR TREBAM DA THROW-UJEM U MOM HANDLERU AKO SU NEVALIDNI FIELD-OVI RESPONSE-OVOG body-JA

DAKLE OVO SU NEKE TVRDNJE KOJE SAM DEFINISAO

- ``

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("can be accessed if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "ssdfsdf", price: 442 });

  expect(response.status).toEqual(201);

  expect(response.status).not.toEqual(401);
});

// ---------------------------------------------------------
it("it returns an error if invalid 'title' is provided", async () => {
  // OVO DEFINISEM , I NE ZABORAVLJAM COOKIE
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // title TREBA DA BUDE STRING ,A JA NAMERNO UBACUJEM POGRESNO
    .send({ title: 16, price: 122 });

  expect(response1.status).toEqual(400);

  // MOZEMO DA TESTIRAMO SLUCAJ SA EMPTY STRINGOM, JER NI TO NE TREBA DA BUDE VALIDNO
  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // PODESAVAMO "" ZA title
    .send({ title: "", price: 122 });

  expect(response2.status).toEqual(400);

  // OVDE PRAVIM TEST ZA MISSING FIELD title
  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())

    .send({ price: 122.4 });

  expect(response3.status).toEqual(400);
});
it("it returns an error if invalid 'price' is provided", async () => {
  // OVO DEFINISEM
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // NAMERN OSALJEM PRICE KAO NEGATIVNU VREDNOST
    .send({ title: "nebula", price: -16 });

  expect(response1.status).toEqual(400);

  // PODESAVAMO I ZA SLUCAJ DA JE price EMPTY STRING
  const response2 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // STAVLJAM DA JE PRICE NULA
    .send({ title: "nebula", price: 0 });

  expect(response2.status).toEqual(400);

  // PRAVIM TEST ZA MISSING FIELD price
  const response3 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    // IZOSTAVLJAM PRICE
    .send({ title: "nebula" });

  expect(response3.status).toEqual(400);
});
// ----------------------------------------------------------

it("it creates ticket with valid inputs", async () => {});
```

NISU MI BITNI REZULTATI TESTIRANJA JER NISAM NISTA JOS U VEZI VALIDACIJE DEFINISAO U HANDLERU

# SADA CU DA DEFINISEM MIDDLEWARES SA VALIDACIJAMA, A TO SU MIDDLEWRS KOJE CU PRAVITI UZ POMOC PAKETA 'express-validator'; ISTO TAKO DODACU I MIDDLEWARE `validateRequest` (IZ MOG PAKETA `@ramicktick/common`), KOJEG SAM JA PRAVIO I KOJI USTVARI THROW-UJE ERRORS U SLUCAJU POGRRESNE VALIDACIJE

DAKLE MIDDLEWARES KOJE BUDES PRAVIO SA PAKETOM express-validatora, NE THROW-UJU ERRORS, VEC ERROR MESSAGE KACE NA REQUEST

ONDA SE SA DRUGOM FUNKCIJOM `validationResult` (IZ PAKETA express-validator) PROVERVA DA LI IMA ERROR-A (JA SAM SVU TU LOGIKU PROVERE KREIRAO U MIDDLEWARE-U validateRequest; TAKO DA CU CHAIN-OVTI OVAJ MIDDLEWARE, I ON CE BITI POSLEDNJI (TAJ MOJ MIDDLEWARE THROW-UJE MOJ CUSTOM RequestValidationError))

- `code tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
//
import { body } from "express-validator";

// UVOZIM MOJ MIDDLEWARE validateRquest
import { requireAuth, validateRequest } from "@ramicktick/common";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  // ZADAJEM MIDDLEWARES
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
  ],
  // ZA SADA JOS NECU DEFINISATI VALIDATIONS ZA price
  // VEC CU DODATI validateRequest MIDDLEWARE
  validateRequest,
  //
  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };

```

PROSAO MI JE TEST ZA VALIDNOST title-A

## DA DODAM I MIDDLEWARES ZA VALIDEATING price-A

ZASTO OVO RADIM SADA U ODVOJENOM NASLOVU

ZATO STO ZELIM DA TI OBJASNIM DA price OBICNO TREBA DA IMA DECIMALE, ODNOSNO DA BUDE FLOAT, JER SE TAKO CEN PREDSTAVLJAJU, ISTO TAKO ON NE SME DA BUDE NEGATIVAN

- `code tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";

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
    // DODAJEM OVO
    // price MOZE DA BUDE FLOATING POINT, VECI OD NULA
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };

```

POGLEDAO SAM SADA TESTS, I PROSAO JE TEST ZA price FIELD VALIDATION

**MEDJUTIM TI KADA SEND-UJES NE DECIMALNE BROJEVE (PRONADJI U TESTOVIMA, GDE SAM TO SLAO, TEBI CE TEST PROLAZITI. DAKLE PASS-OVACE), NEMA VEZE STO SI TI PODESIO isFloat**

**PREDPOSTAVLJAM DA JE TO UKLUCIVO, ODNOSNO AKO SE NAPISE BRO JSA DECIMALO DA CE ON BITI VALID**


