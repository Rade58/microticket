# PASSWORD HASHING

***
***

RANIJE SAM PREDPOSTAVIO DA CU KORISTITI SECRET BASED bcrypt PASSWORD HASHING FUNKCIJU, ALI NECU TO URADITI, JER AUTOR WORKSHOPA ZELI DA POKAZE, KAKO SE KORISTI NODEJS NATIVE PAKET `scrypt`

A OVO JE PASWORD HASHING GDE SE KORISTI NESTO ST OSE ZOVE SALT (VIDECES STA JE TO)

***
***

KADA SAM KREIRAO USER-A STORE-OVAO SAM PASSWORD KAO PLAIN TEXT, STO JE NARAVNO LOS APPROACH

TAKO DA CU TO SADA ISPRAVITI

***
***

ISTO TAKO NE BI BILO NA ODMET DA SE PRISETIS KAKV JE TO FLOW, KADA KORISTIS HASHING

TO RADIS PRILIKOM

- SIGN IN-A

- SIGN UP-A

KOD SIGN-UPA TI ,PROVIDE-UJES SECRET STRING I ONDA, KORISCENJEM HASING ALGORITMA PRAVIS HASHED PASWORDM I ONDA STORE-UJSES USER-A SA HASHED PASSWORD-OM

A KOD SIGN-UPA TREBAS DA OBTAIN-UJES USER-A IZ DATBASE-A, UZMES PASSWORD, PROVIDE-UJES ISTI SECRET STRING, I ZATIM PARSE-UJES HASHED PASWORD INTO PLAIN TEXT DA BI MOGAO DA PROVERIS DA LI SE RADI O MATCHING PASSWORD-U KOJ IJE PROVIDED KOD SIGN IN-A

NAKON TOGA (I NAKON USPESNOG SIGNUP ILI SIGNIN-A) TI MOZES DA IZDAS SESSION COOKIE ILI JWT (U TO CU LOOK-OVATI IN, MALO KASNIJE)

**JA SAM TAJ PROCES VEC JEDNOM RADIO [EVO GA U OVOM REPO-U](https://github.com/Rade58/authentication)**

***
***

# SADA CU U ODVOJENOM FAJLU NAPAVITI, USTVARI DEFINISATI FUNKCIJE SA HASHING LOGIKOM

KREIRACU FOLDER `utils` U MOM MICROSERVICE-U

- `mkdir auth/src/utils`

NAPRAVICU NOVI FILE

- `touch auth/src/utils/password.ts`

OVOG PUTA KORISTICU OPET CLASS SINTAKSU

I ZA POCETAK SAMO CU NAPRAVITI STATICNU METODU, KOJA CE SLUZITI DA SE KREIRA HSAHED

```ts
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// CALLBAK IMPLEMENTATION TRANSFORMED U PROMISE BASED IMPLEMENTATION
const scriptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex"); // GENERATING RANDOM STRING-A
    // BUFFER JE ONO STO DOLAZI IZ UPOTREBE PROMISIFY-A
    // ODNONO Promise CE BITI RESOLVED SA BUFFEROM
    // MEDJUTIM TYPESCRIPT TO NE ZNA
    const buf = (await scriptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString("hex")}.${salt}`;
  }

  // OVO CU SLEDECE DEFINISATI
  static compare(storedPassword: string, suppliedPassword: string) {}
}

```

# SADA CU DEFINISATI METOD, KOJI RADI OBRNUTO, OD PROVIDET HASHED PASSWORD-A UZETOG IZ DTABASE-A, I PROVIDED PASWORD-A BY CLIENT, USTVARI PARSE-UJE PASSWORD IZ TOG HASH-A I ONDA COMPARE-UJE DV APASSWORD-A

CHALLENGE OVDE JESTE SALT

- `code auth/src/utils/password.ts`

```ts
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scriptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scriptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // EVO DEFINISEM I POMENUTU LOGIKU
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");

    // SADA POONOVO PRAVIS HASH OD PASSWORD-A KOJI SALJE CLIENT
    // KAKO BI GA COMPARE-OVAO

    const buf = (await scriptAsync(suppliedPassword, salt, 64)) as Buffer;

    const hexedPass = buf.toString("hex");

    return hashedPassword === hexedPass;
  }
}

