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

MOZEMO DA OBAVIMO ISTI ONAJ PROCES OD COMMITINGA I PUSHING-A TO dev BRANCH; PA DO ODLASKA NA GITHUB I PRAVLJENJA PULL REQUESTA, ZA MERGING dev INTO main BRANCH; PA DO ACTUALL MERGING-A POMENUTOG PULL REQUESTA INTO `main` BRANCH

SVE SAM TO OBAVIO I KASNIJE SAM MANELNO TESTIRAO NASU APLIKACIJU, I SVE JE FUNKCIONISALO

# NAIME ALI SADA CE MO DA TESTIRAMO DA LI NAS DEVELOPMENT CLUSTER FUNKCIONISE

**JAKO JAKO BITNA STVAR:**

***

**PRE POKRETANJA SKAFFOLD-A, NEMOJ DA ZABORAVIS DA PROMENIS CONTEXT ZA `kubectl`**

**OVO JE IZUZETNO VAZNO, JER DA SAM POKRENUO `skaffold` ON BI POCEO DA APPLY-UJE CHANGES NA NAS PRODUCTIN CLUSTER NA DIGITAL OCEAN-U, I USAO BI U PROBLEME, PRAKTICNO ZABOG INVALIDNIH STVARI, SVE PODS BI BIL IDESTROYED, ODNONO I SVI DEPLOYMENTI**

***

ZATO CEMO SADA DA PROMENIMO CONTEXT ZA `kubectl`, KAKO BI ON RUNN-OVAO COMMANDS AGAINS OUR DEVELOPMENT CLUSTER NA GOOGLE CLOUD-U

- `kubectl config get-contexts`

I SADA CEMO DA SWITCH-UJEMO NA CONTEXT ZA NAS DEVELOPMENT CLUSTER

- `kubectl config use-context <ime tvog contexta za google cloud cluster>`

**SADA CEMO DA POKRENEMO SKAFFOLD**

- `skaffold dev`

KADA JE SKKAFFOLD APPLY-OVAO SVE PROMENE NA CLUSTER, MOZEMO DA ODEMO NA ONAJ NAS HOST, KOJI JE NAMENJEN DEVELOPMENTU: <https://microticket.com>

MORACEMO TA KUCAMO OPET ONO `'thisisunsafe'` DA BISMO VIDELI PAGE

SADA SAM MALO MANUELNO TESTIRAO PAGE, NAPRAVIO NOVOG USERA, PA AM NAPRAVIO NOVI TICKET, PA ORDER, PA SAM INICIRAO CHECKOUT SA STRIPE-OM

DAKLE SVE IZGLEDA OK

# OPET TE PODSECAM DA JE CONTEXT JAKO BITNA STVAR

DAKLE PROVERI DA LI SUI U PRAVOM CONTEXT-U PRE POKRETANJA `skaffold dev`

***
***
***
***
***
***

# OSTAVLJM TI PODSETNIK

cookie-session SSL


INGRESS:

IMETIO JOS JEDAN WARNING U JEDNOM LINE-U LOG-A:

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***

digresija-podsetnik:

POZABAVICES SE OVIM, KADA RESIMO DRUGE PROBLEM

`Warning: networking.k8s.io/v1beta1 Ingress is deprecated in v1.19+, unavailable in v1.22+; use networking.k8s.io/v1 Ingress`

***
***
