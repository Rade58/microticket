# DEFINISANJE `getInitialProps` U `_app.tsx`

**VEROVATNO SE PITAS ZASTO SE NE KORISTITI `getServerSideProps` NA NIVOU _app PAGE-A**

**ALI TO NIJE SUPPORTED JOS UVEK; BAR U APRILU 2021 JE TAKO**

**TI NE MOZES NA _app LEVELU DEFINISATI NI `getStaticProps`**

DAKLE `getInitialProps` SE JEDINO MOZE DEFINISATI KAO HOOK U `_app.tsx` FILE-U, DOK SE DEUGI HOOK-OVI NE MOGU DEFINISATI NA NIVOU _app

MALO VISE O OVOJ FUNKCIJI MOZES SAZNATI [OVDE](https://nextjs.org/docs/advanced-features/custom-app) I [OVDE](https://nextjs.org/docs/basic-features/typescript#custom-app)

**NE ZNAM DA LI JE RELEVANTNO DA TO KAZEM SADA, ALI TI MOZES KORISTITI I HOOKS NA NIVOU PAGE-A, A TAKODJE DA SE DEFINISE `_app.getInitialProps`**

## DODACU, I TESTIRACU `getInitialProps` TAKO STO CU IZ NJEGA  PROSLEDITI NEKI DATA; ALI OBRATI PAZNJU DA `ONO STA PROSLEDIS MORA BITI PROSLEDJENO KAO` `pageProps`

- `code client/pages/_app.tsx`

```tsx
import React from "react";
// EVO UZIMAM I TYPE AppContext
import { AppProps, AppContext } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />
    </div>
  );
}

// EVO TYPE-OVAO SAM CONTEXT
MyApp.getInitialProps = async (appCtx: AppContext) => {
  // NAMERNO STMAPAM DA VIDIM DA LI CE SE
  // FUNKCIJA IZVRSITI SLANJEM REQUESTA ZA PAGE
  // ODNOSNO NA POSETU SVAKOG PAGE-A
  console.log("GET INITIAL PROPS");

  // PROSLEDJUJEM BILO KAKAV PROPS

  return {
    // I OPET TI NAPOMINJEM DA JE BITNO DA OVO BUDE `pageProps`
    pageProps: {
      placeholder: "plceholder",
    },
  };
};

export default MyApp;

```

ZASTO OVO RADIM

PA PORED TOGA STO ZELIM A VIDIM DA LI CE POMENUTA FUNKCIJA DA PROSLEDI DATA KOA PROPS ZA SVAKI OD PAGE-OVA KOJE IMAM; **ZELIM DA VIDIM DA LI CE SE NESMETANO IZVRSITI I `getServerSideProps`, KOJI SAM DEFINISAO NA NIVOU INDEX PAGE**

***
***

NAIME JA SAM I U `/`, I U `auth/signup`, I U `auth/signin` PAGE DEFINISAO DA SE PROPSI STMPAJU (NECU TI TO POKAZIVATI OVDE DA NE BI OVE GOMILAO CODE BLOCKS, A ISAM MOZES VIDETI U PAGE-OVIMA DA TO JESAM URADIO)

***
***

**NAIME PROPS KOJI SAM PROSLEDIO IZ `_app.getInitialProps` PROSLDJENI SU DO SVIH PAGE-OVA**

**HOOK `_app.getInitialProps` SE IZVRSIO ZA SVAKI PAGE, JER SE, U TERMIANLU, STAMPAO, ONAJ TEKST ZADAT U `_app.getInitialProps`, PRI POSETI SVAKOG PAGE-A**

***
***

# TI NARAVNO MOZES INTERCEPT-OVATI PROSLEDJENI DATA IZ `_app.getInitialProps` U SAMOJ `MyApp` KOMPONENTI

MORAMO TO MALO BOLJE DA INSPECT-UJEMO

- `code client/pages/_app.tsx`

```tsx

```
