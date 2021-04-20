# BETTER LOGGING OF ERRORS

PONOVO CU DA MODIFIKUJEM CODE MOG LIBRARY-JA PA DA GA PUBLISH-UJEM

ONO STA CU MENJATI JE ERROR HANDLING MIDDLEWARE

- `code common/src/middlewares/error-handler.ts`

```ts
import { Request, Response, NextFunction } from "express";

import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // JASA SAM OVAKO DEFINISAO DA SE STAMPAJU ERRORI
  // TO JE DAKLE CODE KOJI JE TO BIO RANIJE
  // OVO JE DOBRO, ALI POSTOJI BOLJI NACIN
  // console.log("ERROR -->", err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  // BOLJE JE DA STMAPAP ERROR, ZA KOJE NE ZNAM, KOJI NISU INSTANCE
  // MOG CustomError-A, KAO STO SU SVI ERROR-I KOJE SAM NAPRAVIO
  // OVDE CE SE DAKLE STMAPATI SAMO ERRORS KOJE
  // NE ATICIPATE-UJEM
  console.error(err);
  //

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};

```

# SADA REBUILD-UJEM I REPUBLISH-UJEM MOJ `2rammicktick/common` MODULE

***

digresija:

**TREBS DA ZANAS, ODNOSNO DA SE SETIS DA common FOLDER TREBA DA BUDE SEPARATE REPO**

ODNONO BI TREBALO DA TO JESTE SEM AKO NISI REDOWNLOAD-OVAO OVAJ PROJEKAT SA GITHUB-A (TADA TO STO SI PODESIO DA U FOLDERU BUDE SUB REPO, TO SE NECE REGISTROVATI NA GITHUBU NARAVNO (SAM ZAKLJUCI ZASTO, ALI IPAK CU TI RECI; PA NITI NISI IKADA DEFINISAO DA HOST-UJES OVAJ SUBREPO NA GITHUB-U STO BI INACE URADIO (TI USTVARI NIKAD NE BI NI IMAO SUB REPO, VEC BI TI LIBRARY BIO U NEKOM DRUGOM FOLDERU))))

**DOSTA SAM POTROSIO RECI DA TI SAMO KAZEM DA TREBAS URADITI**

- `cd common` `git init`

U SLUCAJ UDA SI REDOWNLOAD-OVAO CEO OVAJ MICROSERVICES REPO

A SVE JE TO ZBOG `pub` SCRIPT-A

- `cat common/package.json`

```ts
 "scripts": {
    "clean": "del ./build/*",
    "build": "npm run clean && tsc",
    "pub": "git add -A && git commit -am \"updates\" && npm version patch && npm run build && npm publish"
  },
```

***


- `cd common`

- `npm run pub`



