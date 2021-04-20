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

# SADA REBUILD-UJEM I REPUBLISH-UJEM MOJ `@ramicktick/common` MODULE

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

**SADA JE DAKLE TVOJ LIBRARY REPUBLISHED I IMA NOVU VERZIJU, STO MZOES VIDETI IZ LOGS-A ALI IAKO POGLEDAS TVOJ PACKAGE NA NPM WEBSITE-U**

# DA REINSTALIRAM SADA `@ramicktick/common`, U MOM `tickets` MICROSERVICE-U

- `cd tickets`

- `yarn add @ramicktick/common --latest` (REKAO SAM TI RANIJE DA OVAKO PREFERIRM DA KORISTIM yarn KADA UPDATE-UJEM PACKAGE INSTLACIJU)

# AKO OPET POKRENES TESTS MOCI CES VIDETI DA SE LEPSE STMAPJU ERRORS KOJI NISU INSTANCE TVOG `CustomError`-A, ODNOSNO ERRORS KOJE NE ANTICIPATE-UJES

EVO IZMENICEMO TESTS DA TI POKAZEM TO

- `code tickets/src/routes/__tests__/show.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  // DEFINISEM DA OVAJ STRING IMA MANJE OD 12 KARAKTERA
  // const someRandomId = "sfsdsdfasd46";
  const someRandomId = "sfsds";
  //

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response.status).toEqual(404);
});

// ...

```

**I SADA CE TI TEST FAIL-OVATI**

- `cd tickets` `yarn test`

**ALI ZNACES ZASTO TI JE FAIL-OVAO**

EVO POKAZUJEM TI OUTPUT

```zsh
console.error
      CastError: Cast to ObjectId failed for value "sfsds" at path "_id" for model "Ticket"
# ...
```

## SADA MOZES DA POPRAVIS TEST KAKO BI TI TEST PROSAO OPET, ALI SAA CEMO MI DA GENNERISEMO id; I TO SA BUILT IN FUNKCIJOM MONGOOSE-A

- `code tickets/src/routes/__tests__/show.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

//UVOZIM IZ mongoose-A
import { Types } from "mongoose";

it("returns 404 if the ticket is not found", async () => {
  // UZ POMOC OVOGA KRIRAM ID
  const someRandomId = new Types.ObjectId();

  // const someRandomId = "sfsdsdfasd46";
  // const someRandomId = "sfsds";
  //

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response.status).toEqual(404);
});

// ...
// ...

```

MOZES DA POKRENES OPET TESTING SUITE AKO SI GA UGASIO

- `cd tickets`

- `yarn test`
