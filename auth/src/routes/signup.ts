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
