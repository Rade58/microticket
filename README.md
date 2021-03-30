# VERIFYING CUSTOM ERRORS

MOGAO SAM OVO DA OBAVIM TAKO STO BI KREIRAO JEDAN INTRFACE

```ts
interface CustomError {
  statusCode: number;
  serializeErrors(): {
    message: string;
    field?: string; 
  }[]
}

// I TAJ INTERFACE BI ONDA BIO IMPLEMENTED LIKE THIS

class SomeErrorClass extends Error implements CustomError {
  ...
}
```

**ALI JA OVO GORE NECU IPAK ODRADITI**
