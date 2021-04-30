import { Router, Request, Response } from "express";
// UVOZIM OVE MIDDLEWARE-OVE
import { requireAuth, validateRequest } from "@ramicktick/common";
//
// UZIMAM bofy MIDDLEWARE SA express-validator-A
import { body } from "express-validator";

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
      .isHexadecimal()
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // AKO NE POSTOJI AUTHENTICATED USER, MIDDLEWARE CE ODRADITI SVOJE
    // THROW-OVACE ERROR DO ERROR HANDLING MIDDLEWARE-A

    // IIZDVAJAM STVARI SA BODY-JA
    const { ticketId } = req.body;

    res.send({});
  }
);

export { router as listAllOrdersRouter };
