# ADDING VALIDATION, ODNOSNO HANDLING signup

U BODY-JU REQUESTA OCEKUJEMO OVO `{email: string; password: string}`

DA NE BI JA PISAO VALIDACUJU BY HAND (ODNOSNO DA NE BI PISAO IF STATMENTS O TOME DA LI JE email POSTOJECI I DA LI TAJ IMAIL JESTE STRING TIPA) **KORISTICU LIBRARY**

PAKKET KOJI CU KORISTITI JESTE `express-validator`

<https://www.npmjs.com/package/express-validator>

[docs](https://express-validator.github.io/docs/)

OVAJ LIBRARY PORED VALIDACIJE (PROVERAVANJE DA INFO IMA CORRECT STRUCTURE AND FORM) MOZE RDITI I SANITIZATION, A TO JE CHANGING INFORMATION-A IN SOME WAY (REMOVING CERTAIN TYPES OF CHARACTERS I SLICNO) (**ZATO TI SAVETUJEM DA CITAS DOCS POMENUTOG PAKETA**)

***
***

JEDINA STVAR KOJA MI JE OVDE UPITNA JE INSTLIRANJE PAKETA LOKALNO

ZASTO SAMO NE IZMENIM package.json, LISTUJUCI DEPENDANCY, A SKAFFOLD KOMUNICIRAO SA CLOUD BUILD-OM, DA REBUILDINGU IMAGE-A DOWNLOAD-UJE I TAJ DEPENDANCY 

ALI NEMA VEZE RADIM KAO I AUTOR WORKSHOOPA, ZATO INSTALIRAM OVAJ PAKET LOKLNO

- `cd auth`

- `yarn add expreess-validator`

NARAVNO SKAFFOLD WATCH-UJE OVO (AKO GA NISI UPALIO MOZES SADA)

- `cd ..`

- `skaffold dev`

I CLOUD BILD CE REBUILD-OVATI IMAGE, I OPET CES VIDETI LOGS FROM INSIDE YOUR ONLY MICROSERVICE DEPLOYRED ON CLOUD

***
***

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
// UVOZIM body IZ express-validator
// POSTOJI NEKOLIKO NACINA DA SE KORISTI POMENUTI PAKET
// ALI JA CU KORISTITI OVU body STVAR
import { body } from "express-validator";

// body JE FUNKCIJA KOJA CE CHECK-OVATI body ICOMMING REQUEST-A

// SA OVIM PAKETOM SE MOGU CHECK-OVATI I QUERY PARAMETERS,
// TAKODJE MOZE HANDLE-OVATI VALIDATION I QUERY STRINGOVA (MEDJUTIM JA OVE STVARI SADA NE KORISTIM)

// POMENUTU FUNKCIJU CU APPLY-OVATI KAO MIDDLEWARE
// ALI TO NECU RADITI SA .use, VEC PRI DEFINISANJU HANDLER-A
//  U JEDNOM ARRAY-U KOJI CE ICI ISPRED HANDLERA

const router = Router();

// EVO VIDIS, KAKAV SAM ARRAY PRIDODAO
router.post(
  "/api/users/signup",
  [
    // VIDIS KAKO SE OVO MOZE CHAIN-OVATI
    // PRVO SE PROVERAVA DA LI JE email FIELD NA body-JU
    // PA ONDA SE PROVERAVA DA LI JE REC O EMAIL-U, A ONDA
    // SAM PODESIO I ERROR MASSEGE, KOJI BI TREBAO DA SE SEND-UJE TO USER
    // AKO UNESENO NIJE U EMAIL FORMATU
    body("email").isEmail().withMessage("Email must be valid!"),
    // OVDE JE URADJEN I SANITIZATIO NSTEP, PO KOJEM
    // SE UKLANJAJU TRIALING SPACES
    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Pssword must be valid"),
  ],
  (req: Request, res: Response) => {
    //
    // JA SAM GORE PODESIO ERROR MESSAGES, ALI ODAVDE
    // BI ONE TREBALE DA BUDU SENT
    // ZAT OCU U NASTAVKU HANDLE-OVATI VALIDATION ERRORS
  }
);

export { router as signUpRouter };

```

# HANDLING VALIDATION ERRORS

DAKLE GORE SAM URADIO VALIDACIJU, ALI REZULTATE, ODNONO ATEMPT-OVE VALIDACEIJE JA JOS NE KOMUNICIRAM DO USER-A

SADA CU TO URADITI

KORISTICU `validationResult` IZ PAKETA express-validator

```ts
import { Router, Request, Response } from "express";
// UVOZIM  I validationResult
import { body, validationResult } from "express-validator";

const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid!"),

    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Pssword must be valid"),
  ],
  (req: Request, res: Response) => {
    // GORE SI DEFINISAO VALIDATION STEP,
    // NA REQUEST-U BI TA VALIDACIJA TREBALA DA APPEND-UJE
    // INFO O TOME DA LI JE VALIDACIJA USPESNA ILI NE
    // A SA FUNKCIJOM validationResult, KOJU HARANIM SA
    // REQUESTOM JA USTVARI KORISTIM TAJ VALIDATION INFORMTIO

    // OVO JE OBJEKAT , KOJI MIGHT HAVE ERORS OR NOT
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // AKO NA OVOM OBJEKTU IMA EROR-A
      // SALJEM ARRAY TIH ERROR-A
      // SLACE SE SVI MOGUCI ERRORS AKO SU SE DESILI
      // ZA ONE POGRESNO UNETE FIELD-OVE
      // TO JE USTVARI ERROR IF JSON DATA
      return res.status(400).send(errors.array());
    }

    // GORE SU ERRORS HANDLED, A OVDE SE ONDA MOZE CREIRATI
    // USER, POSTO KAKO VIDIS OVO JE signup HANDLER

    console.log("Creating a new user");

    // TEMPORARY ZA SADA CU POSTATI email I password NAZAD
    // DAKLE SAMO DA BI TESTIRAO OVAJ HANDLER

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };


