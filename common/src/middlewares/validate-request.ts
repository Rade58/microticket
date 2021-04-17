import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import "express-async-errors";
import { RequestValidationError } from "../errors/request-validation-error";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // ZAPAMTI DA THROWING ERROR-A, SAMO FUNKCIONISE
    // ZATO STO IMAM PAKET `express-async-errors`
    throw new RequestValidationError(errors.array());
  }

  // AKO NEMA ERROR-A NASTAVLJA SE SE IZVRSAVANJEM HANDLER-A
  // ILI SLEDECEG MIDDLEWARE-A
  return next();
};
