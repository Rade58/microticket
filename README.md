# CREATING current-user MIDDLEWARE

***

digresija:

TI SI NAPRAVIO current-user HANDLER, I ON NE UZIMA NISTA IZ DATABASE-A; ON SAMO UZIMA PAYLOAD (A TO JE USER OBJEKAT) SA JSON WEB TOKENA

***

OVAJ MIDDLEWARE CU DA NAPRAVIM, JER CE I NEKI DRUGI MICROSERVICE-OVI SIGURNO HTETI DA GETT-UJU CURRENT USER-A

**PA JA PRAVIM OVAJ MIDDLEWARE, KAKO BI OBEZBEDIO CURRENT USER-A ZA NEKE DRUGE HANDLERE, ZA NEKE DRUGE MICROSERVICE-OVE**

**IDEJA JE DA OVAJ MIDDLEWARE UZME USER-A IZ DATBASE-A I DA GA UMETNE U `request` OBJECT**

**TIME BI ONAJ HANDLER, ZA KOJI BI DODAO POMENUTI MIDDLEWARE, IMAO NA requestu DOSTUPAN USER OBJECT; ODNOSNO USER OBJECT BI BIO NA `req.currentUser`**

NARAVNO TO SE TREBA RADITI UZ SVU VERIFY LOGIKU JSON WEB TOKENA

**MEDJUTIM MOZE SE U MIDDLEWARE ENCAPSULATE-OVATI LOGIKA KOJA REJECT-UJE REQUEST, AKO JE VERIFIKACIJA JWT-A NEUSPESNA**

# DAKLE PAYLOAD, KOJI SE UZME KADA SE VERIFIKUJE JWT, TREBA BITI UMETNUT KAO `req.currentUser`

**SADA CU DA NAPRAVIM POMENUTI MIDDLEWARE**

- `touch auth/src/middlewares/current-user.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

// DEFINISACU INTERFACE ZA PAYLOAD
interface UserPayloadI {
  email: string;
  id: string;
  iat: number;
}

// KAKO BI AUGMENT-OVO TYPE DEFINITIONS REQUEST-A MORAM URADITI OVAKO NESTO
// eslint USTVARI YELL-UJE NA MENE ZBOG OVOGA STO SAM URADIO

// ISTO TAKO TREBAS ZNATI DA CE SE OVO GLOBALNO ODRAZITI
// ODNOSNO I U DRUGIM FILE-OVIMA CE OVO BITI APLICIRANO
// ONDA SAM USTVARI JA OVO MOGAO BOLJE DEFINISATI, U NEKOM
// ODVOJENOM FILE-US 
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
```

# SADA CU REFAKTORISATI `/current-user` HANDLER, KAKO BI KORISTIO GORNJI MIDDLEWARE

- `code auth/src/routes/current-user.ts`

```ts
import { Router } from "express";
// import { verify } from "jsonwebtoken";
// UVOZIM current-user MIDDLEWARE
import { currentUser } from "../middlewares/current-user";
//

const router = Router();

// DODACU OVDE, POMENUTI MIDDLEWARW
router.get("/api/users/current-user", currentUser, (req, res) => {
  // AKO JE KORISNIK AUTHENTICATED IMAS NA req.currentUser USER OBJEKAT
  // A AKO NEM OBJEKAT ONDA JE req.currentUser, USTVARI null

  // ZATO MI NISTA OVO VISE NE TREBA
  /*
  if (!req.session || !(req.session as { jwt: string }).jwt) {
    res.send({ currentUser: null });
  }

  const { jwt } = req.session as { jwt: string };

  try {
    const payload = verify(jwt, process.env.JWT_KEY!);

    res.status(200).send({ currentUser: payload });
  } catch (err) {
    console.log(err);

    res.send({ currentUser: null });
  } */

  // A SALJEM OBJEKAT TO THE USER OVAKO
  // ALI VODIM RACUNA DA SALJEM null A NE undefined
  // PROSTO TAKO JE BOLJE
  res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };

```

## MOGU SADA OVO DA TESTIRAM U INSOMNIA-I

NAPRAVICEMO USER-A

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/signup`

METHOD JE:

`POST`

SALJEMO JSON

```json
{
	"email": "guliana@mail.com",
	"password": "ChillyIsGreat26"
}
```

SADA SMO KREIRALI USERA A PRIJAVLJENI SMO JER IMAMO JSON WEB TOKEN, KAO VREDNOST Set-Cookie HEADER-A

MOZEMO DA ZAHTEVAMO CURRENT USERA, KAKO BI SMO CONFIRM-OVALI DA SMO SIGNED IN

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/current-user`

METHOD JE: `GET`

I VIDECES DA CEMO DOBITI CURRENT USER-A

**STO ZNACI DA SMO DOBRO IZVRSILI GORNJI REFACTORING, GORNJU UPOTREBU currentUser MIDDLEWARE-A**

SADA CEMO DA SE SIGN-UJEMO OUT

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/signout`

METHOD JE:

`GET`

JSON KOJI DOBIJAM BI TREBAL ODA BUDE EMPTY OBJECT

```json
{}
```

**SAD MOZES DA POKUSAS DA UZMES CURRENT USER-A**

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/current-user`

METHOD JE: `GET`

I DOBIO SI

```json
{
  "currentUser": null
}
```

DAKLE USPESNO SMO DEFINISALI SAV REFACTORING, ODNOSNO NAS currentUser JE USPESNO SVE OBAVIO
