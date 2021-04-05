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

    // OVDE BI TREBALI DA KREIRAMO JSONWEB TOKEN

    res
      .status(201)
      // password is hashed
      .send({ email: newUser.email /* , password: newUser.password */ });
  }
);

export { router as signUpRouter };
