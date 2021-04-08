# REFACTORISEM MOJ `auth/src/index.ts`; I KREIRAM `auth/src/app.ts`; SVE U CILJU LAKSEG TESTRANJA

KREIRACU `app.ts` FAJL U MOM MICROSERVICE-U

- `touch auth/src/app.ts`

UZIMAS SVE ONO IZ index.ts OD CEGA CE ZAVISITI NAS EXPRESS, DAKLE,, SVI MIDDLEWARE-OVI I OSTALO

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

// OVO EXPORT-UJES ALI NA KRAJU UNUTAR OBJECT-A
const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: true,
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

// OVAKO MORAM DA EXPORT-UJEM
export { app };
```

## SADA DA REFAKTORISEM `auth/src/index.ts`

- `code auth/src/index.ts`

```ts
// UVOZIM app
import { app } from "./app";
// A OVO TREBA ZA DATABASE CONNECTION
import mongoose from "mongoose";

// OVO SVE NIJE POTREBNO
/* import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

// PODESENO ZBOG HTTPS I PAKETA cookie-session (DOSTA RANIJE)
app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler); */

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
  });
};

start();
```

**TO JE SAV REFACTORING KOJ ISAM TREBAO URADITI KAO PRIPREMU ZA TESTING**
