import { Request, Response, NextFunction } from "express";
import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    // UMESTO SVEGA OVOGA

    /* const formattedErrors = err.errors.map(({ msg, param }) => {
      return {
        message: msg,
        field: param,
      };
    });

    return res.status(400).send({
      errors: formattedErrors,
    }); */

    // OVO
    return res.status(err.statusCode).send(err.serializeError());
  }

  if (err instanceof DatabseConnectionError) {
    // UMESTO OVOGA
    /* res.status(500).send({
      errors: [{ message: err.reason }],
    }); */
    // OVO
    return res.status(err.statusCode).send(err.serializeError());
  }

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};
