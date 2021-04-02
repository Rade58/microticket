# PROPPER ERROR HANDLING

DAKLE, AKO USER VEC POSTOJI, JA BI TREBAO DA THROW-UJEM ERROR

TAKAV FLOW SANM NAPRAVIO U MOM HANDLERU DA USTVARI THROW-UJEM ERRORS A NE KORISTIM next (AKO SE SECAS, ZBOG KORISCENJA `express-async-errors`)

SADA ZELIM DA NAPRAVIM TAJ CUSTOM ERROR KOJI CE USER-U DATI INFO DA JE IKORISTIO POGRESAN MAIL ZA SIGNUP

ALI OVO CE BITI POPRILICNO GENERIC ERROR, U KOJEM CU JA MOCI DA PASS-UJEM STRING O TOME STA NIJE U REDU, ZANCI DA JE NECU SAMO MORATI REUSE-OVATI SAMO KADA JE EMAIL ALREADY IN USE, VEC I ZA DRUGE MOGUCE GRESKE

USTVARI TO CE BITI ERROR KOJI CU THROW-OVTI ALL THE TIM, KADA JE U PITANJU ERROR, ZA KOJI NEMA POTREBE DA BUDE VISE OD NEKOG GENERAL USE CASE-A

## KREIRACU `BadRequestError` ERROR KLASU

- `touch auth/src/errors/bad-request-error.ts`

```ts
// UVOZIM ABSTRACT CLASS CustomError KOJU SAM RANIJE DAVNO NAPRAVIO
import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode = 400;
  public message: string;

  constructor(message: string) {
    super(message);

    this.message = message;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return {
      errors: [
        {
          message: this.message,
        },
      ],
    };
  }
}

```

# SADA CU DA THROW-UJEM GORNJI ERROR

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
// UVESCU POMENUTI ERROR
import { BadRequestError } from "../errors/bad-request-error";
//

import { User } from "../models/user.model";

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

  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const possibleUser = await User.findOne({ email })
      .select("-password") // NE TREBA MI password (MINUS PASSWORD)
      .exec();

    if (possibleUser && possibleUser.email) {
      // OVDE THROW-UJEM ERROR
      throw new BadRequestError("Email already in use!");
      // OVAJ ERROR CE NARAVNO BITI CATCH-ED INSIDE ERROR HANDLLING
      // MIDDLEWARE, KOJEG SAM DAVNO RANIJE KREIRAO I POVEZAO
      // DA STOJI IZA SVIH RAUTERA MOG auth MICROSERVICE-A
      // TAKO DA CE TAJ MIDDLEWARE SEND-OVATI ERROR DATA
      // CLIENT-U
    }

    const newUser = await User.create({ email, password });

    res.status(201).send({ email: newUser.email });
  }
);

export { router as signUpRouter };

```

# MOZES DA TESTIRAS TAKO STO CES POSLATI REQUEST SA EMAIL-OM KOJI JE ALREADY IN USE; ALREADY IN DATBASE

- `http POST http://microticket.com/api/users/signup email="stavros@mail.com" password="CoolStuff6"`

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 48
Content-Type: application/json; charset=utf-8
Date: Fri, 02 Apr 2021 14:19:57 GMT
ETag: W/"30-ttxB76vrBxqFmHwwPqi4wbWMXcA"
X-Powered-By: Express

{
    "errors": [
        {
            "message": "Email already in use!"
        }
    ]
}
```

I TO JE BIO OCEKIVANI RESPONSE
