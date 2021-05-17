import React from "react";
import App, { AppProps, AppContext } from "next/app";
// import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/getCurrentUser";

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;
  try {
    const { currentUser } = await getCurrentUser(ctx);
    const appProps = await App.getInitialProps(appCtx);
    appProps.pageProps.initialProps = { currentUser } as {
      currentUser: InitialPropsI["initialProps"]["currentUser"];
    };
    return appProps;
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        initialProps: {
          errors: err.message as any,
        },
      },
    };
  }
};

//
function MyApp({ Component: PageComponent, pageProps }: AppProps) {
  // EVO VIDIS
  const { currentUser } = pageProps.initialProps;

  return (
    <div>
      <Header currentUser={currentUser} />
      {/* EVO WRAPP-OVAO SAM SVE U OVAJ container div */}
      <div className="container">
        <PageComponent currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
