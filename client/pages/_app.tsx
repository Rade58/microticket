import React from "react";
import { AppProps, AppContext } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  // ONO STO JE BITNO JESTE DA AKO OVDE ZADAS NEKI CODE
  // TO CE BITI FRONTEND CODE KOJI CE BITI IZVRSEN ZA SVAKI PAGE
  // TAKO DA I AKO ZADAS console.log
  // ON CE SE IZVRSITI U BROWSER-VOJ KONZOLI
  // PAGE-, KOJI SE POSECUJE
  console.log({ pageProps });

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
