# CREATING NEW CUSTOM ERROR

IDEJA MI JE DA DODAM ERROR KOJI CE BITI THROWN KADA KORISNIK REQUEST-UJE ROUTE, KOJI NE POSTOJI

- `touch auth/src/errors/not-found-error.ts`

```ts
import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    super("Route Not Found!");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return { errors: [{ message: "Not Found!" }] };
  }
}

```

# SADA MOZES KORISTITI GLOB PATTERN, DA NAPRAVIS ROUTE HANDLER, KOJI CE BITI HITTED SVAKI PUT, KADA TVOJI DRUGI HANDLERI SA WELL DEFINED ROUTE-OVIMA NISU HITTED; `ALI PORED TOGA TI CES OVAJ HANDLER ZADATI ZA SVE METOTE: GET, POST I OSTALE, KORISCENJEM all`

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
// EVO UVOZIM, MOJ NOVI CUSTOM ERROR
import { NotFoundError } from "./errors/not-found-error";
//

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

// EVO OVDE PRAVIM HANDLER-A, KOJI CE BITI HITTED,
// KADA KORISNIK UNESE BILO STA, A DA TO NE BUDE MATCHED SA
// GORNJIM ROUTERIMA
app.all("*", (req, res) => {
  // SADA CU SAM OTHROW-OVATI MON NOVI CUSTOM ERROR
  throw new NotFoundError();
});
//

// A TAJ ERROR CE BITI CACHED OD STRANE
// NASEG ERROR HANDLER MIDDLEWARE-A, KOJEG SAM NAPRAVIO
// DAVNO RANIJE, I POVEZAO OVDE DAVNO RANIJE, I KOJI CE U ODNOSU NA GORNJI ERROR
// POSLATI ODGOVARAJUCI DATA KORISNIKU, ALI
// KAO STO SAM TI TI VEC MNOGO PUTA REKAO
// DATA KOJ ISE SALJE JE CONSISTENT
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});

```




