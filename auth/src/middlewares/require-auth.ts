import { Request, Response, NextFunction } from "express";
// UVOZIM POMENUTI PAKET
import { NotAuthorizedError } from "../errors/not-authorized-error";
//

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
  if (!req.currentUser) {
    // UMESTO OVOGA
    // return res.status(401).send("Unauthorized");
    // THROW-UJEM ERROR
    throw new NotAuthorizedError();
  }

  next();
};
