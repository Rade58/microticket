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

# MOGU SADA DA U INSOMNIA-I DA NAPRAVIM QUICK TEST

**IZBRISI COOKIE IZ INSOMNIE PRE TESTIRANJA** ( OVO TI GOVORIM JER SE INSOMNIA PONASA KO WE BROWSER, NARVNO, CUVACE COOKIE ZA DOMEN ZA KOJI SI DEFINISAO COOKIE RANIJE) (GOVORIM TI OVO JER MOZE DOCI DO GRESKE KADA KREIRAS USER-A DA SE UPOTREBI DRUGI COOKIE)(IMAS DUGME ZA MANGING COOKIES U INSOMNII) (**MOZE SE DESITI DA CES MORATI DA REBUILD-UJES REQUEST U ISOMNII, JER TI SE COOKIE NECE SLATI NAZADD JER SI GA UKLONIO MANUELNO**)

PRVO CU DA NAPRAVIM NOVOG USER-A (RADIM OVO SAMO JER SAM ZABORAVIO USERE KOJE SAM VEC KREIRAO)

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/signup`

METHOD JE:

`POST`

SALJEMO JSON

```json
{
	"email": "fidence@live.com",
	"password": "CoolPerson66"
}
```

NAPOMINJEM TI SAM ODA CES U RESPONSE-U DOBITI `Set-Cookie` HEADER, CIJA VREDNOST JE ENCODED INTO BASE64 ONAJ POBJEKAT `{jwt: <user-ov jwt>}`

**SADA KADA BI PRAVIO FOLLOWUP REQUEST, STO CU JA URADITITI PREMA `/current-user`, ISTI TAJ BASE64 COOKIE BI SE SLAO KAO VREDNOST `Cookie` HEADER-A** (CISTO TI NAPOMINJEM SVE OVE STVARI AKO SI ZABORAVIO)

**SADA PRAVIM REQUEST PREMA /current-user**

DAKLE REQUEST PRAVIMO PREMA:

`https://microticket.com/api/users/current-user`

METHOD JE:

`GET`

**EXECUTE-OVAO SAM REQUEST I EVO STA SAM DOBIO**

```json
{
  "currentUser": {
    "email": "fidence@live.com",
    "id": "606d953da27f720018b04697",
    // OVO JE TIME OF ISSUING
    "iat": 1617794365
  }
}
```

**PROBAJ SADA DA OPET PRITISNES DUGME `Manage Cookies` I DA IZBRISES COOKIE**

PA SADA PROBAJ DA NAPRAVIS REQUEST PREMA `https://microticket.com/api/users/current-user`

OBIO SAM OVO U RESPONSE-U

```json
{
  "currentUser": null
}
```

