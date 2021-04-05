# GENEARATING A JWT

DAKLE U PROSLOM BRANCHU SAM HOOK-OVAO UP `cookie-session` MIDDLEWARE (STAMPAJ `auth/src/index.ts` PA VIDI KAKO SAM TO URADIO)

SADA PRE NEGO STO GENERISEM JWT, MORAM VIDETI KAKO SE SA `cookie-session` USTVARI STORE-UJE INFORMATION INSIDE A COOOKIE

EVO OVDE TI JE U [DOOKUMENTACIJI](https://github.com/expressjs/cookie-session#examples) POKAZANO KAKO SE TO RADI

```ts
// DAKLE OVO JE NEKI HANDLER
app.get('/', function (req, res, next) {
  
  // Update views
  req.session.views = (req.session.views || 0) + 1

  // Write response
  res.end(req.session.views + ' views')
})
```

**DAKLE KORISTI SE `req.session`**

TO CE BITI OBJEKAT, KOJI CE KREITARATI POMENUTI cookie-session MIDDLEWARE

**SVAKI INFO KOJI SE STORE-UJE NA `req.session` BICE automatski SERIALIZED BY cookie-session, I STORED INSIDE THE COOKIE**

**A JA CU STORE-OVATI JWT ON `req.session`**

# A JWT CU GENERISATI KORISCENJEM PAKETA `jsonwebtoken`

- `cd auth`

- `yarn add jsonwebtoken`

- `yarn add @types/jsonwebtoken --dev`

# SADA CU DA KORISTIM POMENUTI PAKET U MOM `/signup` HANDLERU

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
// UVOZIM OVO
import { sign } from "jsonwebtoken";
//

import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";

import { User } from "../models/user.model";

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

  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const possibleUser = await User.findOne({ email })
      .select("-password")
      .exec();

    console.log({ possibleUser });

    if (possibleUser && possibleUser.email) {
      throw new BadRequestError("Email already in use!");
    }

    const newUser = await User.create({ email, password });

    // OVDE BI TREBALI DA GENERISEMO JSON WEB TOKEN

    const userJwt = sign(
      // PRVO DODAJES PAYLOAD
      { email: newUser.email, id: newUser._id },
      // SECRET (KASNIJE CU GOVORITI O TOME KAKO DA SECURE-UJES
      // OVAJ KEY U KUBERNETES ENVIROMENT-U)
      "my secret key"
    );
    // DAKLE OVO JE GORE SYNC FUNKCIJA
    // DA SI PROVIDE-OVAO CALLBACK BILA BI ASYNC FUNKCIJA
    // TAKO DA MOZES BITI SIGURAN DA JE OVDE JWT KREIRAN I
    // DA SE MOZE KORISTITI

    // STORE-UJEMO GA ON request.session OBJEC

    req.session = {
      jwt: userJwt,
    };
    // ZASTO GORE DEFINISEM CO OBJEKAT? PA DA TYPESCRIPT NE BI YELL-OVAO NA MENE
    //  JER DA SAM KORISTIO `.jwt =`  ONDA JER NEMEN TYPE DEFINITIONS
    // TYPESCRIPT BI YELL-OVAO NA MENE JER NE ZELI DA SUME-UJES DA VEC POSTOJI
    // OBJEKAT KAO VREDNOST req.session

    res
      .status(201)
      // password is hashed
      .send({ email: newUser.email /* , password: newUser.password */ });
  }
);

export { router as signUpRouter };

```

DAKLE cookie-session LIBRARY CE UZETI POMENUTI OBJEKAT req.session ,SERIALIZE-OVACE GA I POSLACE GA NAZAD DO KORISNIKA

# SADA CU DA NAPRAVIM QUICK TEST, TAKO STO CU KREITRATI NOVOG USERA; ALI OVO NECE PROCI GLATKO, A VIDECES I ZASTO

NE ZABORAVI DA POKRENES SKAFFOLD AKO VEC NISI `skaffold dev`

**`ISTO TAKO RADI OVO U INSOMNI-I JER JE A BIT COMPLICATED, VIDECES I ZASTO`:**

**TI MOZES DA NAPRAVIS REQUEST, KORISCENJEM http PROTOKOLA, ALI NECES DOBITI NAZAD COOKIE, JER SI OZNACIO OPCIJAM DA TAJ COOKIE SAMO MOZE BITI REQUESTED KROZ HTTPS**

**DAKLE KORISTICU INSOMNI-U, ALI KOD NJE JE UVEK CHECKED `Validate Certificates`**

**MORACES TO DA UNCHECK-UJES (STO MOZZES URADITI KADA HOCES, PRE ILI POSLE EXECUTING-A REQUEST-A)** (IDES U `Application --> Preferences` I UNCHECK-UJ `Validate Certificates`)

TIME NECES IMATI NIKAKAV SSL CERTIFICATE ERROR KADA BUDES SALAO REQUESTS NA `https://microticket.com/api/users/signup` (DAKLE KADA BUDES SLAO https PROTOKOLOM)

ZASTO SAM OVO GORE MORAO URADITI? AUTOR WORKSHOPA KAZE DA JE TO JER `NASA APLIKACIJA TRENUTNO IMAM INVLID INGRESS NGING SSL CERTIFICATE`

KADA SI SVE TO SHVATIO FORMIRACEMO REQUEST

DAKLE REQUEST PRAVIMO PREMA:

- `https://microticket.com/api/users/signup`

METHOD JE:

- `POST`

SALJEMO JSON

```json
{
	"email": "bobylee@live.com",
	"password": "TomIsCool66"
}
```

DAKLE EXECUTE-UJEM REQUEST

**I U Cookies SEKCIJI INSOMNINOG RESPONSE-A, MOZES NACI COOKIE, KOJI JE ENCRYPTED KAKO IZGLEDA**

EVO KAKAV SAM COOKIE DOBIO

```s
eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW1KdllubHNaV1ZBYkdsMlpTNWpiMjBpTENKcFpDSTZJall3Tm1JeU5EZGxNemt4WVdabU1EQXhPR001WVdJMU5pSXNJbWxoZENJNk1UWXhOell6TkRRek1IMC45OFJtWU1nV0ZiakFlM3FuZ1BWc2JsY3NoUHBrNmNUV2pTanE4aklMU1dRIn0=
```
