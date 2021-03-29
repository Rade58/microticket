import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";

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
      // EVO UMESTO DA THROW-UJE SAMO ERROR
      // throw new Error("Invalid email or password");
      // U JAVASCRIPT LAND-U BI JA MOGO DA URADIM OVAKO NESTO

      // PRAVIM ERROR
      const error = new Error("Invalid email or password");
      // SADA DODAJEM NOVI PROPERTI NA TAJ ERROR
      // I ZADAJEM DA VALUE BUDE ONAJ ARRAY OF WELL STRUCTURED
      // JER  TAKAV DATASET PRUZA KORISCENJE express-validator
      error.reasons = errors.array();

      // I SADA THROW-UJEM DO EROOR HANDLING MIDDLEWARE-A
      throw error;
    }

    console.log("Creating a new user...");

    throw new Error("Error connecting to datbase");

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
