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

    // POSTOJI MOGUCNOST DA SI ZABORAVIO DA ZADAS POMENUTI
    // SECRET, ZATO UMECEM OVDE USLOVNU IZJAVU
    if (!process.env.JWT_KEY) {
      // MEDJUTIM OVO JE LOSE
      throw new Error("JWT_KEY env variable undefined");
      // LOSE JE ZATO STO SU ENVIROMENT VARIJABLE TVOJA ODGOVORNOST
      // A TI OVDE THROW-UJES ERRORS INSIDE A HANDLER
      // TI SI TREBAO PROVERITI SVE ENV VARIABLES PRE POKRETANJA EXPRESS SERVERA
      // DAKLE TAMO SU TREBALE DA BUDU USLOVNE IZJAVE
      // JA OVDE RADIM OVO SAM ODA BIH NEUTRALISAO TYPESCRIPT
      // ERROR
    }

    const userJwt = sign(
      { email: newUser.email, id: newUser._id },
      // EVO REFERENCIRAO SAM ENVIROMENT VARIABLU
      // CIJA JE VREDNOST MOJ SECRET SIGNING KEY
      process.env.JWT_KEY
    );

    req.session = {
      jwt: userJwt,
    };

    res
      .status(201)

      .send({ email: newUser.email });
  }
);

export { router as signUpRouter };
