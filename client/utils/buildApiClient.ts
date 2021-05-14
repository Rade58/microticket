import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

// OVA FUNKCIJA USTVARI UZIMA context U KOJEM SU REQUEST I RESPONSE PORED OSTALOG
export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();

  // EVO VIDIS OVO JE BASE URL KOJI SE KORISTI KADA
  // SE MAKE-UJE REQUEST FROM ONE POD TO ANOTHER INSIDE CLUSTER
  const baseURL = isServerSide
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";
  // KAO STO SI VIDEO U PITANJU JE INGRESS NGINX STVAR

  if (isServerSide && ctx) {
    // OVDE SU PROSLEDJENI I SVI COOKIES FROM THE ctx.req
    return axios.create({
      // NARAVNO NOVI BASE URL SE KORISTI
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    // OVDE SE USTVARI RETURN-UJES SAMO axios
    // JER NIJE REC O SERVER SIDE-U CODE-U
    return axios;
  }
};
