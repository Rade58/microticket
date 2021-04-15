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

# TI NARAVNO MOZES INTERCEPT-OVATI PROSLEDJENI DATA IZ `_app.getInitialProps` U SAMOJ `MyApp` KOMPONENTI ;ALI DAKLE TO NIJE JEDINI DATA, AKO IMAS NEKI HOOK NA INDIVIDUAL PAGE-U, INSIDE MyApp, BI TREBAL OD IMAS PRISTUP I TIM PROPSIMA

MORAMO TO MALO BOLJE DA INSPECT-UJEMO SVE AROUND _app

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import { AppProps, AppContext } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  // ONO STO JE BITNO JESTE DA AKO OVDE ZADAS NEKI CODE
  // TO CE BITI FRONTEND CODE KOJI CE BITI IZVRSEN ZA SVAKI PAGE
  // TAKO DA I AKO ZADAS console.log
  // ON CE SE IZVRSITI U BROWSER-VOJ KONZOLI
  // PAGE-, KOJI SE POSECUJE
  console.log(JSON.stringify({ pageProps }, null, 2));

  // pageProps SU, DAKLE PROPSI, JEDNOG PAGE-A
  // ALI MEDJU NJIMA TREBAJ UDA BUDU I ONI PROSI PROSLEDJENI OD
  //    MyApp.getInitialProps 

  // SADA SVE MALO IMA VISE SMISLA
  // ZATO JE OVO CONVINIENT

  // DAKLE NE SAM ODA MOZEMO PROSLEDJIVATI ADDITINAL JSX KOJI 
  // CE IMATI SVAKI PAGE, MI MOZEMO DA PROSLEDJUJEMO I PROPSE

  // PA NE SAMO U Component, KOJEM JE BOLJE DA SE ZOVE
  // PageComponent (BILO BI INTUITIVNIJE)

  // VEC MOZEMO DA U ODNOSU NA TE PROPSE DA MI, TAKODJE
  // CONDITIONALLY RENDER-UJEMO ON OSTO SMO OVDE PODESILI
  // DA TREBA DA IMA SVAKI PAGE 

  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />
    </div>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  console.log("GET INITIAL PROPS");

  return {
    pageProps: {
      placeholder: "plceholder",
    },
  };
};

export default MyApp;

```

MOJI TRENUTNI INDIVIDUAL PAGE-OVI NEMAJU NI JEDAN HOOK POPUT `getServerSideProps`; TAKAV HOOK IMA SAMO JEDAN PAGE, A TO JE INDEX PAGE (**"/"**)

**MENE SADA ZANIMA DA LI KADA POSETIM `/`; DA LI CE SE U GORNJEM OBJEKTU `pageProp` (INSIDE MyApp) NACI I ONI PROPSI KOJI PROSLEDI `getServerSideProps`**

EVO POSETIO SAM `/`

I VIDIM DA SE U BROWSER-OVOJ KONZOLI STAMPAO OVAKAV OBJEKAT

```js
{
  "pageProps": {
    // DAKLE OVO JE ONO STO SAM PROSLEDI FROM  _app.getInitialProps
    "placeholder": "plceholder",
    // A OVO JE ONO STO JE PROSLEDJENO IZ `getServerSideProps`
    "data": {
      "currentUser": {
        "email": "rustplayer6@mail.com",
        "id": "60774baf6a28f4001926f1f6",
        "iat": 1618430941
      }
    }
  }
}
```

## ISTO TAKO PRIMECUJEM DA ONO STO SAM STMPAO U SAMOJ `MyApp` KOMPONENTI, JESTE ISTO STMAPANO I SERVER SIDE

ZATO STO SAM VIDEO TO U TERMINALU

NE ZNAM DA LI JE OVO RELEVANTNO ZA BILO STA, ALI ZAISTA JE TAKO
