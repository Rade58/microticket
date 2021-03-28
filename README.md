# SKAFFOLDING ROUTES

ISTO KAO STO SAM URADIO U `auth/src/routes/current-user.ts`   PRAVIM ISTU STRUKTURU I U OSTALIM FILE-OVIMA, GDE IMAM ROUTER TO ONE ROUTE ODNOS

SAMO STO SADA PAIS KOJI METHOD KORISTIS (ZA SVE OSTALE ROUTE-OVE KORISTI SE `POST`)

- `code auth/src/routes/signin.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signin", (req, res) => {});

export { router as signInRouter };

```

- `code auth/src/routes/signout.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signup", (req, res) => {});

export { router as signUpRouter };
```

- `code auth/src/routes/signup.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signup", (req, res) => {});

export { router as signUpRouter };

```

# MOZEMO DA ASSOCIATE-UJEMO OVE ROUTERE SA NASIM EXPRESS APPOM

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
// IMPORTUJEMO
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";

const app = express();

app.use(json());

app.use(currentUserRouter);
// ASSOCIATE-UJEMO OSTALE ROUTER-E
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
```


