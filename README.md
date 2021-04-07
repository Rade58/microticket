# `/current-user` HANDLER

DAKLE SVAKI FOLLOW-UP REQUEST SA CLIENT-A (NAKON STO USPESNO signin ILI signup OBEZBEDE JWT DO FRONTENDA) IMACE JSON WEB TOKEN KAO DEO `Cookie` HEADER-A, ALI NA SLEDECI NACIN

**OVO JE VREDNOST TVOG `Cookie` HEADER-A**

`{jwt: <tvoj jwt>}`

ALI ONA JE PRETVORENA U BASE64 KADA JE STIGLA DO BROWSERA, PA PREDPOSTAVLJAM DA SE U BASE64 OBLIKU SALJE NAZAD DO SERVERA U SVAKOM FOLLOWUP REQUEST-U

**PREDPOSTAVLJAM DA CE cookieSession MIDDLEWARE VEC TO URADITI ZA MENE PA CU IMATI TAJ COOKIE DOSTUPAN KAO TRANSFORMED FROM BASE64, DAKLE DA CE BITI PLAIN JAVASCRIPT OBJECT**

- `code auth/src/routes/current-user.ts`

```ts
import { Router } from "express";
// UVOZIM OVO JER ZELIM D VIDIM DA LI CE JWT BITI VALID
import { verify } from "jsonwebtoken";

const router = Router();

router.get("/api/users/current-user", (req, res) => {
  // AKO NE POSTOJI jwt ON req.session SEND-OVATI RESPONSE
  // EARLY, A SA user
  if (!req.session || !(req.session as { jwt: string }).jwt) {
    // AUTOR WORKSHOPA NE STAVLJA STATUS U OVOM SLUCAJU
    res /* .status(400) */
      .send({ currentUser: null });
  }

  const { jwt } = req.session as { jwt: string };

  // SADA VERIFY-UJEM TOKEN

  try {
    const payload = verify(jwt, process.env.JWT_KEY!);

    res.status(200).send({ currentUser: payload });
    // SAMO TI NAPOMINJEM paylod JE U FORMATU {id, email}
  } catch (err) {
    console.log(err);

    res /* .status(400) */
      .send({ currentUser: null });
  }

  // TI I NISI MORAO DA KORISTIS TRY CATCH BLOK
  // OVO GORE SI TI MOGAO DA URADDIS TAKO DA SVE WRAPP-UJES U PROMISE
  // STO SAM RADIO JEDNOM RANIJE, POGLEDAJ OVAJ LINK
  // https://github.com/Rade58/apis_trying_out_and_practicing/blob/master/Node.js/1.%20API%20DESIGN/e)%20AUTH/VEZBA/SECURING%20API%20SA%20JWT-OM.md
});

export { router as currentUserRouter };
```
