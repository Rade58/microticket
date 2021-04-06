# signin FLOW

DAAKLE JA SAM ZAVRSIO SA signup LOGIKOM, A SADA CU DA SE POZABAVIM SA SIGNIN

ZA SADA JE TAJ ROUTER SAMO BAREBONES KOJI NISTA NE SALJE NAZAD

- `cat auth/src/routes/signin.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signin", (req, res) => {});

export { router as signInRouter };
```

