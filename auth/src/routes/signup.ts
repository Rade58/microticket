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
