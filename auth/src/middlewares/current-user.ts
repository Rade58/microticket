import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";

// DEFINISACU INTERFACE ZA PAYLOAD
interface UserPayloadI {
  email: string;
  id: string;
  iat: number;
}

// KAKO BI AUGMENT-OVO TYPE DEFINITIONS REQUEST-A MORAM URADITI OVAKO NESTO
// eslint USTVARI YELL-UJE NA MENE ZBOG OVOGA STO SAM URADIO
declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      currentUser?: UserPayloadI;
    }
  }
}
// MOZDA TI SE CINI KADA GLEDAS GORNJI DECLARATION DA ON MENJA
// PREDHODNI TYPE DEFINITIONS ZA Request; I KAKO BI BILO BOLJE
// DASI KORISTIO extends (NE MOZES TO KORISTITI)
// E PA NE MENJA SAMO  AUGMENT-UJES

export const currentUser = (
  // MORACEMO AUGMENT-OVATI REQUEST TYPE DEFFINITION
  // KAKO BI NA NJEMU DEFINISAO TYPE ZA req.currentUser
  // MISLIM DA JE TO MOGUCE KORISCENJEM GENERICS-A
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.jwt) {
    // OVDE PREKIDAMO IZVRSENJE OVOG MIDDLEWARE, POZIVANJEM nexxt-A
    // DAKLE PRELAZIMO NA SLEDECI MIDDLEWARE
    return next();
    // DILEMA MI JE OVDE ZASTO NISM THROW-OVAO ERROR (ZA STA SAM MORAO KORISTITI express-async-errors)
    // ODNOSNO ZASTO NISAM POSLAO ERROR KROZ next
    // KAKO BI TAJ ERROR BIO PASSED TO ERROR HANDLINF MIDDLEWRE, KOJ ISAM WIRE-OVAO
    // OCIGLDNO SE OVDE ZELI DA SE IZVRSAVANJE SLEDECEG MIDDLEWARE-A
    // NASTAVI
    // ODNOSNO ZELI SE TO DA NEDOSTATAK USERA NE IZAZOVE ERROR
  }

  try {
    // VERIFING JWT
    const { jwt } = req.session as { jwt: string };
    const payload = verify(jwt, process.env.JWT_KEY as string) as UserPayloadI;
    // OVDE UMECEM USER-A U REQUEST
    req.currentUser = payload;
    // I OVDE POZIVAMO next
    next();
  } catch (err) {
    // A OVDE BI OPET TREBAO DA POZOVEM NEXT KAKO BI SE PRESLO NA SLEDECI MIDDLEWARE
    // ALI NE MORAM TO OVDE JER CU next, I INACE POZVATI NAKON BLOKA
    // next();
  }

  next();
};
