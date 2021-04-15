import React from "react";
//
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

MyApp.getInitialProps = async (ctx: AppContext) => {
  return {};
};

export default MyApp;
