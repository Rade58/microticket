# SUBCLASSING FOR CUSTOM ERRORS

REKAO SAM U PROSLOM BRANCH-U DA CU SADA NAPRAVITII DVE NOVE KLASE, KOJE CE IMPLEMENTIRATI `Error` BUILT-IN CLASS

KLASE KOJE PRAVIM IMACE IMENA `RequestValidationError` I `DatabaseConnectionError`

- `mkdir auth/src/errors`

- `touch auth/src/errors/{request-validation-error,database-connection-error}.ts`

JA CU IZGLEDA KORISTITI ValidationError INSTANCU, KOJA DOLAZI IZ `express-validator` PAKETA,I TU CU KLASU IPAK IMPLEMENTIRATI U MOJU CUSTOM VALIDATION KLASU 

- `code auth/src/errors/request-validation-error.ts`

```ts

```
