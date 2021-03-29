# SUBCLASSING FOR CUSTOM ERRORS

REKAO SAM U PROSLOM BRANCH-U DA CU SADA NAPRAVITII DVE NOVE KLASE, KOJE CE EXTEND-OVATI `Error` BUILT-IN CLASS

KLASE KOJE PRAVIM IMACE IMENA `RequestValidationError` I `DatabaseConnectionError`

- `mkdir auth/src/errors`

- `touch auth/src/errors/{request-validation-error,database-connection-error}.ts`

JA CU IZGLEDA KORISTITI ValidationError TYPE, KOJA DOLAZI IZ `express-validator`, KAKO BI TYPE-OVAO ARGUMENTE KONSTRUKTORA

- `code auth/src/errors/request-validation-error.ts`

```ts

```
