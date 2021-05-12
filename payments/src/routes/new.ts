import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //
    // ZA SADA CU SAMO DA SEND-UJEM ARBITRARY THING
    // KOJI CU KASNIJE REPLACE-OVATI, VEMO BRZO
    res.send({ success: true });
  }
);

export { router as createChargeRouter };
