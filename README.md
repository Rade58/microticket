# CILJ MI JE DAKLE DA NAPRAVIM WRAPPER FUNKCIJU OKO AXIOS-A (DA KREIRAM 'NOVI' API CLIENT), KOJU CU KORISTITI ZA SLANJE REQUEST-OVA, AL IDA TA FUNKCIJA PRAVI DIFERENCIJACIJU TOGA DA LI JE REQUEST POSLAT SA SERVERA ILI IZ BROWSER

ZASTO TO RADIM

PA IMAM MALO MESSY CODE

KADA GOD BI SE JAVILA POTREBA DA JA SALJEM REQUEST, FROM INSIDE THE POD OF MY CLUSTER PREMA INGRESS NGINX-U (**DAKLE SUPROTNO NEGO STO SE TO RADI INACE**) (PPOTREBA SE KOD MENE JAVILA JER KORISTIM, A MOZDA CU KORISTITI I NA DRUGIM PAGE-OVIMA HOOK `getServerSideProps`)

A KAO STO VIDIS OVDE PISANJE OVOG DUGACKO URL JE KIND ANOYING

- `cat client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface CurrentUserI {
  id: string;
  email: string;
  iat: number;
}

type currentUserType = CurrentUserI | null;

interface PropsI {
  data?: { currentUser: currentUserType };
  errors?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  const { data, errors } = props;

  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    return <div>You are {!currentUser ? "not" : ""} signed in.</div>;
  }

  return null;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  try {
    const response = await axios.get(
      // -------------------
      // MISLIM NA OVAJ URL, POGLEDAJ KOLIKI JE
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      // --------------------
      {
        headers: {
          Host: host,
          Cookie: cookie ? cookie : "",
        },
      }
    );

    return {
      props: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        errors: err.message as any,
      },
    };
  }
};

export default IndexPage;

```

**BOLJE BI BILO DA SE TAJ URL MOZE NAPISATI, SAMO JEDNOM U HELPER METODI ZA SLANJE NETWORK REUEST-OVA, KOJA BI SE ONDA MOGLA REUSE-OVATI**

## PRVO CU DODATI HELPER, KOJI ODREDJUJE DA LI JE U PITANJU SERVER ILI BROWSER; ODNOSNO FUNKCIJU KOJA IZBACUJE BOOLEAN true AKO JE U PITANJU SERVER SIDE 

- `mkdir client/utils`

- `touch client/utils/isSSR.ts`

```ts
export const isSSR = () => typeof window === "undefined";
```

HELPER SAM DEFINISAO JER SE MOZE KORISTITI I NA DRUGIM MESTIMA, AKO ZA TO BUDE BILO POTREBE (U SAMIM KOMPONENTAMA, KAKO NE BI DOBIO ERROR KAKO window NE POSTOJI NA SERVER SIDE-U)

## GORNJU HELPER CE DA KORISTI 'NOVI' API CLIENT, KOJEG CU SADA KREIRATI; USTVARI BOLJE JE DA KREIRAM, FUNKCIJU KOJA CE DA OUTPUT-UJE PRECONFIGURED API CLIENT, ODNOSNO PRECONFIGURED AXIOS

- `touch client/utils/buildApiClient.ts`

SAMO NAPOMINJEM DA JE OVO MOJE RESENJE DRUGACIJE OD ONOG RESENJA AUTORA WORKSHOP-A

```ts

```

DAKLE OVA MOJA FUNKCIJA BAS I NE IZGLEDA NAJBOLJE AL ICE POSLUZITI

ISTO TAKO MOZDA SAM JOJ DAO PREVELIKU KOMPLEKSNOST, ALI NEMA VEZE

ONA JE KOD AUTORA WORKSHOPA DRUGACIJA JER ON KORISTI OUTDATED NODJS I POKUSAVA DA RESI PROBLEM KOJI JE U NOVIJIM VERZIJAMA NEXTJS VEC RESEN (ON KORISTI `getInitialProps`)

MOGU DA PROBAM DA REFAKTORISEM INDEX PAGE KAKO BI ISPROBAO, POMENUTU FUNKCIJU



