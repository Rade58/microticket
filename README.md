# CRETING require-auth MIDDLEWARE

OVAJ MIDDLEWARE PRAVIM KAKO BI TAJ MIDDLEWARE, USTVARI SEND-OVAO ODGOVOR TO THE CLIENT DA JE U PITANJU AUTHORIZATIN ERROR (ODNOSNO SALJEMO UNUTHORIZED STATUS CODE (401) TO THE FRONT END), **ONDA KADA NA `req` OBJEKTU NEMA `currentUser` OBJEKTA, KOJEG INSERT-UJEMO SA DRUGIM MIDDLEWARE-OM (KOJEG SMO NAPRAVILI U PROSLOM BRANCH-U)**

DAKLE PRAVIMO NOVI MIDDLEWARE

- `touch auth/src/middlewares/require-auth.ts`

```ts
import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
  if (!req.currentUser) {
    return res.status(401).send("Unauthorized");
  }

  next();
};

```

# ALI ZAR NE BI BILO BOLJE DA NAPRAVIM CUSTOM ERROR

**ODNOSNO BOLJE JE DA GORNJI MIDDLEWARE 'DOBACI' ERROR DO `ERROR HANDLING MIDDLEWARE`-A PA DA SAMI ERROR MIDDLEWARE USTVARI IZVRSI SLANJE 'ERROROUS' RESPONSE-A SA CONSISTANT FORMATOM ERROR PORUKE, KAKO SAM U NJEMU I DEFINISAO**

DAKLE PRAVIM CUSTOM ERROR

- `touch auth/src/errors/not-authorized-error.ts`

```ts
import { CustomError } from "./custom-error"; // ovo je abstrct klasa

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  message = "Not Authorized";

  constructor() {
    super("Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return {
      errors: [{ message: this.message }],
    };
  }
}
```

# SADA MOZES DA REFAKTORISES require-auth MIDDLEWARE, KAKO BI THROW-OVAO `NotAuthorizeError` UMESTO DIREKTNOG LSLANJA RESPONSE-A

