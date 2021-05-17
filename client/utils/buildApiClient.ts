import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();
  const baseURL =
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local";

  if (isServerSide && ctx) {
    return axios.create({
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    return axios;
  }
};
