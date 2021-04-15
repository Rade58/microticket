import axios from "axios";
import { isSSR } from "./isSSR";
// UVOZIM TYPE ZA CONTEXT
import { GetServerSidePropsContext, NextPageContext } from "next";

// DEFINIACU DA OVA FUNKCIJA USTVARI UZIMA REQUEST FROM
// TYPE-OVACU ARGUMENT TAKODJE
export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();

  const baseURL = isServerSide
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  // SADA MOGU OVAKO NESTO DA URADIM
  if (isServerSide && ctx) {
    // OVDE MOZES DA PROSLEDIS I SVE COOKIES FROM THE ctx.req
    return axios.create({
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    // OVDE TI USTVARI MOZES DA RETURN-UJES SAMO axios
    return axios;
  }
};
