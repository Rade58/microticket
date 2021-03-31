import { Router, Request, Response } from "express";
// EVO UVEZAO SAM PAKET
import "express-async-errors";
//
import { body, validationResult } from "express-validator";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

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
      // I SMEM DA THROW-UJEM ERRORS, I ZNAM DA CE ONE
      // ZAVRSITI INSIDE ERROR HANDLING MIDDLEWARE, BAS
      // KAO DA SAM IH PASS-OVAO KROZ next
      throw new RequestValidationError(errors.array());
    }

    console.log("Creating a new user...");

    throw new DatabseConnectionError();

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
