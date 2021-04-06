# FORMMATING JSON YOU SENT FROM YOUR MICROSERVICE

OPET NAPOMINJEM, ISTO KAO STO SAM DEFINISO ILI ISTRIVE-UJEM KA TOME DA ERROR MESSAGE/S BUDE/U CONSISTANT ACROSS ALL MICROSERVICES; **TREBALO BI DA SE STARAM I DA DATA INSIDE RESPONSE BUDE U FORMATU KOJI JE CONSISTANT ACROSS ALL MICROSERVICES**

POGOTOVO KADA IMAS NA PRIMER RAZLICITE MICROSERVICE-OVE, KOJI KORISTE RAZLLICITE DATABASE-OVE, TREBA DA SE STARAS DA KADA IZVUCES DATA IZ TIH DATABASE-OVA

**NA PRIMER KAD IZVUCES DATA IZ MONGODB-JA TEBI JE DATA U TAKVOM FORMATU DA IMAS PROPERTIJE `_id`, ZATIM `__v`**

TAKVE PROPERTIJE NEMAJU DRUGI DATABASE-OVI

**A TI TREBA DO CLIENTA DA, SVE SALJES U ISTOM FORMATU, JER TVOJ REACT, ODNOSNO NEXTJS APP TREBA DA ZANA SAMO ZA JEDAN FORMAT JSON-A, KOJI MU SALJU TVOJI MICROSERVICE-OVI SA RESPONSE-OVIMA**

ISTO TAKO KADA KREIRAS, ILI SAMO GET-UJES USER OBJEKAT, TI NE BI TREBAL ODA POSALJES U RESPONS-U CELOKUPAN OBJEKAT, VEC SAMO BASIC STUFF: `email` `id`

NARAVNO NE TREBAS DA SALJES PASSWORD BEZ OBZIRA STO JE PASSWORD HASHED

# HAJDE DA SE REMIND-UJEMO KAKO TO JAVASCRIPT TRANSFORMISE OBJECTS INTO JSON DATA, ODNOSNO STA SE TO DESAVA KADA KORISTIMO `JSON.stringify`

NAIME, OVA METODA UNDER THE HOOD KADA SE POZIVA, NE SAMO DA PARSE-UJE TVOJ OBJEKAT PRETVARAJUCI GA U JSON, VEC MU UMECE METODU `toJSON`, KOJOJJ DEFINISU DA RETURN-UJE ONO STA TREBA PARSE-OVATI, A KADA SE ZAVRSI PARSING METODA JE UKLONJENA IZ OBJEKATA

E PA TI MOZES OVERRIDE-OVATI TU `toJSON` METODU

EVO POKAZACU TI

```js
*> const foo = {prop: "something", toJSON(){return "bar"}}
<* undefined
*> JSON.stringify(foo)
<* ""bar""
```

KAO STO VIDIS USPESNO SAM OVERRIDE-OVAO POMENUTU METODU, ZA KOJU NISAM RANIJE NAO NI DA SE MOZE OVERRIDE-OVATI

# JA UPRAVO MOGU KORISTITI OVERRIDE TE `toJSON` METODE KAKO BI OSIGURAO DA KADA SE DATA DOSLA MA IZ KOJEG IZVORA (MA KOJEG DATABASE-A) FORMATIRA KAKO BI BILO CONSISTANT, ODNOSNO KAKO BI IMALO ISTI IZGLED

MEDJUTIM JEDINI IZVOR KOJI JA SADA IMAM I CIJE BI DATA TREBALO MODIFIKOVATI NAKON NJEGOVOG UZIMANJA JESTE DATA DOKUMENTA UZETOG IZ DATABASE-A

**TREBAS SHVATITI DA MI OVDE GOVORIMO O TOME KAKO DA OVERRIDE-UJEMO TAJ POZIV JSON.stringify ,KOJI SE DOGADJA UNDER THE HOOD (ODLIKA EXPRESS FRMEWORK-A), KADA TI PROSLEDJUJES DATA U NEKI RESPONSE**

DAKLE FLOW JE TAKAKV A TI DAKLE ZADAJES SAMU toJSON METODU NA OBJEKTU

A TAJ OBJEKAT CE SE DRUGACIJE STRINGIFY-OVATI UNDER THE HOOD PRI SLANJU RESPONSE-A SA EXPRESS-OM

# NA SRECU TI MOZES PRI DEFINISANJU SAME SCHEMA-E, DA DEFINISES I METODU, NA DOBIJENI DOKUMENT IZ DATABASE-A

IMAS MOGUCNOST DA PODESIS I toJSON METODU; ALI NJENA IMPLEMENTACIJA JE NESTO DRUGACIJA NEGO STO SAM TI POKAZAO NA NORMALNOM JAVASCRIPT OBJEKTU

