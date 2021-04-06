import { Request, Response, NextFunction } from "express";
/* import { DatabseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error"; */
// OVA DVA GORNJA ERROR-A MI NISU NI POTREBNA ZA TO SAM IH COMMENT-OVAO OUT
// A OVO SAM UVEZAO
import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // UMESTO DVE USLOVNE IZJAVE

  /* if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  if (err instanceof DatabseConnectionError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  } */

  console.log("ERROR -->", err);

  // IMAM SAMO JEDNU
  if (err instanceof CustomError) {
    res.status(err.statusCode).send(err.serializeErrors());
  }
  //

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};
