# ASYNC ERROR HANDLING

JA SAM DEFINISAO SAV ERROR HANDLING, ALI AKO POKUSAM DA KORISTIM async/await; DA REDEFINISEM HANDLER/E CODE CE MI BREAK-OVATI

EVO POKUSACU SADA DA HANDLER KOJI MATCH-UJE SVE `api/users/**` (MATCH-UJE SVE OSTALO STO NISU ONI DRUGI WELL DEFINED ROUTES), POSTANE ASYNC FUNKCIJA

EVO

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

// EVO OVO JE SADA ASYNC FUNKCIJA
app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
```

PREDPOSTAVLJAM DA CE SE OVDE DESITI PROMISE BASED ERROR

TO JE ONAJ ERROR `UnhandledPromiseRejectionWarning`

**EVO AKO NISI PKRENUO skaffold, POKRENI GA `skaffold dev`**

I POKUSAJ DA POSALJES REQUEST KA POMENUTOM ENDPOINT-U

- `http http://microticket.com/api/users/randomthing`

OVAJ REQUEST CE HANGOVATI (I NA KRAJU CE BITI `http: error: Request timed out (30s).`)

**ALI ONO STO CES VIDETI U SKAFFOLD-OVOM TERMINALU (AKO SI ZABORAVIO TAMO CE BITI I LOGS IS POD-A U KOJEM RUNN-UJE TVOJ NODEJS APP, A U OVOM SLUCAJU TO CE BITI LOGS, ENDPOINT-A KOJEG SAM MALOCAS HITT-OVAO)**

```zsh
[auth] (node:25) UnhandledPromiseRejectionWarning: Error: Route Not Found!
[auth]     at NotFoundError.CustomError (/app/src/errors/custom-error.ts:5:5)
[auth]     at new NotFoundError (/app/src/errors/not-found-error.ts:7:5)
[auth]     at /app/src/index.ts:22:9
[auth]     at step (/app/src/index.ts:33:23)
[auth]     at Object.next (/app/src/index.ts:14:53)
[auth]     at /app/src/index.ts:8:71
[auth]     at new Promise (<anonymous>)
[auth]     at __awaiter (/app/src/index.ts:4:12)
[auth]     at /app/src/index.ts:21:29
[auth]     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)

```

# DAKLE, STO SE TICE EXPRESS-A, JASNO TI JE DA THROWN ERROR U ASYNC REQUEST HANDLERU, NECE SIGURNO BITI PASSED INTO SOME MIDDLEWARE, I U MOM SLUCAJU NIJE STIGAO DO MOG ERROR HANDLING MIDDLEWARE-A

TO JE ZATO STO ASYNC FUNKCIJA RETURN-UJE `Promise`

# MEDJUTIM AKO ZELIS DA TAJ ERROR STIGNE GDE ZELIS, MORAS G EKSPLICITNO POSLATI, KORISCENJEM `next` FUNKCIJE

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

// OVO JE I DALJE async ALI SADA KORISTIM I next
app.all("*", async (req, res, next) => {
  // DAKLE OVDE MI NECEMO THROW-OVATI ERROR
  // throw new NotFoundError();
  // UMESTO TOGA CEMO DA POSALJEMO ERROR SA next
  next(new NotFoundError());
});

// GORNJE ERROR CE DAKLE SADA BITI PASSED INTO ERROR HANDLINF MIDDLEWARE
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
```

**MOZES SADA OVO DA TESTIRAS**

- `http http://microticket.com/api/users/randomthing`

```zsh
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 37
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Mar 2021 20:11:58 GMT
ETag: W/"25-lSK/pgFV55boVBJ/uMYaXuY72jg"
X-Powered-By: Express

{
    "errors": [
        {
            "message": "Not Found!"
        }
    ]
}
```

# MEDJUTIM AUTOR WORKSHOPA MRZI DA KORISTI `next` I ZATO ZELI DA MI POKAZE WORKOROUND, DO KOJEG CU DOCI KADA INSTALIRAM I UPOTREBIM JEDAM MODUL

- `cd auth`

- `yarn add express-async-errors`

**MEDJUTIM OVO JE ZA MENE POTPUNO NEINTUITIVNO, ALI HAJDE DA GA ISPROBAM**

- `code auth/src/index.ts`

```ts
import express from "express";
// EVO UVOZIM PAKET NA OVAKAV NACIN
import "express-async-errors";
// 
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);


app.all("*", async (req, res, next) => {
  // I SAM OZBOG KORISCENJA GORNJEG PAKETA
  // JA SMEM THROW-OVATI
  throw new NotFoundError();
});

// ODNOSNO ERROR CE BITI IPAK PASSED DO ERROR HAADLING 
// MIDDLEWARE-A
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});

```

STO MOGU SADA I TESTIRATI

- `http http://microticket.com/api/users/randomthing`

```zsh
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 37
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Mar 2021 20:11:58 GMT
ETag: W/"25-lSK/pgFV55boVBJ/uMYaXuY72jg"
X-Powered-By: Express

{
    "errors": [
        {
            "message": "Not Found!"
        }
    ]
}
```

KAO STO VIDIS FUNKCIONISE

## DAKLE SADA TI MOZES DA IDES I U DRUGE HANDLERE I KOSRISTIS async/await; I SMECES DA THROW-UJES

SAMO MAKE SURE TO IMPORT, POMENUTI PAKET (`express-async-errors`), ODMAH POSLLE express UVOZA

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
// EVO UVEZAO SAM PAKET
import "express-async-errors";
//
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

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
  // I OVO MOZE BITI async
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // I SMEM DA THROW-UJEM ERRORS, I ZNAM DA CE ONE
      // ZAVRSITI INSIDE ERROR HANDLING MIDDLEWARE, BAS
      // KAO DA SAM IH PASS-OVAO KROZ next
      throw new RequestValidationError(errors.array());
    }

    console.log("Creating a new user...");

    throw new DatabseConnectionError();

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };

```

**DA TESTIRAM I OVO**

- `http POST http://microticket.com/api/users/signup email="stavros@mail.com" password="SomeCool1"`

```zsh
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 59
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Mar 2021 20:40:39 GMT
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

- ` http POST http://microticket.com/api/users/signup email="stavros" password="SomeCool1"`

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 63
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Mar 2021 20:40:49 GMT
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

DAKLE I U OVOM SLUCAJU JE EVERYTHING WORKED, ODNOSNO BILO MI JE DOZVOLJENO DA IZ HANDLERASYNC HANDLER-A THROW-UJEM ERROR, TAKO DA ON STIGNE DO INSIDE ERROR HANDLING MIDDLEWARE-A
