# ENABLING `cookie-session` ONLY OVER HTTPS

U `auth` MICROSERVICE-U, RANIJE SMO DISABLE-OALI DA `cookie-session` MIDDLEWARE SETT-UJE COOKIE ONLY OVER HTTPS

SADA IMAMO SSL, I MOZEMO OPET VRATITI TU OPCIJU, DA JE HTTPS REQUIRED, KADA SE SETT-UJE COOKIE

- `code auth/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";

import { errorHandler, NotFoundError } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    // EVO VRATILI SMO OVU OPCIJU
    // STO ZNACI DA CE BITI true, SAMO KADA NISMO
    // U TEST ENVIROMENT-U
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
```

MOZES OVO SADA DA COMMIT-UJES, ODNOSNO DA ODRADIS CEO ONAJ PROCES OD MAKINGA PULL REQUESTA PA DO MERGINGA TOG PULL REQUEST-A ,KAKO BI SE IZMEDJU OSTALOG REBUILD-OVAO IMAGE I APPLY-OVAO NA ODGOVARAJUCI POD CLUSTERA

