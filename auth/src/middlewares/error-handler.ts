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
  if (err instanceof RequestValidationError) {
    // DODAO OVO
    const formattedErrors = err.errors.map(({ msg, param }) => {
      return {
        message: msg,
        field: param,
      };
    });

    return res.status(400).send({
      errors: formattedErrors,
    });
    //  ---------------------------
  }

  if (err instanceof DatabseConnectionError) {
    // DODAO OVO
    res.status(500).send({
      errors: [{ message: err.reason }],
    });
    // --------------------------
  }

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};
