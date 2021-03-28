import { Router, Request, Response } from "express";
// UVOZIM  I validationResult
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
    // GORE SI DEFINISAO VALIDATION STEP,
    // NA REQUEST-U BI TA VALIDACIJA TREBALA DA APPEND-UJE
    // INFO O TOME DA LI JE VALIDACIJA USPESNA ILI NE
    // A SA FUNKCIJOM validationResult, KOJU HARANIM SA
    // REQUESTOM JA USTVARI KORISTIM TAJ VALIDATION INFORMTIO

    // OVO JE OBJEKAT , KOJI MIGHT HAVE ERORS OR NOT
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // AKO NA OVOM OBJEKTU IMA EROR-A
      // SALJEM ARRAY TIH ERROR-A
      // SLACE SE SVI MOGUCI ERRORS AKO SU SE DESILI
      // ZA ONE POGRESNO UNETE FIELD-OVE
      // TO JE USTVARI ERROR IF JSON DATA
      return res.status(400).send(errors.array());
    }

    // GORE SU ERRORS HANDLED, A OVDE SE ONDA MOZE CREIRATI
    // USER, POSTO KAKO VIDIS OVO JE signup HANDLER

    console.log("Creating a new user");

    // TEMPORARY ZA SADA CU POSTATI email I password NAZAD
    // DAKLE SAMO DA BI TESTIRAO OVAJ HANDLER

    const { email, password } = req.body;

    res.send({ email, password });
  }
);

export { router as signUpRouter };
