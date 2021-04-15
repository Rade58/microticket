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

NARAVNO, POKRENI SKAFFOLD AKO TI NIJE POKRENUT, JER KAD TI SKAFFOLD NIJE UPALJEN NE MOZES SYNC-OVATI PROMENE (ODNOSNO CHANGES NE MOGU BITI INJECT-OVANE U POD-OVE NA CLUSTERU)

**MOZES DA SADA ODES NA SVAKI OD TVOJIH PAGE-OVA; VIDECES DA CE TI NA SVAKOM OD PAGE-OVA BITI PRIKAZAN ONAJ h1 KOJI SI PODESIO, I U KOJEM PISE TEKST: *"Navigation"***

# MI U TOM HEADERU TREBA DAKLE DA POKAZEMO NAVIGATION, ALI CE STVARI UNUTAR NJEGA BITI CONDITIONALLY RENDERED U ZAVISNOSTI OD ONOGA STA SE DOBIJA HITTING-OM `/api/users/current-user`

TO JE MALO PROBLEMATICNO JER JA SAMO ZA SADA ZA INDEX PAGE UNUTAR RELATED getServerSideProps, HIT-UJEM POMENUTI

**A MI SADA GOVORIMO O TOME DA ZELIMO DA I NAS PASSED IN HEADER NA SVAKOM PAGE, TREB DA ZNA ZA currentUser**

**TAKO DA JE BOLJE DA SAM DATA (currentUser-A) FETCH-OVAO U SAMOJ _app KOMPONENTI**

TO JE MOGUCE URADITI, JER POPUT `getServerSideProps` POSTOJI I NEXTJS HOOK, KOJI MOZEMO DEFINISATI NA NIVOU _app PAGE, ODNOSNO HOOK, KOJI SE TREBA IZVRSITI SERVER SIDE, KADA POSECUJEMO SVAKI PAGE

**U PITANJU JE HOOK `getInitialProps` KOJEG MOZEMO KORISTITI NA NA _app LEVELU**

## `getInitialProps` KOJI DEFINISEM NA NIVOU `_app`-A, CU DEFINISATI U SLEDECEM BRANCH-U

ZATO STO ZELIM DA KAZEM DOSTA VAZNIH STVARI
