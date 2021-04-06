import { Router, Request, Response } from "express";
// RANIJE SAM ZABORAVIO DA UVEZEM OVO
import "express-async-errors"; // (AKO SI ZABORAVIO OVAJ PAKET TI SLUZI DA
// DA NE MORAS DA KORISTIS next
// A BI PREKINUO IZVRSAVANJE HANDLERA NA TOM MESTU
// VEC DA MOES DA THROW-UJES ERROR UMESTO TOGA
// A KAO STO MOZES VIDETI JA DOSTA THROW-UJEM U HANDLER-U)
import { User } from "../models/user.model";
import { sign } from "jsonwebtoken";
// OVO COMMENT-UJEM OUT JER GA KORISTIM U MIDDLEWARE-U
import { body /*validationResult*/ } from "express-validator";
// I OVO MI NE TREBA JER GA SAMO KORISTIM U MIDDLEWARE-U
// import { RequestValidationError } from "../errors/request-validation-error";
import { Password } from "../utils/password";
// UVOZIM MOJ MIDDLEWARE
import { validateRequest } from "../middlewares/validate-request";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid!"),
    body("password").trim().notEmpty().withMessage("You must supply password!"),
  ],
  // DODAJEMM MIDDLEWARE
  // DA MOZDA TI JE CUDNO ALI TO RADIS
  // NAKON OVOG ARRAY-A (MOZDA SI POMISLIO DA MIDDLEWARE-OVI MORAJU U ARRAY
  // ALI NIJE TAKO , TI SVE STO LAY-UJES PRE HANDLERA JETE MIDDLEWARE)
  validateRequest,
  //
  async (req: Request, res: Response) => {
    //  I OVO VISE NIJE POTREBNO JER SAM GA ZAMENIO MIDDLEWARE-OM
    /* const errors = validationResult(req);

    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    */

    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) throw new Error("user email doesn't exist");

    const passwordIsMatching = await Password.compare(user.password, password);

    if (!passwordIsMatching) throw new Error("Wrong password");

    const jwt = sign({ email, id: user._id }, process.env.JWT_KEY as string);

    req.session = {
      jwt,
    };

    return res.status(200).send(user);
  }
);

export { router as signInRouter };