ALI BEZ OBZIR KAKVA JE IMPLEMENTACIJA, JER TI KADA TO OVERRIDE-UJES (toJSON) I POSALJES CEO DOKUMENT DOBIJEN IZ DATABASE-A, KROZ RESPONSE; **OMN CE BITI TRINGIFYED ONAKO KO SI TI TI ZELEO**

# DEFINISANJE `toJSON` ON MONGOOSE SCHEMA, 

DEFINISANJE NIJE IDENTICAL KAO ONAJ `toJSON` NORMALNOG JAVASCRIPT OBJEKTA

NAIME toJSON SE U OPTIONS OBJEKTU MONGOOSE SCHEMA-E DEFINISE KAO OBJECT

JER POSTOJI I MNOGO DRUGIH OPCIJA KOJE SE MOGU PODESITI

- `code auth/src/models/user.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

import { Password } from "../utils/password";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  // EVO U OVOM OPTIONS OBJEKTU ZADAJEM
  // `toJSON` (CAK KADA SI PRITISNUO Ctrl + Space
  // IMAO SI PONUUDJENO, STO ZNACI DA OVO LJUDI DOSTA KORISTE
  //  PA ZATO JE I TYPED)
  {
    toJSON: {
      // OVDE SETTOVANJEM OVIH PROPERTIJA POMAZEM MONGOOSE-U
      // DA UZME USER DOCUMENT I PRETVORI GA U JSON
      // KAKO FUNKCIONISU METODE KOJE SU OVDE MOZES OTKRITI
      // PREKO Ctrl + Alt + Click NA toJson
      // KORISTICU transform METODU
      transform(doc, ret, options) {
        // doc JE DOKUMENT OBTAINEED IZ DATABASE-A
        // ret JE JSON doc OBJEKTA, STO ZNACI DA JE MONGOOSE POKUSAO DA
        // NAPRAVI JSON OD DOKUMENTA
        // MI MORMO MODIFIKOVATI ret OBJECT
        // NISTA NECEMO RETURN-OVATI SAMO DIREKTNO MENJAMO ret
        // UKLONICEMO password JER NE ZELIM ODA SE ON POJAVI
        // UBILO KOJOJ JSON REPREZENTACIJI

        // TO RADIMO TAKO STI KORISTIMO delete OPERATOR
        delete ret.password;
        // UKLONICEMO I __v
        delete ret.__v;

        // A DODAJEMO id PROPERI
        ret.id = ret._id;

        // UKLANJAMO _id
        delete ret._id;
      },
    },
  }
);

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
 * @description useless don't use it anywhere
 * @deprecated
 */
userSchema.statics.buildUser = async function (inputs) {
  const User = this as UserModelI;

  const newUser = await User.create(inputs);

  return { email: newUser.email, password: newUser.password };
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const doc = this as UserDocumentI;

  const password = doc.get("password");

  const hashedPassword = await Password.toHash(password);

  doc.set("password", hashedPassword);

  next();
});

const User = model<UserDocumentI, UserModelI>("User", userSchema);

export { User };

```

# SADA KADA POSALJES SA RESPONSE-OM, CEO OBJEKAT (DOKUMENT) UZET IZ DATABASE-A, ON BI TREBAL ODA IMA SAMO ONE PROPERTIJE KOJE SI TI DEFINISAO

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { sign } from "jsonwebtoken";

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

    if (possibleUser && possibleUser.email) {
      throw new BadRequestError("Email already in use!");
    }

    const newUser = await User.create({ email, password });

    const userJwt = sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_KEY as string
    );

    req.session = {
      jwt: userJwt,
    };

    res
      .status(201)
      // UMESTO OVOG CHERRY PICKINGA KOJI SAM RAADIO RANIJE
      // .send({ email: newUser.email });
      // SALJEM CEO DOKUMENT OBTAINED IZ DATABASE-A
      .send(newUser);
  }
);

export { router as signUpRouter };
```

## SADA MOZES OVO DA TESTIRAS U INSOMNII

DAKLE REQUEST PRAVIMO PREMA:

- `https://microticket.com/api/users/signup`

METHOD JE:

`POST`

SALJEMO JSON

```json
{
	"email": "klayla@live.com",
	"password": "TomIsCool66"
}
```

**EXECUTE-OVAO SAM REQUEST**

I EVO KAKV SAM JSON U RESPONSE-U DOBIO IN RETURN

```json
{
  "email": "klayla@live.com",
  "id": "606c90ddcc465e001838a9ee"
}
```

TU NIJE NI _id, NI __v, A TU NEMA password-A, A POSTOJI id; SVE BAS KAKO SAM ZADAO

IZGLEDA DA SAM USPESNO ZADAO toJSON, JER GA JE UNDER THE HOOD PRI SLANJU RESPONSE-A `JSON.stringify` JE ODRADILA POSAO I U JSON SE NASLO ONO STO SAM TACNO ZELEO




