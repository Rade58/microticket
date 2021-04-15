# DEFINISANJE `getInitialProps` U `_app.tsx`

**VEROVATNO SE PITAS ZASTO SE NE KORISTITI `getServerSideProps` NA NIVOU _app PAGE-A**

**ALI TO NIJE SUPPORTED JOS UVEK; BAR U APRILU 2021 JE TAKO**

**TI NE MOZES NA _app LEVELU DEFINISATI NI `getStaticProps`**

DAKLE `getInitialProps` SE JEDINO MOZE DEFINISATI KAO HOOK U `_app.tsx` FILE-U

MALO VISE O OVOJ FUNKCIJI MOZES SAZNATI [OVDE](https://nextjs.org/docs/advanced-features/custom-app) I [OVDE](https://nextjs.org/docs/basic-features/typescript#custom-app)

**MEDJUTIM KADA KORISTIS `getServerSideProps` ZA NEKI OD TVOJIH PAGE-OOVA, TO CE UCINITI DA ONAJ `getInitialProps` NE MOZE UOPSTE PROSLEDITI NI JEDAN PROP DO PAGE KOMPONENTE, BEZ OBZIRA SRO U TVOM PROJEKTU NEKI PAGE IMA `getServerSideProps`, A DRUGI NEMA; NI ONAJ KOJI NEMA `getServerSideProps` NECE DOBITI PROPSE OD _app-OVOG `getServerSideProps`**

## DODACU, I TESTIRACU `getInitialProps` TAKO STO CU IZ NJEGA  PROSLEDITI NEKI DATA

- `code client/pages/_app.tsx`

```tsx
import React from "react";
// EVO UZEO SAM I TYPE SA KOJIM CU TYPE-OVATI
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
MyApp.getInitialProps = async (appCtx: AppContext) => {

  // NAMERNO STMAPAM DA VIDIM DA LI CE SE
  // FUNKCIJA IZVRSITI SLANJEM REQUESTA ZA PAGE
  // ODNOSNO NA POSETU SVAKOG PAGE-A
  console.log("GET INITIAL PROPS");

  // PROSLEDJUJEM BILO KAKAV PROPS
  return {
    placeholder: "placeholder",
  };
};

export default MyApp;
```

ZASTO OVO RADIM

PA PORED TOGA STO ZELIM A VIDIM DA LI CE POMENUTA FUNKCIJA DA PROSLEDI DATA KOA PROPS ZA SVAKI OD PAGE-OVA KOJE IMAM (REKAO SAM DASE TO NECE DOGODITI); **ZELIM DA VIDIM DA LI CE SE NESMETANO IZVRSITI I `getServerSideProps`, KOJI SAM DEFINISAO NA NIVOU INDEX PAGE**

***
***

**NAIME PROPS KOJI SAM PROSLEDIO IZ `_app.getInitialProps` NISU PROSLEDJENI NI U JEDAN OD MOJIH PAGE-OVA**

**ALI SE HOOK IZVRSIO ZA SVAKI PAGE, JER SE, U TERMIANLU, STAMPAO, ONAJ TEKST ZADAT U `_app.getInitialProps`, PRI POSETI SVAKOG PAGE-A**

***

# SADA CU COMMENT-OVATI OUT, ONAJ JEDINI `getServerSideProps` KOJI IMAM VEZAN ZA MAIN PAGE; PA CU POSETITI NEKI OD PAGE-OVA DA VIDIM DA LI CE OVOG PUTA `_app.getInitialProps` PROSLEDITI PROP DO PAGE-A




