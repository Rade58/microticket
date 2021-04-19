import { Router, Request, Response } from "express";

// UVESCU I ONO STO MI DOZVOLJAVA DA THROW-UJEM ERRORS
import "express-async-errors";

// UVOZIM OVAJ MIDDLEWARE, CIJA JE ULOGA DA PROVERI COOKIE
// I D LI JE VALIDNI JSON WEB TOKEN U NJEMU
import { currentUser, NotAuthorizedError } from "@ramicktick/common"; // OVO JE MOJ LIBRARY

const router = Router();

router.post(
  "/api/tickets",
  // MIDDLWEARE CE INSERTOVATI currentUser U req
  // AKO JE SVE VALID
  currentUser,
  async (req: Request, res: Response) => {
    // PRAVIMO USLOVNU IZJAVU
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    return res.status(201).send({});
  }
);

export { router as createTicketRouter };
