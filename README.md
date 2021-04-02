# PROPPER ERROR HANDLING

DAKLE, AKO USER VEC POSTOJI, JA BI TREBAO DA THROW-UJEM ERROR

TAKAV FLOW SANM NAPRAVIO U MOM HANDLERU DA USTVARI THROW-UJEM ERRORS A NE KORISTIM next (AKO SE SECAS, ZBOG KORISCENJA `express-async-errors`)

SADA ZELIM DA NAPRAVIM TAJ CUSTOM ERROR KOJI CE USER-U DATI INFO DA JE IKORISTIO POGRESAN MAIL ZA SIGNUP

ALI OVO CE BITI POPRILICNO GENERIC ERROR, U KOJEM CU JA MOCI DA PASS-UJEM STRING O TOME STA NIJE U REDU, ZANCI DA JE NECU SAMO MORATI REUSE-OVATI SAMO KADA JE EMAIL ALREADY IN USE, VEC I ZA DRUGE MOGUCE GRESKE

USTVARI TO CE BITI ERROR KOJI CU THROW-OVTI ALL THE TIM, KADA JE U PITANJU ERROR, ZA KOJI NEMA POTREBE DA BUDE VISE OD NEKOG GENERAL USE CASE-A

## KREIRACU `BadRequestError` ERROR KLASU

- `touch auth/src/errors/bad-request-error.ts`

```ts
// UVOZIM ABSTRACT CLASS CustomError KOJU SAM RANIJE DAVNO NAPRAVIO
import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode = 400;
  public message: string;

  constructor(message: string) {
    super(message);

    this.message = message;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return {
      errors: [
        {
          message: this.message,
        },
      ],
    };
  }
}

```
