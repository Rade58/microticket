# USING BASE URL DEPENDING ON DEVELOPMENT OR PRODUCTION MODE

GOVORIM TI O BASE URL-U KOJEG KORISTIM OVDE, DA BI SLAO REQUESTS FROM `getServerSideProps`, KA DRUGIM MICROSERVICE-OVIMA

- `cat client/utils/buildApiClient.ts`

```ts
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
```

ALI ZBOG OVOGA JA NE MOGU DA SALJEM REQUESTS IZ `getServerSideProps` KA DRUGIM MICROSERVICE-OVIMA

ZATO CU SADA DEFINISATI DA SE U ODNOSU NA `process.env.NODE_ENV`, KORISTI, JEDAN ILI DRUGI BASE URL

- `cat client/utils/buildApiClient.ts`

```ts
import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();

  // EVO DEFINISAO SAM TERNARRY
  const baseURL = process.env.NODE_ENV === "production"?
  "http://www.microticket.xyz/"
  :
  "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
  //


  if (isServerSide && ctx) {
    return axios.create({
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    return axios;
  }
};

```

***
***
***
***
***
***

# OSTAVLJM TI PODSETNIK

PUBLISHABLE STRIPE KEY SE U client MICROSERVICEU KORISTI KAO ENV VARIANLE (PODESI TO)

baseUrl:
`client/utils/buildApiClient.ts`

TAKODJE SAM PR
IMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***
***
