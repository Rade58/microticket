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
