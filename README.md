# CODE SHARING AND REUSING BETWEEN MICROSERVICES

NAIME, TI CES U CLUSTERU DODAVATI JOS DEPLOYMENTA, ODNOSNO JOS POD-OVA, ODNOSNO DODAVACES JOS MICROSERVICE-OVA, A ONI CE BITI EXPRESS BASED

NA PRIMER POSTOJI LOGIKA KOJU TI TRENUTNO KORISTIS U `auth` MICROSERVICE-U, A KOJA MOZE BITI REUSED I U DRUGIM, TVOJIM BUDUCIM MICROSERVICE-OVIMA, KAO STO CE BITI MICROERVICES ZA `orders` I `tickets` SERVICE

NA PRIMER KORISNIK NECE MOCI KREIRATI NEW TICKETS AKO NIJE AUTHENTICATED

**A JA SAM NA PRIMER LOGIKU KOJU PROVERAVA DA LI POSTOJI VALID COOKIE I LOGIKU KOJA VERIFIKUJE JWT, ENCAPSULATE-OVAO INSIDE EXPRESS MIDDLEWARE `auth/src/middlewares/current-user.ts`**

- `cat auth/src/middlewares/current-user.ts`

```ts
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

```

E PA TAJ MIDDLEWARE JA BIH MOGAO KORISTITI I U DRUGIM MICROSERVICE-OVIMA

## ALI TO NIJE JEDINA LOGIKA KOJU MOGU REUSE-OVATI, I U DRUGIM MICROSERVICE-OVIMA

TU JE I CEO ONAJ "Custom Error SISTEM", KOJI IMAM; SVE INSIDE FOLDER: `auth/src/errors`

ZATIM TU JE I ONAJ MIDDLEWARE KOJI PROVERVA VALIDNOST UNESENIH email I password-A, PRILIKOM KORISNIKOVOG PRIJAVLJIVANJA

A TAJ MIDDLEWARE, SE MOZE KORISTITI KAO DEO CODE, KOJI KAO MIDDLEWARE STOJI ISPRED BILO KOJEG HANDLER-A KOJI DOBIJA VREDNOSTI NEKIH FIELD-OVA, KOJI SU ZA PROVERU (`auth/src/middlewares/validate-request.ts`)
