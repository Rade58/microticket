import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
// UVOZIM POMENUTE KLASE
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
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
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // UMESTO SVEGA OVOGA
      /* const error = new Error("Invalid email or password");
      error.reasons = errors.array();
      throw error; */

      // RADIM OVO
      throw new RequestValidationError(errors.array());
      //
    }

    console.log("Creating a new user...");

    // UMESTO OVOGA
    // throw new Error("Error connecting to datbase");
    // RADIM OVO
    throw new DatabseConnectionError();
    //

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
