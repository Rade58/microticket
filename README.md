# INSTALLING MY `@ramicktick/common` LIBRARY INTO `auth` MICROSERVICE AND FIXING IMPORTS

INSTALIRACU PAKET

- `cd auth`

- `yarn add @ramicktick/common`

## HANDLERI IZ `auth/src/routes` FOLDERA SU, KAO DEPENDANCIES KORISTILI ONE FAJLOVE, KOJE SI PREMESTIO, I KOJI SU SADA DEO LIBRARY-JA; TAKO DA SADA TAMO, TREBAS DA UPDAT-UJES IMPORTE

EVO POKAZACU TI JEDAN PRIMER

- `code auth/src/routes/current-user.ts`

```ts
import { Router } from "express";
// UMESTO OVOGA
// import { currentUser } from "../middlewares/current-user";
// UVOZIM OVO
import { currentUser } from "@ramicktick/common";
//

const router = Router();

router.get("/api/users/current-user", currentUser, (req, res) => {
  return res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };

```

**SVE OSTALO MOZES SAM UPDATE-OVATI, I JA TO SADA NE MORAM OVDE POKAZIVATI**

***

ps.

UPDATE-UJ IMPORTS I U `auth/src/app.ts` FILE-U

***
