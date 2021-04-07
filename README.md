# `/signout` HANDLER

SIGNING OUT HANDLER BI TREBALO DA POSALJE HEADER KOJI CE RECI BROWSER- DA DUMP-UJE OUT SAV INFORMATION COKKIE-A 

OPET CU KORISTITI `cookie-session` LIBRARY

SAMO CU PODESITI DA JE `req.session = null`

- `code auth/src/routes/signout.ts`

```ts
import { Router } from "express";

const router = Router();

// MISLIM DA OVO MOZE BITI GET REQUEST, NE MORA POST
// JER NAM NE TREBA NIKAKAV DATA
router.get("/api/users/signout", (req, res) => {
  req.session = null;

  // POSLACEMO SAMO EMPTY OBJECT U RESPONSE-U
  res.send({});
});

export { router as signOutRouter };
```

## MOZEMO OPET DA IZVSIMO TEST, KORISCENJEM INSOMNIA-E

NAPRAVICEMO USER-A

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/signup`

METHOD JE:

`POST`

SALJEMO JSON

```json
{
	"email": "rudy@mail.com",
	"password": "LyleIsGreat66"
}

```

SADA SMO KRIRALI USERA A PRIJAVLJENI SMO JER IMAMO JSON WEB TOKEN, KAO VREDNOST `Set-Cookie` HEADER-A

MOZEMO DA ZAHTEVAMO CURRENT USERA

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/current-user`

METHOD JE: `GET`

I VIDECES DA CEMO DOBITI CURRENT USER-A

**SADA CEMO DA SE SIGN-UJEMO OUT; TO I ZELIMO DA TESTIRAMO**

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/signout`

METHOD JE:

`GET` (TAKO SMO DEFINISALI HANDLER)

JSON KOJI DOBIJAM BI TREBAL ODA BUDE EMPTY OBJECT

```json
{}
```

**SAD MOZES DA POKUSAS DA UZMES CURRENT USER-A**

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/current-user`

METHOD JE: `GET`

I DOBIO SI

```json
{
  "currentUser": null
}
```

DAKLE USPESNO SAM PODESIO SIGNING OUT
