import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();
  // OVO JE PROBLEM
  // ZBOG GRESKE NA DIGITAL OCEAN-U KOJA IMA VEZE SA
  // INGRESS-OM, MORAO SAM DODATI DODATNU KONFIGURACIJU ZA INGRESS
  // ISTO TAKO NISAM MOGAO DA KORISTIM, OVAJ URL
  /* const baseURL =
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local" */;
  // VEC OVAJ
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
