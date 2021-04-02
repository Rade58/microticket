import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

// UVOZIM User MODEL
import { User } from "../models/user.model";
//

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
  // I OVO MOZE BITI async
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;
    // OVDE PRVO REACH-UJE INTO DTBASE DA VIDIM DA LI,
    // ALREADY POSTOJI U DATBASE-U
    const possibleUser = await User.findOne({ email })
      .select("-password") // NE TREBA MI password (MINUS PASSWORD)
      .exec();

    // AKO OVO GORE NIJE null MORAM POSLATI ERROR
    if (possibleUser && possibleUser.email) {
      // TREBAO BI NAPRAVITI CUSTOM ERORO KOJI BI THROW-OVAO
      // UPRAVO OVDE, AL IZA SADA SALJEM SAMO EMPTY RESPONSE

      console.log("Email already in use!");

      return res.status(400).send({});
    }

    // OVDE ZANM DA JE possibleUser USTVARI null I MOZEMO DA
    //  KREIRAMO NOVOG USER-A
    const newUser = await User.create({ email, password });

    // ZA SADA CU SAMO PROSLEDITI emaiil NOVOG USER-A
    res.status(201).send({ email: newUser.email });
  }
);

export { router as signUpRouter };
