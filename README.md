# REQUEST VALIDATION MIDDLEWARE

JA U MOM CODE-U KORISTIM MIDDLEWARE-OVE, KOJE POSTAVLJAM IN FRONT OF /signin I /signup

U PITANJU SU MIDDLEWARE-OVI KOJI SU DEO PAKETA `express-vlidation`, I CILJ IM JE DA NA REQUEST OBJEKAT NEKEKO ZAKCE INFO O TOME DA LI POSTOJI ERROR-A U POGLEDU VALIDACIJE FIELD-OVA

NJIMA SE MALO RAZLIKUJE UPOTREBA OD SLUCAJA DO SLUCAJA; NA PRIMER ZA SIGNUP, POTREBNO JE DA IMAM DEFINISAN MAXIMALNI I MINIMALNI BROJ KARAKTERA ZA password FIELD; A ZA SIGNIN MI TO NIJE POTREBNO NEGO MI JE POTREBNO SAMO DA password NE BUDE PRAZAN (OVO JE ZBOG EDGE CASE GDE TI VEC MOZDA IMAS USERS INSIDE DATABASE COLLLECTION, KOJI SU MOZDA KREIRANI KADA NIJE POSTOJAO REUREMENT ZA MAXIMAALNI I MINIMALNI BROJ KARAKTERA ZA PASSWORD)

ZATO OVAKO KORISTIM TE MIDDLEWARE-OVE U OVOA DVA FILE-A

- `cat auth/src/routes/signin.ts`

```ts
import { Router, Request, Response } from "express";
import { User } from "../models/user.model";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { Password } from "../utils/password";

const router = Router();

router.post(
  "/api/users/signin",
  [
    // GOVORIM O OVIM MIDDLEWARE-OVIM
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password").trim().notEmpty().withMessage("You must supply password!"),
    //
  ],
  async (req: Request, res: Response) => {
    
    // ALI OBRATI PANJU DA JE OVO ISTI DEO KOJI JA IMAM 
    // I MOM DRUGOM HANDLER=U
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    // 

    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) throw new Error("user email doesn't exist");

    const passwordIsMatching = await Password.compare(user.password, password);

    if (!passwordIsMatching) throw new Error("Wrong password");

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };

```

- `cat auth/src/routes/signup.ts`

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
    // I GOVORIM O OVIM MIDDLEWARE-OVIMA
    body("email").isEmail().withMessage("Email must be valid!"),

    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Password must be valid"),
    //
  ],

  async (req: Request, res: Response) => {
    
    // A VIDIS OVO JE POTPUNO ISTO KAO TO IMAS IU PREDHODNOM HANDLERU
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
    // 

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

    res.status(201).send(newUser);
  }
);

export { router as signUpRouter };

```

# KAO STO VIDIS GORE, POKAZAO SAM TI DEO CODE-A KOJI JE POTPUNO ISTI U OBA HANDLER-A, A TICE SE UZIMANJA REQUEST-A, I PRONALAZENJA DA LI SU PREDHODNI VALIDATION MIDDLEWARE-OVE INSERT-OVALI VALIDATION ERROR MESSAGES NA REQUEST; A POSTO SE TAJ DEO CODE-A REUSE-UJE DOBRO BI BIL ODA NAPRAVIMO MIDDLEWARE

- `touch auth/src/middlewares/validate-request.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import "express-async-errors";
import { RequestValidationError } from "../errors/request-validation-error";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // ZAPAMTI DA THROWING ERROR-A, SAMO FUNKCIONISE
    // ZATO STO IMAM PAKET `express-async-errors`
    throw new RequestValidationError(errors.array());

    // I NARAVNO OVAJ ERROR ONDA HANDLE-UJE RERROR HANDLING 
    // MIDDLEWARE, KOJEG SAM ODAVNO DEFINISAO I WIRE-OVAO UP
  }

  // AKO NEMA ERROR-A NASTAVLJA SE SE IZVRSAVANJEM HANDLER-A
  // ILI SLEDECEG MIDDLEWARE-A
  next();
};

```

## SADA JE POTREBNO DA SE REFAKTORISU MOJI HANDLERI, TAK ODA KORISTE OVAJ MIDDLEWARE

PRVO OVAJ

- `code auth/src/routes/signin.ts`

```ts
import { Router, Request, Response } from "express";
// RANIJE SAM ZABORAVIO DA UVEZEM OVO
import "express-async-errors"; // (AKO SI ZABORAVIO OVAJ PAKET TI SLUZI DA
// DA NE MORAS DA KORISTIS next
// A BI PREKINUO IZVRSAVANJE HANDLERA NA TOM MESTU
// VEC DA MOES DA THROW-UJES ERROR UMESTO TOGA
// A KAO STO MOZES VIDETI JA DOSTA THROW-UJEM U HANDLER-U)
import { User } from "../models/user.model";
import { sign } from "jsonwebtoken";
// OVO COMMENT-UJEM OUT JER GA KORISTIM U MIDDLEWARE-U
import { body /*validationResult*/ } from "express-validator";
// I OVO MI NE TREBA JER GA SAMO KORISTIM U MIDDLEWARE-U
// import { RequestValidationError } from "../errors/request-validation-error";
import { Password } from "../utils/password";
// UVOZIM MOJ MIDDLEWARE
import { validateRequest } from "../middlewares/validate-request";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password").trim().notEmpty().withMessage("You must supply password!"),
  ],
  // DODAJEMM MIDDLEWARE
  // DA MOZDA TI JE CUDNO ALI TO RADIS
  // NAKON OVOG ARRAY-A (MOZDA SI POMISLIO DA MIDDLEWARE-OVI MORAJU U ARRAY
  // ALI NIJE TAKO , TI SVE STO LAY-UJES PRE HANDLERA JETE MIDDLEWARE)
  validateRequest,
  //
  async (req: Request, res: Response) => {
    //  I OVO VISE NIJE POTREBNO JER SAM GA ZAMENIO MIDDLEWARE-OM
    /* const errors = validationResult(req);

    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    */

    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) throw new Error("user email doesn't exist");

    const passwordIsMatching = await Password.compare(user.password, password);

    if (!passwordIsMatching) throw new Error("Wrong password");

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };
```

**ISTO RADIM I ZA SIGNUP HANDLER**

- `code auth/src/routes/signup.ts`

```ts
import { Router, Request, Response } from "express";
import "express-async-errors";
// VISAK
import { body /*validationResult*/ } from "express-validator";
import { sign } from "jsonwebtoken";
// VISAK
// import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";

import { User } from "../models/user.model";

// UZIMAM MIDDLEWARE
import { validateRequest } from "../middlewares/validate-request";

const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid!"),

    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Password must be valid"),
  ],
  // DODAJEM MIDDLEWARE
  validateRequest,
  //

  async (req: Request, res: Response) => {
    // OVO UKLANJAM
    /* const errors = validationResult(req);


    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    */
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

    res.status(201).send(newUser);
  }
);

export { router as signUpRouter };
```
