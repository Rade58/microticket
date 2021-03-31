# VERIFYING CUSTOM ERRORS

MOGAO SAM OVO DA OBAVIM TAKO STO BI KREIRAO JEDAN INTRFACE

```ts
interface CustomError {
  statusCode: number;
  serializeErrors(): {
    message: string;
    field?: string; 
  }[]
}

// I TAJ INTERFACE BI ONDA BIO IMPLEMENTED LIKE THIS

class SomeErrorClass extends Error implements CustomError {
  ...
}
```

**ALI JA OVO GORE NECU IPAK ODRADITI**

# JA CU NAPRAVITI ABSTRACT CLASS

TREBA O NJIMA (ABSTRACT CLASS-AMA) DA ZNAS DA:
- NE MOGU SE INTATIATE-OVATI
- SLUZE ZA SETTING REQUIREMENTS-A ZA UBLASS-U
- KREIRAJU KLASU KOJA TRANSPILED U JAVASCRIPT; **I ZBOG TOGA SE MOZE KORISTITI U `instanceof` IZJAVI** (DOK INTERFACE-OVI NE POSTOJE UOPSTE U JAVASCRIPT-U)

- `touch auth/src/errors/custom-error.ts`

```ts
export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor() {
    super();

    Object.setPrototypeOf(this, CustomError);
  }

  abstract serializeErrors(): { errors: { message: string; field?: string }[] };
}

```

# MODIFIKOVACU MOJE CUSTOM ERROR KLASE DA BI EXTEND-OVALE `CustomError`

- `code auth/src/errors/request-validation-error.ts`

```ts
import { ValidationError } from "express-validator";
//
import { CustomError } from "./custom-error";
//

export class RequestValidationError extends CustomError {
  public errors: ValidationError[];
  public statusCode = 400;

  constructor(errors: ValidationError[]) {
    super("Error connecting to DB");
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

- `code auth/src/errors/database-connection-error.ts`

```ts
import { CustomError } from "./custom-error";

export class DatabseConnectionError extends CustomError {
  public reason = "Error connecting to the database";
  public statusCode = 500;

  constructor() {
    super("Invalid request params");

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }

  public serializeErrors() {
    return {
      errors: [{ message: this.reason }],
    };
  }
}
```

# SADA UMESTO DA U ERROR HANDLER MIDDLEWARE-U CHECK-UJEM DA LI JE NESTO INSTANCA SVAKE ERROR KLASE PO NA OSOB, JA CU IMATI SAMO JEDNU USLOVNU IZJAVU KOJA CE PROVERAVATI DA LI JE NESTO INSTANCA `CustomError` KLASE

- `code auth/src/middlewares/error-handler.ts`

UPRAVO TI ZATO ABSTRACT CLASS ODGOVARA JER CE POSTOJATI AT RUNTIME, JER CE BITI JAVASCRIPT AT RUNTIME

```ts
import { Request, Response, NextFunction } from "express";
/* import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error"; */
// OVA DVA GORNJA ERROR-A MI NISU NI POTREBNA ZA TO SAM IH COMMENT-OVAO OUT
// A OVO SAM UVEZAO
import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // UMESTO DVE USLOVNE IZJAVE

  /* if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  if (err instanceof DatabseConnectionError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  } */

  // IMAM SAMO JEDNU
  if (err instanceof CustomError) {
    res.status(err.statusCode).send(err.serializeErrors());
  }
  //

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};
```

DAKLE OVAKAV PRINCIP ME SPASAVA OD POSTOJANJA MNOSTA IF STATMENTS-A KOJE BIH MORAO DA PRAVIM KAKO BI SEND-OVAO RESPONSE ZA SVAKI TIP ERROR-A PO NA OSOB
