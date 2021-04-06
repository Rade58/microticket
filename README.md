# signin FLOW

DAAKLE JA SAM ZAVRSIO SA signup LOGIKOM, A SADA CU DA SE POZABAVIM SA SIGNIN

ZA SADA JE TAJ ROUTER SAMO BAREBONES KOJI NISTA NE SALJE NAZAD

- `cat auth/src/routes/signin.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/users/signin", (req, res) => {});

export { router as signInRouter };
```

# OVO CE BITI SIGNIN FLOW, KOJI CU DEFINISATI

1. SA CLIENTA (Nextjs APP) SE SALJE REQUEST PREMA `/api/users/signin`

ONO STO S SALJE U REQUESTU JE `{emai, password}`

A HANDLER TREBA DA

- PROVERI DA LI USER SA TAKVIM EMAIL-OM POSTOJI

- AKO USER NE POSTOJE, TREBA RESPOND-OVATI SA ERROR-OM

- AKO POSTOJI, TREBA SE COMPARE-OVATI SUPPLIED PASSWORD S STORED PASSWORDOM (UTILITY METODE ODNOSNO KLASU SAM VEC PODESIO U `auth/src/utils/password.ts`)

- AKO JE PASWORD THE SAME, SVE JE U REDU

- USER JE ONDA CONSIDERED TO BE LOGGED IN I SALJE MU SE GENERATED JWT

2. SA RESPONSE-OM TREBA SLATI SA HEADEROM `Set-Cookie` CIJA VREDNOST TREBA DA BUDE OBJEKAT `{jwt: <GENERATED JSON WEB TOKEN>}` (**STO NARAVNO RADIM, UZ KORISCENJE PAKETA `cookie-session`, JIJU SAM LOGIKU VEC DEFINISAO INSIDE `auth/src/index.ts`**)

# POCINJEM SA DEFINISANJEM

- `code auth/src/routes/signin.ts`

```ts

```


