import { Router, Request, Response } from "express";
// UVOZIM OVE MIDDLEWARE-OVE
import { requireAuth, validateRequest } from "@ramicktick/common";
//
// UZIMAM bofy MIDDLEWARE SA express-validator-A
import { body } from "express-validator";

// UZECU UTILITY FROM MONGOOSE KOJI CE USTVARI RECI
// DA LI JE NEKI ID VALIDAN MONGO-V ID
import { Types as MongooseTypes } from "mongoose";
//

const router = Router();

// ZADAJEM MIDDLEWARES
router.get(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      // EVO OVO JE VALIDACIJA O TOME DA LI SE RADI
      // O ID-JU DOKUMMENTA IZ MONGO-A
      // PRAVIM OCUSTOM VALIDACIJU
      .custom((input: string) => {
        // OVO CE BITI BOOLEAN
        return MongooseTypes.ObjectId.isValid(input);
      })
      //
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // AKO NE POSTOJI AUTHENTICATED USER, MIDDLEWARE CE ODRADITI SVOJE
    // THROW-OVACE ERROR DO ERROR HANDLING MIDDLEWARE-A

    // IIZDVAJAM STVARI SA BODY-JA
    const { ticketId } = req.body;
    // OVDE CU SADA STATI DA BI TI OBJASNIO
    // ONO U VEZI MICROSERVICE COUPLING-A

    res.send({});
  }
);

export { router as listAllOrdersRouter };
