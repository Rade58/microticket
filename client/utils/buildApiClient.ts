import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();
<<<<<<< HEAD
  // const baseURL =
    // "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";
=======
  /* const baseURL =
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local" */;
>>>>>>> 9_3_1_4_SOME_TEMP_FIXES_AND_SOME_OTHER_FIXES
  const baseURL =
    "http://www.microticket.xyz/";

  if (isServerSide && ctx) {
    return axios.create({
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    return axios;
  }
};
