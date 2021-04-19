import { Router, Request, Response } from "express";
//
import { body } from "express-validator";

// UVOZIM MOJ MIDDLEWARE validatteRquest
import { requireAuth, validateRequest } from "@ramicktick/common";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  // ZADAJEM MIDDLEWARES
  [body("title").not().isEmpty().withMessage("title is required")],
  //

  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };
