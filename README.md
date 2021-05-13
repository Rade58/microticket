# MORE REALISTIC TEST ZA STRIPE CHARGING

DAKLE JA, ZA RAZLIKU OD ONOG STO SAM RADIO U PROSLOM BRANCH-U ZELIM DA SE HITT-UJE STRIPE API

RANIJE SAM MOCK-OVAO INSTATIATED `Stripe` INSTANCU

ODNONO MOCKOVAO SAM POZIVANJE `stripe.charges.create` FUNKCIJU

ALI SADA ZELI MORE REALISTIC TEST, U KOJEM CE SE HIT-OVATI ACTUAL STRIPE API

# PRVA STVAR KOJU CEMO URADITI JESTE DA CEMO NAS SECRET STRIPE API KEY STORE-OVATI INSIDE `.env` FILE, KOJI CEMO `gitignore`-OVATI NARAVNO, A KORISTICEMO PAKET `dotenv` ZA UCITAVANJE ENV VARIJABLE

- `touch payments/.env`

- `code .gitignore`

```py
# ...
# ...

# payments
payments/node_modules
# dodao ovo
payments/.env
```

- `code payments/.env`

MISLIM DA NE MORAM DA TI GOVORIM DA ACTUAL SECRET STRIPE KEY MOZES KOPIRATI IZ STRIPE DASBOARD-A, A AKO SI ZABORAVIO IME ENV VARIABLE KOJU SI UCITAO U SECRET OBJECT CLUSTERA, TO MOZES VIDETI U DEPLOYMENT CONFIG FILE-U

```py
STRIPE_KEY=<tvoj secret stripe key>
```

SADA MOZEMO DA INSTALIRAMO `dotenv`

- `cd payments`

- `yarn add dotenv --dev`

PA MOZEMO, POMENUTI PAKET DA ISKORISTIMO U SETUP FILE-U ZA JEST

- `code payments/src/test/setup.ts`

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

// EVO STA SAM DODAO
require("dotenv").config();

// ...
// ...
// ...
// ...
```

**SADA KADA BILO GDE U FILE-OVIMA KUCAS `process.env.STRIPE_KEY` KORISTICE SE TVOJ SECRET STRIPE KEY**

