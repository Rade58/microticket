# SUBCLASSING FOR CUSTOM ERRORS

REKAO SAM U PROSLOM BRANCH-U DA CU SADA NAPRAVITII DVE NOVE KLASE, KOJE CE EXTEND-OVATI `Error` BUILT-IN CLASS

KLASE KOJE PRAVIM IMACE IMENA `RequestValidationError` I `DatabaseConnectionError`

- `mkdir auth/src/errors`

- `touch auth/src/errors/{request-validation-error,database-connection-error}.ts`

JA CU IZGLEDA KORISTITI ValidationError TYPE, KOJA DOLAZI IZ `express-validator`, KAKO BI TYPE-OVAO ARGUMENTE KONSTRUKTORA

- `code auth/src/errors/request-validation-error.ts`

```ts
import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super();
    this.errors = errors;

    // NE ZNAM DA LI JE OVO SUVISNO ILI NE, ALI AUTOR WORKSHOP-A
    //  JE OVO STAVIO

    // ZADAO JE DA PROTOTIP OVE KLASE KOJU BUILD-UJEM UPRAVO Error
    // NE ZNAM ZASTO JE OVO MORALO, ALI ON KAZE DA JE TO
    // SAMO ZATO STO SE extend-uje BUILT IN CLASS
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    // NIJE MI JASNO OVO GORE JER JA VIDIM CIRCULAR REFERENCE
    // MEDJUTIM AUTOR WORKSHOPA JE REKAO DA JE TO SAM OZATO STO
    // EXTEND-UJEM BUILT IN CLASS
  }
}
```

SADA CU DA KREIRAM I DRUGU ERROR KLASU

- `code auth/src/errors/database-connection-error.ts`

```ts
export class DatabseConnectionError extends Error {
  public error = "Error connecting to the datbase";

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }
}

```
