# MOVING LOGIC INTO ERRORS

JASNO TI JE DA SA OVAKVIM NACINOM, TEBI CE ERROR HANDLING MIDDLEWARE IMATI TONU CODE-A; U SLUCAJU KADA BUDEM PRAVIO MORE AND MORE ERROR KLASA

- `cat auth/src/middlewares/error-handler.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    const formattedErrors = err.errors.map(({ msg, param }) => {
      return {
        message: msg,
        field: param,
      };
    });

    return res.status(400).send({
      errors: formattedErrors,
    });
  }

  if (err instanceof DatabseConnectionError) {
    // DODAO OVO
    res.status(500).send({
      errors: [{ message: err.reason }],
    });
  }

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};

```

**ZATO JA ZELIM DA SVU LOGIKU PREBACIM U ERROR CLASSES**

# DAKLE ZELIM DA ERROR CLASS-E IMAJU I INFO STATUS CODE-U, A I DA IMAJU METODU, KOJOM SE SERIALIZE-UJE ERROR; ZELIM DA SE SA ERROR INSTANCI MOZE UZETI ONAJ CONSISTANT DATA OBJECT

DAKLE ZADAJEM METODU NA ERRPR CLASS-I, A TA METDA CE SE ZVATI `serializeError` I ONA CE RADITI FORMTTING ERROR-A UNDER THE HOOD

- `code auth/src/errors/request-validation-error.ts`

```ts
import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  public errors: ValidationError[];
  // STATUS CODE
  public statusCode = 400;

  constructor(errors: ValidationError[]) {
    super();
    this.errors = errors;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  // EVO JE METODA
  public serializeError() {
    const formattedErrors = this.errors.map(({ msg, param }) => {
      return { message: msg, field: param };
    });

    return formattedErrors;
  }
}

```

- `code auth/src/errors/database-connection-error.ts`

```ts
export class DatabseConnectionError extends Error {
  public reason = "Error connecting to the database";
  // STATUS CODE
  public statusCode = 500;

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }

  // EVO JE METODA
  public serializeError() {
    return {
      errors: [{ message: this.reason }],
    };
  }
}

```

# SADA OSTAJE SAM ODA UPOTREBIS statusCode PROPERTI I serializeError METODU SA ERROR INSTANCI, KOJE SU CATCHED U ERROR HANDLING MIDDLEWARE-U

- `code auth/src/middlewares/error-handler.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    // UMESTO SVEGA OVOGA

    /* const formattedErrors = err.errors.map(({ msg, param }) => {
      return {
        message: msg,
        field: param,
      };
    });

    return res.status(400).send({
      errors: formattedErrors,
    }); */

    // OVO
    return res.status(err.statusCode).send(err.serializeError());
  }

  if (err instanceof DatabseConnectionError) {
    // UMESTO OVOGA
    /* res.status(500).send({
      errors: [{ message: err.reason }],
    }); */
    // OVO
    return res.status(err.statusCode).send(err.serializeError());
  }

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};

```

**DA TESTIRAM SA HTTPIE**

- `http POST http://microticket.com/api/users/signup email=stavros@mail.com password=CoolAddam2`

```zsh
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 59
Content-Type: application/json; charset=utf-8
Date: Tue, 30 Mar 2021 18:44:22 GMT
ETag: W/"3b-yr3OuAnPQ7xOD/diGb4RbVds4Ug"
X-Powered-By: Express

{
    "errors": [
        {
            "message": "Error connecting to the database"
        }
    ]
}
```

- `http POST http://microticket.com/api/users/signup email=nick.dev password=CoolAddam2`

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 63
Content-Type: application/json; charset=utf-8
Date: Tue, 30 Mar 2021 18:43:40 GMT
ETag: W/"3f-Ea3sCFIemsWJbk0K4sNIgJ/rqdA"
X-Powered-By: Express

{
    "errors": [
        {
            "field": "email",
            "message": "Email must be valid!"
        }
    ]
}

```
