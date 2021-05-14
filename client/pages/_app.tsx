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
      <Component something={"anything"} {...pageProps} />
    </div>
  );
}

export default MyApp;
