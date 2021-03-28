# CREATING ROUTE HANDLERS

IMAM DAKLE ZA SADA SAMO JEDAM MICROSERVICE, NARAVNO NIJE COMPLETED, SAMO IM JEDAN ENDPOINT KOJI RETURNUJE NESTO BEZ VEZE, CISTO RADI TESTIRANJA

**IDEJA JE DA JA KREIRAM ROUTER-A, KAO STO SAM TO VEC JEDNOM RADIO KAKDA SAM SE BVIO SA EXPRSS-OM** (POGLEDAJ [TO U OVOM MOM REPO-U](https://github.com/Rade58/authentication))

**MEDJUTIM IPAK, ZA RAZLIKU OD PRINCIPA U LINKU, KOJEG SAM OSTAVIO; OVDE JE AUTOR WORKSHOPA ODLUCIO DA KORISTI PRISTUP, PO KOJEM CE IMATI TACNO JEDAN ROUTER NA PREMA JEDNOM ROUTE-U**

HAJDE DA POCNEM SA DEVELOPMENTOM

DAKLE JA SADA DEVELOP-UJEM MOJ auth NODEJS EXPRESS MICROSERVICE

## NAPRAVICU `routes` FOLDER I U NJEGA CU STAVITI SVE FILE-OVE

NAPRAVICU `routes` FOLDER

- `mkdir auth/src/routes`

NAPRAVICU 4 FILE-A

- `touch auth/src/routes/{current-user,signin,signout,signup}.ts`

## SADA CU KRIRATI JEDAN ROUTER I ZADATI JEDAN HANDLER ZA TAJ ROUTER; A TO RADIM PRVO U FILE-U `auth/src/routes/current-user.ts`

- `code auth/src/routes/current-user.ts`

```ts
import { Router } from "express";

const router = Router();

router.get("/api/users/current-user", (req, res) => {});

export { router as currentUserRouter };

```

## SADA CEMO DA ASSOSIATE-UJEMO OVAJ ROUTER SA NASOM EXPRESS APLIKACIJOM

DAKLE MENJAMO ONAJ index.js FAJL

- `code auth/src/index.ts`

```ts
import express from "express";
import { json } from "body-parser";

// IMPORTUJEMO ROUTERA
import { currentUserRouter } from "./routes/current-user";
//

const app = express();

app.use(json());

// ASSOCIATE-UJEMO ROUTER-A
app.use(currentUserRouter);
//

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});

```

## OVO NIJE NEKAKAV NACIN KOJI RADIM, JER NA PRIMER ZELIM DA DODAJEM DOSTA MIDDLEWARE-OVA ALL AT ONECE ZA MULTIPLE ROUTES; VEC SAM OZBOG STRUKTURE CODE, IT'S EASIER TO READ AND FIND

POSTOJI MNOGO NACINA DA SE ASSOCIATE-UJE ROUTE SA EXPRESS APLIKACIJOM, A OVDE JE IZBRAN JEDAN NACIN
