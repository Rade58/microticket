# BUILDING ERROR HANDLING MIDDLEWARE

PRVO CU NAPRAVITI FOLDER ZA MIDDLEWARES, U MOM JEDINOM MICROSERVICE-U

- `mkdir auth/src/middlewares`

I KREIRAM JEDAN FILE

- `touch auth/src/middlewares/error-handler.ts`

REQUIREMENT JE DA TO BUDE FUNKCIJA KOJA RECEIVE-UJE 4 ARGUMENT-A:
- error (UVEK JE TO `Error` INSTANCA )
- request
- response
- next FUNKCIJA

```ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // NAS POSAO OVDE JESTE DA POGLEDAMO Error KOJI SE OCCUR-OVAO
  // ONDA MORAMO DA FORMATIRAMO INFORMATION INSIDE
  // I DA RESPOND-UJEMO ONOME KO JE MAKE-OVAO REQUEST, KORISCENJEM
  // res OBJEKTA
  // NUMBER ONE GOAL INSIDE THIS ERROR HANDLER JESTE DA UVEK SEND-UJEMO BACK
  // VEOMA CONSISTENT STRUCTURED MESSAGE
  // JER KAKO SM VEC REKAO NE ZELIM DA MOJA BUDUCA REACT APLIKACIJA
  // BUDE U MUCI A FIGURE-UJE OUT HOW TO HANDLE-UJE 30 RAZLICITIH
  // KINDS OF ERRORS

  // ZA SADA CU SAMO CONSOLE LOG-OVATI ERROR

  console.log("Something went wrong", err);

  res.status(400).send({
    message: "Something went wrong",
  });

  // A U BUDUCNOSTI CU JA PREDUZETI ONE KORAKE KOJE SAM ZAPISAO
};

```

# WIRE-OVACU OVAJ ERROR MIDDLEWARE TO OUR APPLICATION

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
//
import { errorHandler } from "./middlewares/error-handler";
//

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

//
app.use(errorHandler);
//

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});

```

**SADA AKO I JEDAN OD ROTERA (TACNIJE RECENO HANDLERA TIH ROUTER-A), KOJE SAM POVEZAO IZNAD POVEZIVANJA ERROR HANDLER MIDDLEWARE; THROW-UJE ERROR, TAJ ERROR CE BITI DOSTUPAN U ERROR HANDLER MIDDLLEWARE-U**

# TAKO DA SADA UMESTO STO SALJEM ERROR MESSAGES, KAKVE JE STRUKTURISALA UPOTREBA PAKETA `express-validator`, JA CU DA THROW-UJEM ERROR, DA BI ONDA THROWN ERROR MOGAO HANDLE-OVATI INSIDE ERROR HANDLER MIDDLEWARE-A

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";

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
      // UMESTO STO SAM URADIO OVAKO
      // return res.status(400).send(errors.array());
      // THROW-OVACU ERROR

      throw new Error("Invalid email or password");
      // DAKLE JA ZA SADA OVO THROW-UJEM, ALI U NEKOJ BUDUCNOSTI JA
      // CU CONSUME-OVATI errors OBJEKAT, KAKO BI UZEO DETAILD INGFO ABOUT
      // THE ERROR, ALI ZA SADA RADIM, KAKO SAM URADIO
    }

    console.log("Creating a new user");

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };

```

DOBRO SADA ZNAS DA CE TAJ ERROR BITI DOSTUPAN U ONOM ERROH HANDLER MIDDLEWARE-U

ALI HAJDE DA RAZMOTRIM JOS NESTO

# RECIMO DA IMAS DATBASE KOJI JE DOWN DOBAR PROCENAT VREMENA, I TI POKUSAVAS DA KREIRAS USER-A

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";

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
      throw new Error("Invalid email or password");
    }

    console.log("Creating a new user...");
    // EVO RECIMO DA TI JE OVDE ZAKAZAO DATABASE
    throw new Error("Error connecting to datbase");
    // NARAVNO NECCES TI THROW-OVATI ERROR KAO SADA VEC
    // CE SAMI PROCESS TO RADITI ,ALI LET'S ASUME
    // THT YOUR DATABASE IS DOWN
    //

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };

```

DAKLE ZNAS ZA JOS JEDAN PLACE GDE TVOJ CODE MIGHT FAIL

ALI NO MATTER WHAT YOU ARE CAPTURING THOSE ERROS INSIDE ERROR HANDLING MIDDLEWARE

**SAVE-OVAO SAM SVE OVO I SADA CU TESTIRATI**

# TESTIRAM SA HTTPIE AGAIN

NARAVNO MAKE SURE DA SI UPALIO SKAFFOLD (`skaffold dev`)

SALJEM INVALIDNI MAIL

- `http -f http://microticket.com/api/users/signup email=bronson password=Kameleonz`

EVO STA SI DOBIO

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 34
Content-Type: application/json; charset=utf-8
Date: Sun, 28 Mar 2021 21:16:21 GMT
ETag: W/"22-c40+vNnNNb1EeyjChXmbl7vKG3M"
X-Powered-By: Express

{
    "message": "Something went wrong"
}
```

DAKLE ERROR HANDLER MIDDLEWARE JE END-OVAO REQUEST SALJUCI TIJSON KOJ ISI STRUKTURISAO TAKO DA IMA message PROPERTI

TO SI I HTEO I URADIO

A SADA CU DAPOSALJEM NOVI REQUEST KOJI IMA OK EMAIL PASSWORD, ALI SECAS SE DA JE DATTABASE DOWN

- `http -f http://microticket.com/api/users/signup email="bronson@mail.com" password="kameleonzia"`

POSLAT JE ISTI ERROR MESSAGE

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 34
Content-Type: application/json; charset=utf-8
Date: Sun, 28 Mar 2021 21:19:24 GMT
ETag: W/"22-c40+vNnNNb1EeyjChXmbl7vKG3M"
X-Powered-By: Express

{
    "message": "Something went wrong"
}
```

**JEDINO ZATO STO SAM U ERROR HANDLER MIDDLEWARE-U STMAPAO ,`err` ARGUMENT TREBALO BI DA U SKAFFOLD TERMINALU VIDIM TAJ OUTPUT**

```zsh
# EVO VIDIS TU JE PRVI LOG, STAMPAO SAM GENERIC STUFF (Something went wrong)
# ALI SAM DALJE STMAPAO ERROR I TO JE `Invalid email or password`
[auth] Something went wrong Error: Invalid email or password
[auth]     at /app/src/routes/signup.ts:20:13
[auth]     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
[auth]     at next (/app/node_modules/express/lib/router/route.js:137:13)
[auth]     at middleware (/app/node_modules/express-validator/src/middlewares/check.js:16:13)
[auth] Creating a new user...
# A OVDE VIDIS DA JE Error connectiong to database
[auth] Something went wrong Error: Error connecting to datbase
[auth]     at /app/src/routes/signup.ts:25:11
[auth]     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
[auth]     at next (/app/node_modules/express/lib/router/route.js:137:13)
[auth]     at middleware (/app/node_modules/express-validator/src/middlewares/check.js:16:13)
[auth]     at processTicksAndRejections (internal/process/task_queues.js:93:5)


```

## DAKLE KLJUCNA STVAR OVDE JE DA SAM JA OSTVARIO TO DA IMAM CONSISTENT RESPONSE

BEZ OBZIRA KOJI JE ERROR U PITANJU
