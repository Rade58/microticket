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
      throw new Error("Invalid email or password");
    }

    console.log("Creating a new user...");
    // EVO RECIMO DA TI JE OVDE ZAKAZAO DATABASE
    throw new Error("Error connecting to datbase");
    // NARAVNO NECCES TI THROW-OVATI ERROR KAO SADA VEC
    // CE SAMI PROCESS TO RADITI ,ALI LET'S ASUME
    // THT YOUR DATABASE IS DOWN
    //

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
