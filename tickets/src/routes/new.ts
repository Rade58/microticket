import { Router, Request, Response } from "express";

// OVO NE TREBA
import { requireAuth } from "@ramicktick/common"; // OVO JE MOJ LIBRARY

const router = Router();

router.post(
  "/api/tickets",
  // DODAJEM GA
  requireAuth, // ON THROW-UJE ERROR AKO NEM req.currentUser

  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };
