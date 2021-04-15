import React from "react";
// EVO UZEO SAM I TYPE SA KOJI MCU TYPE-OVATI
// context ZA getInitialProps
import App, { AppProps, AppContext } from "next/app";
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
  console.log("GET INITIAL PROPS");

  const appProps = await App.getInitialProps(appCtx);

  console.log({ appProps });

  // PROSLEDJUJEM BILO KAKAV PROPS
  return { ...appProps, placeholder: "placeholder" };
};

export default MyApp;
