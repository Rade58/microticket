import { Request, Response, NextFunction } from "express";
// UVOZIM ERROR KLASE
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";
//

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // SADA RADIM TYPE CHECKS
  if (err instanceof RequestValidationError) {
    console.log("handling this error as request validation error");
    return res.status(400).send({});
  }

  if (err instanceof DatabseConnectionError) {
    console.log("handling this error as datbase connection eror");

    return res.status(400).send({});
  }

  res.status(400).send({
    message: err.message,
  });
};
