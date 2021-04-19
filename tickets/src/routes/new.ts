import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
    // DODAJEM OVO
    // price MORA DA BUDE FLOATING POINT, VECI OD NULA
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };
