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
