import { Router, Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
// UVESCU POMENUTI ERROR
import { BadRequestError } from "../errors/bad-request-error";
//

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
      .select("-password") // NE TREBA MI password (MINUS PASSWORD)
      .exec();

    console.log({ possibleUser });

    if (possibleUser && possibleUser.email) {
      // OVDE THROW-UJEM ERROR
      throw new BadRequestError("Email already in use!");
      // OVAJ ERROR CE NARAVNO BITI CATCH-ED INSIDE ERROR HANDLLING
      // MIDDLEWARE, KOJEG SAM DAVNO RANIJE KREIRAO I POVEZAO
      // DA STOJI IZA SVIH RAUTERA MOG auth MICROSERVICE-A
      // TAKO DA CE TAJ MIDDLEWARE SEND-OVATI ERROR DATA
      // CLIENT-U
    }

    const newUser = await User.create({ email, password });

    res.status(201).send({ email: newUser.email });
  }
);

export { router as signUpRouter };
