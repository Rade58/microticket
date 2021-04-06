# ACCESSING ENV VARIABLES IN A POD

U PROSLOM BBRANCH-U NAPRAVIO SAM CONFIG (ODNONO DEO CONFIG-A DEPLOYMENT-A), KOJI JE DAO INSTRUKCIJU, DA SE UZME SECRET OBJECT BY HIS NAME, I DA SE IZ NJEGA PROCITA KEY VALUE PAIR I DA SE TJ ISTI LOAD-UJE U CONTAINER MOG MICROSERVICE-A (auth MICROSERVICE, JER JEDINOG NJEGA TRENUTNO IMAM)

**S TIM STO SAM DEFINISAO IME ZA ENVIROMENT VARIABLE, KOJA CE U CONTAINERU IMATI VREDNOST, KOJU IMA TAJ SECRET-OV KEY**

SADA MOZES NESMETANO DA KORISTIS TU ENV VARIABLE-U INSIDE YOUR CODEBASE

MOJA VARIJABLA SE ZOVE `JWT_KEY` AKO SE SECAS A I SAM MOZES PROVERITI INSIDE `infra/k8s/auth-depl.yaml`

**U TVOM NODEJS CODEBASE-U, ACCESS-UJES SE PREKO `process.env`**

STO ZNACI DA CES NJENU VREDNOST ISKORISTITI KADA REFERENCIRAS `process.env.JWT_SECRET`

## ODMAH CEMO DA UPOTREBIMO OVU ENV VARIABLE-U, GDE JE TO I POTREBNO

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { sign } from "jsonwebtoken";

import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";

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
      .select("-password")
      .exec();

    if (possibleUser && possibleUser.email) {
      throw new BadRequestError("Email already in use!");
    }

    const newUser = await User.create({ email, password });

    const userJwt = sign(
      { email: newUser.email, id: newUser._id },
      // EVO REFERENCIRAO SAM ENVIROMENT VARIABLU
      // CIJA JE VREDNOST MOJ SECRET SIGNING KEY
      process.env.JWT_KEY as string
    );

    req.session = {
      jwt: userJwt,
    };

    res
      .status(201)

      .send({ email: newUser.email });
  }
);

export { router as signUpRouter };

```

# MEDJUTIM DOBRA PRAKSA JE DA TI PROVERIS DA LI SI ZADAO ENV VARIABLES, JER AKO NISI TI BI TREBAO DA TERMINATE-UJES I POKRETANJE TVOG EXPRESS SERVER-A

TO RADIS JER TI JE JASNO DA SU ENV VARIABLLES TU SA RAZLOGOM I DA UVEK PREDSTAVLJAJU NEKE IMPORTANT KLJUCEVE, I ZATO NE BI TREBAL ODA PKRECES BILO STA AKO TI NEKA VARIJABLA NEDOSTAJE, TO MOGU BITI I SILNI API KEY-OVI, NA PRIMER ZA PAYMENT SISTEM ILI ZA NEKI DRUGII API

ZATO JE DOBRO DEFINISATI USLOVNE IZJAVE KOJE THROW-UJU ERRORS

- `code auth/src/index.ts`


```ts

```
