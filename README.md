# FIXING SOME PROBLEMS AROUND `getServerSideProps`

OVI PROBLEMI SE TICU TOGA DA NE MOGU PROSLEDITI NISAT IZ `getInitialProps` TO `getServerSideProps` KAKO BI TO MOZDA MOGAO OBRADJIVATI ,ODNOSNO PROCESS-PVATI INSIDE `getServerSideProps`

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
