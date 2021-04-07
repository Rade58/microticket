# `/signout` HANDLER

SIGNING OUT HANDLER BI TREBALO DA POSALJE HEADER KOJI CE RECI BROWSER- DA DUMP-UJE OUT SAV INFORMATION COKKIE-A 

OPET CU KORISTITI `cookie-session` LIBRARY

SAMO CU PODESITI DA JE `req.session = null`

- `code auth/src/routes/signout.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null;

  // POSLACEMO SAMO EMPTY OBJECT U RESPONSE-U
  res.send({});
});

export { router as signOutRouter };

```




