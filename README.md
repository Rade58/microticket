# ZELI MDA THROW-UJEM BOLJE ERROR INSTANCEU signin HANDLERU

- `code auth/src/routes/signin.ts`

```ts
import { Router, Request, Response } from "express";
// JOS TI JEDNOM NAPOMINJEM DA JE ZBOG OVOG PAKETA JEDINO MOGUCE
// DA UMESTO POZIVANJA next-A U HANDLER-U, THROW-UJES ERRORS, KOJE CE
// ONDA BITI DOSTUPNE U ERROR HANDLING MIDDLEWARE-U
import "express-async-errors";
//
import { User } from "../models/user.model";
import { sign } from "jsonwebtoken";
import { body } from "express-validator";
import { Password } from "../utils/password";
import { validateRequest } from "../middlewares/validate-request";

// VIDIM DA SAM DOLE U HANDLER-U THROW-OVAO SAMO Error INSTANCU
// ALI JA IMAM BOLJE RESNJE, KOJE SAM DAVNO RANIJE KREIRAO
// A TO JE MOJ GENERIC CUSTOM ERROR
import { BadRequestError } from "../errors/bad-request-error";
// OVAJ ERROR KORISTIM, JER SECAS SE, ON NOSI INFO
// KOJI JE U CONSISTANT OBLIKU (JER REKAO SAM TI DA STRIVE-UJES KA
// TOME DA TI JE DATA RESPONDED TO THE USER CONSISTANT, ALI DA TREBA DA
// BUDU I ERORR MESSAGES DA BUDU U CONSISTANT OBLIKU)

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password").trim().notEmpty().withMessage("You must supply password!"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) {
      // UMESTO OVOGA
      // throw new Error("user email doesn't exist");
      // OVO
      throw new BadRequestError("User with tht emaile, doesn't exist!");
    }

    const passwordIsMatching = await Password.compare(user.password, password);

    if (!passwordIsMatching) {
      // UMESTO OVOGA
      // throw new Error("Wrong password");
      // OVO
      throw new BadRequestError("Wrong password!");
    }

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };

```
