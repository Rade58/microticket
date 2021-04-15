# CREATING REUSABLE REACT `Header` COMPONENT

JASNO TI JE DA CE SE OVA KOMPONENTA PRIKAZIVATI NA SVAKOM PAGE-U; **JER CE U NJOJ BITI NAVIGACIJA**

**A POSTO ZELIS DA TI OVA KOMPONENTA BUDE DISPLAYED NA SVAKOM PAGE, JASNO TI JE DA CES KORISTITI CUSTOM `_app` PAGE ZA DODAVANJE POMENUTE KOMPONENTE** (VEC SI NAPRAVIIO /pages/_app.tsx RANIJE ZBOG DODAVANJA GLOBALNIH STILOVA)

## PRVO CU PROVERITI DA LI CE SE REACT ELEMENT, KOJU BUDEM STAVIO U `_app.tsx` ZAISTA BITI RENDERED

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  // DODAJEM DIV I ONDA CU PORED STO CU U NJEGA NESTOVATI Component
  // TAKODJE CU DODATI PRE TOGA I NEKI h1

  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />;
    </div>
  );
}

export default MyApp;
```
