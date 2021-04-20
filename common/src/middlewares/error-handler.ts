import { Request, Response, NextFunction } from "express";

import { CustomError } from "../errors/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // JASA SAM OVAKO DEFINISAO DA SE STAMPAJU ERRORI
  // TO JE DAKLE CODE KOJI JE TO BIO RANIJE
  // OVO JE DOBRO, ALI POSTOJI BOLJI NACIN
  // console.log("ERROR -->", err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  // BOLJE JE DA STMAPAP ERROR, ZA KOJE NE ZNAM, KOJI NISU INSTANCE
  // MOG CustomError-A, KAO STO SU SVI ERROR-I KOJE SAM NAPRAVIO
  // OVDE CE SE DAKLE STMAPATI SAMO ERRORS KOJE
  // NE ATICIPATE-UJEM
  console.error(err);
  //

  res.status(400).send({
    errors: [
      {
        message: "Something went wrong!",
      },
    ],
  });
};
