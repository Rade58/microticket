import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface UserPayloadI {
  email: string;
  id: string;
  iat: number;
}

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      currentUser?: UserPayloadI;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.jwt) {
    return next();
  }

  try {
    const { jwt } = req.session as { jwt: string };
    const payload = verify(jwt, process.env.JWT_KEY as string) as UserPayloadI;

    req.currentUser = payload;

    return next();
  } catch (err) {
    console.log(err);
  }

  return next();
};
