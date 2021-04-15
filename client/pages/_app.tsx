import React from "react";
import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";

function MyApp({ Component, pageProps }: AppProps) {
  // DODAJEM DIV I ONDA CU PORED STO CU U NJEGA NESTOVATI Component
  // TAKODJE CU DODATI PRE TOGA I NEKI h1

  return (
    <div>
      <h1>Navigation</h1>
      <Component {...pageProps} />;
    </div>
  );
}

export default MyApp;
