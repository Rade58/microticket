# SUBCLASSING FOR CUSTOM ERRORS

REKAO SAM U PROSLOM BRANCH-U DA CU SADA NAPRAVITII DVE NOVE KLASE, KOJE CE EXTEND-OVATI `Error` BUILT-IN CLASS

KLASE KOJE PRAVIM IMACE IMENA `RequestValidationError` I `DatabaseConnectionError`

- `mkdir auth/src/errors`

- `touch auth/src/errors/{request-validation-error,database-connection-error}.ts`

JA CU IZGLEDA KORISTITI ValidationError TYPE, KOJA DOLAZI IZ `express-validator`, KAKO BI TYPE-OVAO ARGUMENTE KONSTRUKTORA

- `code auth/src/errors/request-validation-error.ts`

```ts
import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super();
    this.errors = errors;

    // NE ZNAM DA LI JE OVO SUVISNO ILI NE, ALI AUTOR WORKSHOP-A
    //  JE OVO STAVIO

    // ZADAO JE DA PROTOTIP OVE KLASE KOJU BUILD-UJEM UPRAVO Error
    // NE ZNAM ZASTO JE OVO MORALO, ALI ON KAZE DA JE TO
    // SAMO ZATO STO SE extend-uje BUILT IN CLASS
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    // NIJE MI JASNO OVO GORE JER JA VIDIM CIRCULAR REFERENCE
    // MEDJUTIM AUTOR WORKSHOPA JE REKAO DA JE TO SAM OZATO STO
    // EXTEND-UJEM BUILT IN CLASS
  }
}
```

SADA CU DA KREIRAM I DRUGU ERROR KLASU

- `code auth/src/errors/database-connection-error.ts`

```ts
export class DatabseConnectionError extends Error {
  public error = "Error connecting to the datbase";

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }
}

```

## SADA CU DA THROW-UJEM INSTANCE GORNJIH ERROR KLASA INSIDE OUR EXPPRESS HADLER

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
// UVOZIM POMENUTE KLASE
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
//

const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid!"),

    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Pssword must be valid"),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // UMESTO SVEGA OVOGA
      /* const error = new Error("Invalid email or password");
      error.reasons = errors.array();
      throw error; */

      // RADIM OVO
      throw new RequestValidationError(errors.array());
      //
    }

    console.log("Creating a new user...");

    // UMESTO OVOGA
    // throw new Error("Error connecting to datbase");
    // RADIM OVO
    throw new DatabseConnectionError();
    //

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };

```

**POZNATO TI JE CE I DALJE ERROR BITI CACHED U ERROR HANDLER MIDDLEWARE KOJI SI RANIJE NAPRAVIO I POVEZAO (I TU NISTA NIJE SPORNO)**, `ALI TI SADA MOZES U ODNSU NA TO KOJA JE ERROREUS INSTANCA U PIITANJU DA SALJES DIFFERENT DATA TO THE USER`

## DAKLE TI, FROM INSIDE ERROR HANDLING MIDDLEWARE, VISE NE MORAS DA SALJES GENERIC MESSEAGE TO THE CLIENT; VEC U ODNOSU NA TO KOJA JE ERROR INSTANCA U PITANJU DA SALJES DATA ABOUT THE ERROR, ALI DA TI TAJ ERROR DATA BUDE IPAK CONSISTANT

- `code auth/src/middlewares/error-handler.ts`

```ts
import { Request, Response, NextFunction } from "express";
// UVOZIM ERROR KLASE
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
//

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // SADA RADIM TYPE CHECKS
  if (err instanceof RequestValidationError) {
    console.log("handling this error as request validation error");
    // ZA SADA NISTA NE STAVLJAM OVDE
    return res.status(400).send({});
  }

  if (err instanceof DatabseConnectionError) {
    console.log("handling this error as datbase connection eror");

    // ZA SADA NISTA NE STAVLJAM OVDE
    return res.status(400).send({});
  }

  res.status(400).send({
    message: err.message,
  });
};

```

TI OVO SADA MOZES I DA TESTIRAS, ODNOSNO MOZES DA POKTRENES SKAFFOLD AKO VEC TO NISI URADIO, I ONDA MOZES DA SALJES REQUESTS I VIDIS STA CE SE STAMPATI U KONZOLI SKAFFOLD-A

SALJES JEDAN OK REQUEST (KAKO BI SE DESIO EROOR VEZAN ZA DATBASE), I DRUGI REQUEST VEZAN ZA POGRESNU VALIDACIJU (POGRESAN FORMAT ILI ODSUSTVO ZA email ILI password DIELD-OVA)

- `http POST http://microticket.com/api/users/signup email=someone@mail.com password=Alien8`

U TERMINALU SKAFFOLDA VIDIM DA SE STMAPALO: *"handling this error as datbase connection eror"*

- `http POST http://microticket.com/api/users/signup email=someone password=Alien8`

U TERMINALU SKAFFOLDA VIDIM DA SE STMAPALO: *"handling this error as request validation error"*

**OSTAJE TI SADA DA DEFINISES TO DA TI RESPONSE POSLAT CLINET-U BUDE CONSISTENT, DA TO BUDE UVEK OBJEKAT SA NIKIM CONSISTENT PROPERTIJIMA**

## KAKVA STRUKTURU BI MI IZABRALI DA TO BUDE STRUKTURA ONOGA STO SALJEMO SA RESPONSE-OM IZ ERROR HANDLING MIDDLEWARE-A

EVO KAKVOG TIPA TREBA DA BUDE TAJ OBJEKAT (MAKES SENSE)

```ts
interface {
  errors: {
    message: string;
    field?: string;
  }[]
}
```