```

## SADA CU TESTIRATI signup ENDPOINT

KORISTICU HTTPIE

- `http http://microticket.com/api/users/signup email=stavros@maill.com password=jenstonA8`

MOGAO SI OVO DA URADIS U INSOMNII ISTO, ALI I OVAKO JE FUNKCIONISALO TAKODJE

```zsh
TTP/1.1 200 OK
Connection: keep-alive
Content-Length: 52
Content-Type: application/json; charset=utf-8
Date: Sun, 28 Mar 2021 18:18:02 GMT
ETag: W/"34-ZR/nA5Emi0iSG76nC7G4bla36y8"
X-Powered-By: Express

{
    "email": "stavros@maill.com",
    "password": "jenstonA8"
}
```

OVO JE BIO RESPONSE, KOJ ISAM DOBIO KADA SAM PROVIDE-OVAO VALID EMAIL I PASSWORD (ODNONO U VALIDNOM FORMATU)

SADA CU DA STAVIM EMAIL U POGRESNOM FORMATU I DA NAPRAVIM REQUEST

- `http http://microticket.com/api/users/signup email=nickmullen.com password=jenstonA8`

DOBIO SI 400 ERORO

```zsh
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 91
Content-Type: application/json; charset=utf-8
Date: Sun, 28 Mar 2021 18:20:33 GMT
ETag: W/"5b-R8ToihzKQR3YaCL+pbmo9BpsZNM"
X-Powered-By: Express

[
    {
        "location": "body",
        "msg": "Email must be valid!",
        "param": "email",
        "value": "nickmullen.com"
    }
]

```

ZAISTA JE BILA USPESNA VALIDACIJA, JER EMAIL JE ZAISTA U NEVALIDNOM FORMATU


