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





