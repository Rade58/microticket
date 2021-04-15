# DEFINISANJE `getInitialProps` U `_app.tsx`

**VEROVATNO SE PITAS ZASTO NE KORISTITI `getServerSideProps` NA NIVOU _app**

ALI TO NIJE SUPPORTED JOS UVEK; BAR U APRILU 2021 JE TAKO

TI NE MOZES DEFINISATI TU NI `getStaticProps`

DAKLE `getInitialProps` JE JEDINA OPCIJA

MALO VISE O OVOJ FUNKCIJI MOZES SAZNATI [OVDE](https://nextjs.org/docs/advanced-features/custom-app) I [OVDE](https://nextjs.org/docs/basic-features/typescript#custom-app)

## DODACU, I TESTIRACU `getInitialProps` TAKO STO CU IZ NJEGA  PROSLEDITI NEKI DATA; JER ONDA CU OCEKIVATI DA TAJ DATA BUDE PRISUTAN KAO PROP NA SVAKOM PAGE-U

- `code client/pages/_app.tsx`

```tsx
import React from "react";
// EVO UZEO SAM I TYPE SA KOJI MCU TYPE-OVATI
// context ZA getInitialProps
import { AppProps, AppContext } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />;
    </div>
  );
}

// EVO TYPE-OVAO SAM TAJ context ARGUMENT
MyApp.getInitialProps = async (ctx: AppContext) => {
  // PROSLEDJUJEM BILO KAKAV PROPS
  return {
    placeholder: "placeholder",
  };
};

export default MyApp;
```


