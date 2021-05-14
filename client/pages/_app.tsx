import React from "react";
import { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  const { currentUser } = pageProps.data;

  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;

  try {
    const apiClient = buildApiClient(ctx);

    const response = await apiClient.get("/api/users/current-user");

    console.log({ FROM_GET_INITIAL_PROPS_FUNCTION: response.data });

    return {
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