```

## PASSWORD HASHING JE PODESNO PODESITI U MONGOOSE-OVOM MIDDLEWARE-U, KOJI SE ZOVE `pre`; A COMPARING PASSWORDA JE PODESNO ODRADITI KADA ZA TO POSTOJI POTREB

COMPARING PASSWORDA CES RADITI NEGDE INSIDE SIGN IN HANDLER-A

INSIDE `pre` (**ALI MORA SE RECI DA JE TO `PRE SAVING TO THE DATABASE` OF NEW USER**) MOGU UZETI ONO STO JE, INICIJALNO POKUSANO DA SE STOR-UJE, SA create METODOM, ILI NEKOM OD UPDATING METODA, I DA SE ONDA TO, TAKORECI INTERCEPT-UJE U pre MIDDLEWARE-U, I MOZE SE, DAKLE DATA IZMENITI (**U MOM SLUCAJU JA CU HASHEVATI**) I TAKVO STORE-OVATI

DAKLE VEOMA PODESNO ZA HASHING

- `code auth/src/routes/signup.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
// UVOZIM KLASU KOJU SAM MALOCAS NAPRAVIO DA BI MANIPULISAO
// HASHINGOM PASSWORD-A
import { Password } from "../utils/password";
//

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

interface UserFieldsI {
  email: string;
  password: string;
}

interface UserDocumentI extends Document, UserFieldsI {
  /* email: string;
  password: string; */
}

interface UserModelI extends Model<UserDocumentI> {
  buildUser(inputs: UserFieldsI): Promise<UserFieldsI>;
}

/**
 * @description useless don't ue it anywhere
 * @deprecated
 */
userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

// DEFINISEM PRE HOOK
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // IAKO KREIRAS USERA FOR THE FIRST TIME
  // ZNACICE DA JE password MODIFIED

  const doc = this as UserDocumentI;

  const password = doc.get("password");

  const hashedPassword = await Password.toHash(password);

  doc.set("password", hashedPassword);

  next();
});

const User = model<UserDocumentI, UserModelI>("User", userSchema);

export { User };

```

# SADA MOGU DA POKUSAM DA, SAMO U CILJU TESTA DA SEND-UJEM PASSWORD TO THE USER

JER TREBALO BI DA NAKON KRIRANJA USER-A (INSIDE `/signup` HANDLERA, JA KREIRAM USER-A) DOBIJEM Promise, KOJI JE RESOLVED SA OBJEKTOM

**IAKO TI JE TO MALO CUDNO, TAJ OBJEKAT CE IMATI HASHED PASSWORS; I TO IMA SMISLA, JER NAKON KRIRANJA USER-A SA `create` TEBI CE BITI DOSTUPAN TAJ USER U ONOM OBLIKU KAKAV JE POHRANJEN, A POHRANJEN JE HASHED VREDNOSCU ZA `password` FIELD**

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
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

    // EVO OVDE, NOVI USER BI TREBALO DA IMA HASHED PASSWORD
    // POSLACU GA SA RESPONSE-OM

    res.status(201).send({ email: newUser.email, password: newUser.password });
  }
);

export { router as signUpRouter };
```

**SADA CU DA VIDIM DA LI CU DOBITI HASHED PASSWORD U RESPONSE-U**

- `http POST http://microticket.com/api/users/signup email="nick@train.com" password="TomMyersIsCool66"`

```zsh
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 185
Content-Type: application/json; charset=utf-8
Date: Fri, 02 Apr 2021 19:51:20 GMT
ETag: W/"b9-wbYHAYzJU9D9dO5JYhJk9EBLjps"
X-Powered-By: Express

{
    "email": "nick@train.com",
    "password": "baebd466a50497005fa6e28e469985801eb0bb24e7d3c67bb6b1fa04517bb95298d24f672b7dcf77e31ae6952d8ad9330728df75a05c315eaaf4e04a153ed239.111bb965942e4c95"
}
```
