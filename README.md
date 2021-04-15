# POMERANJE LOGIKE GETTING-A CURRENT USER-A, FROM HOOK `getServerSideProps` OF INDEX PAGE, TO HOOK `_app.getInitilProps`

**NARAVNO RAIM OVO DA BI SVAKI PAGE MOGAO DA UZME CURRENT USER-A**

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import { AppProps, AppContext } from "next/app";
// UVESCU JOS OVO
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
//

import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />
    </div>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  // JEDINO STO OVDE MORAS VODITI RACUNA DA JE CONTEXT
  // OBJEKAT SA req OBJEKTOM, INSIDE appCtx, A TO JE LAKO PRONACI
  // JER AM ODRADIO DOBRU TYPESCRIPT PODRSKU
  const { ctx } = appCtx;

  // EVO POTPUNO SAM SVE PREKOPIRAO STO SE NLAZILO INSIDE getServerSideProps
  // NA STRANICI client/pages/index.tsx

  try {
    const apiClient = buildApiClient(ctx);

    const response = await apiClient.get("/api/users/current-user");

    console.log("BACKEND");
    console.log(response.data);
    // ----------------------------------------------------------

    return {
      // SAMO STO UMESTO props OVDE PISEM pageProps
      pageProps: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        errors: err.message as any,
      },
    };
  }
};

export default MyApp;

```

**SADA ONAJ getServerSideProps VEZAN ZA INDEX PAGE NIJE NI BITAN, JER JEDINA LOGIKA KOJA JE BILA TAMO SE NALAZI U POTPUNOSTI U GORNJEM HOOK, MEDJUTIM NISAM NAMERNO HTEO DA UKLONIM `getServerSideProps` NA INDEX PAGE-U KAKO BI TI POKAZAO DA ION DALJE MOZE FUNKCIONISATI, DA AKO U BUDUCNOSTI ODANDE PROSLEDIM PROPSE, DA CE ONI BITI PRIDODTI PROPSIMA, KOJE `MyApp` KOMPONENTA SALJE U PAGE**

- `code client/pages/index.tsx`

```tsx
// MRZI ME DA TI PPRIKAZUJEM SVE IZ FILE, SAMO TI PRIKAZUJEM HOOK
// JER JE ON TRENUTNO RELEVANTAN ZA PRICU
// ...

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  
  // UKLONIO SAM SVU GETTING CURRENT USER LOGIKU

  // EVO ODAVDE SAMO RETURN-UJEM NESTO BEZVEZE
  return {
    props: {
      // I TO CES MOCI DA INTERCEPT-UJES KAO pageProps U MyApp
      // KOMPONENTI, STO SAM TI VEC REKAO U PREDHODNOM BRANCH-U
      foo: "bar"
    }
  }

};
```
