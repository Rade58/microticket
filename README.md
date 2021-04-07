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

- `touch auth/src/middlewares/require-auth.ts`

```ts
import { Request, Response, NextFunction } from "express";
// UVOZIM POMENUTI PAKET
import { NotAuthorizedError } from "../errors/not-authorized-error";
//

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
  if (!req.currentUser) {
    // UMESTO OVOGA
    // return res.status(401).send("Unauthorized");
    // THROW-UJEM ERROR
    throw new NotAuthorizedError();
  }

  next();
};

```

# SADA CEMO DA POVEZEMO GORNJI MIDDLEWARE, POVEZUJEMO GA ZA /current-user ROUTE

- `code auth/src/routes/current-user.ts`

```ts
import { Router } from "express";
import { currentUser } from "../middlewares/current-user";
// UVOZIM requreAuth MIDDLEWARE
import { requireAuth } from "../middlewares/require-auth";

const router = Router();

// DODAJEM requreAuth MIDDLEWARE, ALI VODI RACUNA DA
// GA DODAS NALON currentUser MIDDLEWARE-A
// JER ONO JE TAJ MIDDLEWARE, KOJI STAVLJA currentUser-A
// NA REQUEST, A requireAuth PROVERAVA DA LI JE USER TU
router.get("/api/users/current-user", currentUser, requireAuth, (req, res) => {
  res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };

```

## MOZEMO OPET DA IZVSIMO TEST, KORISCENJEM INSOMNIA-E

SAMO CEMO TRAZITI CURRENT USER-A (**UKLONI COOKIE, PRE OVOGA**)

PRAVIMO REQUEST PREMA

`https://microticket.com/api/users/current-user`

METHOD JE `GET`

DOBIJAMO DATA KOJI CE RECI DA NISMO AUTHORIZED, A DATA CE BITI U CONSISTEND FORMATU (OBJEKAT SA errors NIZOM SA OBJEKTIMA KOJI IMAJU message FIELD)

```json
{
  "errors": [
    {
      "message": "Not Authorized"
    }
  ]
}
```
