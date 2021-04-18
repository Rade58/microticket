import { Router, Request, Response } from "express";

import "express-async-errors";

import { User } from "../models/user.model";
import { sign } from "jsonwebtoken";
import { body } from "express-validator";
import { Password } from "../utils/password";
//
// import { validateRequest } from "../middlewares/validate-request";
// import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest, BadRequestError } from "@ramicktick/common";
//

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
      throw new BadRequestError("User with this email, doesn't exist!");
    }

    const passwordIsMatching = await Password.compare(user.password, password);

    if (!passwordIsMatching) {
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
