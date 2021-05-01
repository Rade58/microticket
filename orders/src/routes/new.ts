import { Router, Request, Response } from "express";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";

const router = Router();

router.get(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    res.send({});
  }
);

export { router as createNewOrderRouter };
