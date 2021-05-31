import React from "react";
import App, { AppProps, AppContext } from "next/app";
// import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";
// import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/getCurrentUser";

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;
  console.log({ ctx: ctx });

  console.log(ctx.pathname);

  try {
    const { currentUser } = await getCurrentUser(ctx);

    console.log("--------(_app)---------");
    // console.log({ currentUser });
    //
    const appProps = await App.getInitialProps(appCtx);
    appProps.pageProps.initialProps = {
      currentUser,
      pathname: ctx.pathname,
    } as {
      currentUser: InitialPropsI["initialProps"]["currentUser"];
      pathname: string;
    };

    return appProps;
  } catch (err) {
    console.error(err);
    return {
      pageProps: {
        initialProps: {
          errors: err.message as any,
          pathname: ctx.pathname,
        },
      },
    };
  }
};

//
function MyApp({ Component: PageComponent, pageProps }: AppProps) {
  // EVO VIDIS
  const { currentUser, pathname } = pageProps.initialProps;

  const isPremiumPage =
    typeof pathname === "string"
      ? (pathname as string).includes("/premium")
      : false;

  // console.log({ pageProps });

  return (
    <div>
      {!isPremiumPage && <Header currentUser={currentUser} />}
      {/* EVO WRAPP-OVAO SAM SVE U OVAJ container div */}
      <div className="container">
        <PageComponent currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
