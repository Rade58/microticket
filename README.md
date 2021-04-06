# signin FLOW

DAAKLE JA SAM ZAVRSIO SA signup LOGIKOM, A SADA CU DA SE POZABAVIM SA SIGNIN

ZA SADA JE TAJ ROUTER SAMO BAREBONES KOJI NISTA NE SALJE NAZAD

- `cat auth/src/routes/signin.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signin", (req, res) => {});

export { router as signInRouter };
```

# OVO CE BITI SIGNIN FLOW, KOJI CU DEFINISATI

1. SA CLIENTA (Nextjs APP) SE SALJE REQUEST PREMA `/api/users/signin`

ONO STO S SALJE U REQUESTU JE `{emai, password}`

A HANDLER TREBA DA

- PROVERI DA LI USER SA TAKVIM EMAIL-OM POSTOJI

- AKO USER NE POSTOJE, TREBA RESPOND-OVATI SA ERROR-OM

- AKO POSTOJI, TREBA SE COMPARE-OVATI SUPPLIED PASSWORD S STORED PASSWORDOM (UTILITY METODE ODNOSNO KLASU SAM VEC PODESIO U `auth/src/utils/password.ts`)

- AKO JE PASWORD THE SAME, SVE JE U REDU

- USER JE ONDA CONSIDERED TO BE LOGGED IN I SALJE MU SE GENERATED JWT

2. SA RESPONSE-OM TREBA SLATI SA HEADEROM `Set-Cookie` CIJA VREDNOST TREBA DA BUDE OBJEKAT `{jwt: <GENERATED JSON WEB TOKEN>}` (**STO NARAVNO RADIM, UZ KORISCENJE PAKETA `cookie-session`, JIJU SAM LOGIKU VEC DEFINISAO INSIDE `auth/src/index.ts`**)

# DEFINISEM `/signup` HANDLER

- `code auth/src/routes/signin.ts`

```ts
import { Router, Request, Response } from "express";
// UVOZIM MONGOOSE MODEL
import { User } from "../models/user.model";
// JSON WEB TOKEN
import { sign } from "jsonwebtoken";
// UVOZIM METODU KOJA TREBA DA DEHASH-UJE PASSWORD

// OPET CEMO VALIDIRATI PASSWORD SA PAKETOM express-validator
import { body, validationResult } from "express-validator";

// VALIDATION ERROR
import { RequestValidationError } from "../errors/request-validation-error";

import { Password } from "../utils/password";
//

const router = Router();

router.post(
  "/api/users/signin",
  [
    // KORISTIM body FUNKCIJU KOJU POZIVAM KAO MIDDLEWARE
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password")
      .trim() // sanitization
      // NE MORAM DA STAVLJAM VLIDATION ZA REQUREMENT PASSWORD-A U POGLEDU
      // MINIMALNOG I MAKSIMALNOG BROJA KARAKTERA, JER OGUCI SU ERRORI, KADA BI MENJAO
      // TAJ ISTI REQUREMENT PRI SIGNUP-U (DESI SE DA ZBOG TOGA USERS AZVRSE LOCKED OUT OF THEIR ACCOUNTS)
      .notEmpty() // SAMO JE BITNO DA MORAJU SUPPLY-OVATI KARAKTERE ZA PASSWORD
      .withMessage("You must supply password!"),
  ],
  async (req: Request, res: Response) => {
    // OVO JE DEO VALIDDATION-A (NASTAVAK ONOOGA STO JE URADJENO VALIDATION MIDDLEWARE-OM)
    const errors = validationResult(req);
    // AKO POSTOJE ERRORI KOJI SU VALIDATION ERRORS, SALJES ERROR KOJI SAM DAVNO NAPRAVIO
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());

    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    // AKO NEMA USER-A THROW-UJEM ERROR
    if (!user) throw new Error("user email doesn't exist");

    const passwordIsMatching = await Password.compare(user.password, password);

    // AKO SE PASSWORDI NE MATCH-UJU THROW-UJEM ERROR
    if (!passwordIsMatching) throw new Error("Wrong password");

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    // SETTUJEM TOKEN (BICE INTERCEPTED AND SERIAIED BY cookie-session)
    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };

```


