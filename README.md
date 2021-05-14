# FIXING SOME PROBLEMS AROUND `getServerSideProps`

OVI PROBLEMI SE TICU TOGA DA NE MOGU PROSLEDITI NISAT IZ `getInitialProps` TO `getServerSideProps` KAKO BI TO MOZDA MOGAO OBRADJIVATI ,ODNOSNO PROCESS-PVATI INSIDE `getServerSideProps`

**USTVARI OVO CE BITI REFACTORING MORE THEN FIXING PROBLEMS**

# PRVO DA TE PODSETIM JOS JEDNOM DA USERA FETCH-UJEMO U `getInitialProps`

- `code client/pages/_app.tsx`

```ts
import React from "react";
import App, { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;

  try {
    // EVO BUILD-UJEMO API CLIENT-A
    const apiClient = buildApiClient(ctx);

    // FETCH-UJEMO USER-A
    const response = await apiClient.get("/api/users/current-user");

    // OVO ZELIM DA TI POKAZEM, ALI NEMA MNOGO SENSA
    // JEDINO DA TI KAZEM DA OVO RETURN-UJE OBJEKAT
    // KOJI JE U OVOM FORMATU
    //                          { pageProps:  }
    const appProps = await App.getInitialProps(appCtx);

    // I TO JE OBJEKAT KOJI U TVOM FORMATU RETURN-UJES DA BI
    // PASS-OOVAO PROPS

    // JA SAM RANIJE HARDCODE-OVAO TAJ OBJEKAT, MEDJUTIM NECU
    // VISE, KACICU NA GORNJI OBJEKAT, PA CU NJEGA PASS-OVATI

    appProps.pageProps.data = response.data as { currentUser: currentUserType };

    // UMESTO OVOGA OVAKVOG
    /* return {
      pageProps: {
        data: response.data as { currentUser: currentUserType },
      },
    }; */

    // RETURN-OVACU OVO
    return appProps; // TU UNUTRA U TOM OBJECKTU JE
    //

    // --------------------------------------
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        errors: err.message as any,
      },
    };
  }
};

// APP PAGE
function MyApp({ Component, pageProps }: AppProps) {
  const { currentUser } = pageProps.data;

  return (
    <div>
      <Header currentUser={currentUser} />
      <Component something={"anything"} {...pageProps} />
    </div>
  );
}

export default MyApp;
```

DOBRO OVO IZNAD SAM MALO REFAKTORISAO

POSTO JE AUTOR WORKSHOPA REKAO DA CE SE INSIDE `getServerSideProps` MOZDA FETCH-OVATI USER, A JA PRVENSTVENO FETCH-UJEM USERA INSIDE `_app.tsx`-OVOG `getInitialProps`-A, ZELIM DA NAPRAVIM NEKAKAV HELPER ZA GETTING USER-A

# SADA ZELIM DA NAPRAVIM HELPERA KOJI CE SLUZITI SAMO DA SE FETCH-UJE USER

NE ZNAM DA LI CE MI OVO TREBATI; AUTOR WORKSHOPA JE UKAZAO DA HOCE

- `touch client/utils/getCurrentUser.ts`

```ts
import { GetServerSidePropsContext, NextPageContext } from "next";
import { buildApiClient } from "./buildApiClient";

export const getCurrentUser = async (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const client = buildApiClient(ctx);

  try {
    const response = await client.get("/api/users/current-user");

    return { currentUser: response.data.currentUser };
  } catch (err) {
    console.error(err);

    return { currentUser: null };
  }
};
```

# ZELIM DA PROBAM DA KORISTIM OVU METODU U `getInitialProps`

DA VIDIM DA LI CE FUNKCIONISATI

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import App, { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";
// UVESCU POMENUTI HELPER ZA FETCHING ZA CURRENT USER-OM
import { getCurrentUser } from "../utils/getCurrentUser";
//

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;

  try {
    // OVO NECE TREBATI
    // const apiClient = buildApiClient(ctx);

    // DODAO OVO
    const { currentUser } = await getCurrentUser(ctx);

    const appProps = await App.getInitialProps(appCtx);

    // OVO SAM MALO SREDIO OVAKO
    appProps.pageProps.data = { currentUser } as {
      currentUser: currentUserType;
    };

    return appProps;

    //
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        errors: err.message as any,
      },
    };
  }
};

// APP PAGE
function MyApp({ Component, pageProps }: AppProps) {
  const { currentUser } = pageProps.data;

  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

```

- `skaffold dev`

IDI NA INDEX PAGE I RELOAD-UJE

MISLIM DA BI SVE TREBALO DA BUDE U REDU

#### AKO TI BUDE BILO POTREBNO DA GETT-UJES USER BILO GDE, I CLIENT SIDE I INSIDE `getServerSideProps`  MOZES DA KORISTIS `client/utils/getCurrentUser.ts` HELPER

A SADA CU URADITI JOS JEDNU STVAR

NAIME, JA ZA SADA SAMO PROSLEDJUJEM CURRENT USERA U HEADER KOMPONENTU, KOJ URENDER-UJEM NA SVAKOM PAGE-U

**TAKODJE TI JE CURRENT USER DOSTUPAN U SVAKOM PAGE-U KAO PROP, ALI KAO `props.data.currentUser`**

# AUTOR WORKSHOPA JE ZELEO DA CURRENT USER BUDE DOSTUPAN KAO PROP `currentUser` I ZATO GA JE PROSLEDIO U APP PAGE-U

POGLEDAJ KAKO

- `code `

```tsx
import React from "react";
import App, { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/getCurrentUser";

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;

  try {
    const { currentUser } = await getCurrentUser(ctx);

    const appProps = await App.getInitialProps(appCtx);

    appProps.pageProps.data = { currentUser } as {
      currentUser: currentUserType;
    };

    return appProps;

    //
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        errors: err.message as any,
      },
    };
  }
};

// APP PAGE
function MyApp({ Component: PageComponent, pageProps }: AppProps) {
  // EVO VIDIS

  const { currentUser } = pageProps.data;

  // PORED TOGA STO SAM GA PROSLEDIO KAO PROP ZA HEADER
  // ZELI MDA GA PROSLEDIM ZA SVAKI PAGE

  return (
    <div>
      <Header currentUser={currentUser} />
      {/* EVO SAMO SAM DODAO OVAJ currentUser PROP */}
      <PageComponent currentUser={currentUser} {...pageProps} />
    </div>
  );
}

export default MyApp;

```
