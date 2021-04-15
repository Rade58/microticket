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
