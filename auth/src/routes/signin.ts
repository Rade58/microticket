import { Router, Request, Response } from "express";
// UVOZIM MONGOOSE MODEL
import { User } from "../models/user.model";
// JSON WEB TOKEN
import { sign } from "jsonwebtoken";
// UVOZIM METODU KOJA TREBA DA DEHASH-UJE PASSWORD

// OPET CEMO VALIDIRATI PASSWORD SA PAKETOM express-validator
import { body, validationResult } from "express-validator";

// VALIDATION ERROR
import { RequestValidationError } from "../errors/request-validation-error";

import { Password } from "../utils/password";
//

const router = Router();

router.post(
  "/api/users/signin",
  [
    // KORISTIM body FUNKCIJU KOJU POZIVAM KAO MIDDLEWARE
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password")
      .trim()
      .isLength({ max: 20, min: 4 })
      .withMessage("Password must be valid!"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    // AKO POSTOJE ERRORI KOJI SU VALIDATION ERRORS, SALJES ERROR KOJI SAM DAVNO NAPRAVIO
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());

    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    // AKO NEMA USER-A THROW-UJEM ERROR
    if (!user) throw new Error("user email doesn't exist");

    const passwordIsMatching = await Password.compare(user.password, password);

    // AKO SE PASSWORDI NE MATCH-UJU THROW-UJEM ERROR
    if (!passwordIsMatching) throw new Error("Wrong password");

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    // SETTUJEM TOKEN (BICE INTERCEPTED AND SERIAIED BY cookie-session)
    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };
