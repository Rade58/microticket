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

# COMUINCATING MORE INFO INSIDE ERROR HANDLER MIDDLEWARE

DAKLE JA SADA IZ ERROR HANDLER MIDDLEWARE-A SEND-UJEM ERROR MASSAGE, KOJI JE PREVISE GENERIC, KOJI NE KOMIINICIRA A LOT OF FACTS TO THE CLIENT; TO JE `{message: "Something went wrong"}`

TREBALO BI DA URADIM BOLJI POSAO, UZIMAJUCI U OBZIR DA MI JE DOSTUPAN `err` PARMAETAR, ODNONO ERROR MESSAGE THROWN FROM THE HANDLER, ODNOSNO FROM THE MICROSERVICE ROUTE HANDLER

`err` ODNOSNO Error INSTANCA IMAS SVOJ `message` PROPERTI NNA SEBI; I ZTO JE BOLJE DA TO SALJEM DO CLIENT-A

- `code auth/src/middlewares/error-handler.ts`

```ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Something went wrong", err);

  res.status(400).send({
    // UMESTO OVOGA
    // message: "Something went wrong",
    // SALJEM OVO
    message: err.message,
  });
};

```

TO CE USER-U DATI VISE INFO O TOME STA JE WENT-OVALO WRONG

## TESTIRACU I OVO GORE, TAKO STO CU PRVO POSLATI REQUEST SA INVALID email-OM; PA ZATIM I REQUEST, U KOJEM CE NAS ZAMISLJENI DATBASE FAIL-OVATI

- `http POST http://microticket.com/api/users/signup email=someone password=Alien8`

SADA SI SEND-OVAO POTPUNO DRUGI MESSAGE

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 39
Content-Type: application/json; charset=utf-8
Date: Mon, 29 Mar 2021 12:57:10 GMT
ETag: W/"27-Mm37A2ls1bgL0/D8e3MSpDLbow8"
X-Powered-By: Express

{
    "message": "Invalid email or password"
}
```

- `http POST http://microticket.com/api/users/signup email=someone@mail.com password=Alien8`

I OVDE IMAS DRUGI MESSAGE

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 41
Content-Type: application/json; charset=utf-8
Date: Mon, 29 Mar 2021 12:58:47 GMT
ETag: W/"29-KI9TekVi0Fin/qEGBhJCJyJOKXA"
X-Powered-By: Express

{
    "message": "Error connecting to datbase"
}
```

# MEDJUTIM JA SALJEM, SAMO JEDAN STRING TO THE USER; TAJ MESSAGE PROPERTI; IDEALLY JA BIH SLAO VISE INFORMACIJA DO USER-A; ODNONO KADA THROW-UJES SAMI ERROR, TREBAS DA APPEND-UJES MORE INFORMATION

MOZES DA UPOREDIS ONO STA SI TI SLAO SA ONIM STA STA SALJE `expreess-validator` LIBRARY, U SLUCAJU KADA JE NESTO INVALID (KAO ERROR DATA OUTPUTUJE SE ARRAY SA OBJEKTIMA KOJI NA SEBI IMAJU `msg`; ZATIM IMA I INFO O IMENU INVALID FIELD-A, A TO JE PROPERTI `param` ,ZATIM SE OUTPUT I KOJA JE TA INVALID VALUE, U `value` PROPERTIJU) (GOVORIM O ARRAY-U OBJEKATA SA SVIM TIM FIELD-OVIMA)

DAKLE OPISANO JE, KOJI JE FIELD ILI PROPERTI FAIL-OVAO VALIDATION, ZATIM PROVIDEED JE MESSAGE O TOME WHAT WENT WRONG AND HOW TO FIX IT

MOZES ZAKLJUCITI DA JE TO DOSTA DETLJNIJI INFO NEGO ONO STO JA SADA SALJEM IZ ERROR HANDLER MIDDLEWARE-A, A TO JE SAMO `message` FIELD

KAD BI JA URADIO NESTO SLICNO KAO STO OUTPUTUJE TAJ `express-validator`, JEDAN ARRAY OF OBJECTS, SA WELL STRUCTURED OBJEKTIMA

# EVO GA JEDAN POSSIBLE SOLUTION, AKO KORISTIM SAMO PLAIN JAVASCRIPT; DAKLE AKO NE KORISTIM TYPESCRIPT

ZASTO GOVORIM DA JE OVO JAVASCRIPT RESENJE?

ZATO STO PLANIRAM DA DODAM PROPERTI NEKOM OBJEKTU KOJI NIJE TAKO TYPED; ODNOSNO NIJE PREDVIDJENO DA TA INSTANCA IMA PROPERTI KOJI JA OCU DA JOJ ADAM ON THE FLY

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
      // EVO UMESTO DA THROW-UJE SAMO ERROR
      // throw new Error("Invalid email or password");
      // U JAVASCRIPT LAND-U BI JA MOGO DA URADIM OVAKO NESTO

      // PRAVIM ERROR
      const error = new Error("Invalid email or password");
      // SADA DODAJEM NOVI PROPERTI NA TAJ ERROR
      // I ZADAJEM DA VALUE BUDE ONAJ ARRAY OF WELL STRUCTURED
      // JER  TAKAV DATASET PRUZA KORISCENJE express-validator
      error.reasons = errors.array();

      // I SADA THROW-UJEM DO EROOR HANDLING MIDDLEWARE-A
      throw error;
    }

    console.log("Creating a new user...");

    throw new Error("Error connecting to datbase");

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
```

**ALI OVO NE VALJA U TYPESCRIPT LAND-U, JER GORNJA ERROR INSTANCA NIJE TYPED TAKO DA IMA REQUIRED ILI OPTIONAL reasons PROPERTI, I TU CE TYPESCRIPT YELL-OVATI NA TEBE**

LEPO JE KADA IMAS CUUSTOM ERROR INSTANCU, ALI MORACU KORISTITI TYPESCRIPT PRINCIPE KADA DEFINISEM OVAKO NESTO

# ONO STO PRVO POMISLJAM JESTE DA NAPRAVIM CUSTOM ERROR CLASS-U, KOJA BI IMPLEMENTIRALA BUILT IN `Error` KLASU

DAKLE JA CU PRAVITI SUB CLASS ZA Error CLASS

NA PRIMER ZA MOJ SLUCAJ TREBA MI ERROR KLASA KOJA SE BAVI ERROROM U SLUCAJU VALIDATION GRESKE, I ERROROM KOJI SE BAVI SA GRESKOM DATBASE-A

NAZVACU SUBCLASSES OVAKO: `RequestValidationError` I `DatabaseConnectionError`

OVO CU URADITI U SLEDECEM BRANCH-U
