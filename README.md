# `axios.create`

DAKLE JA SAM U PROSLOM BRNCH-U RADIO **REINVENTING THE WHEEL** PRETTY MUCH, KADA SAM KREIRAO OVAKVU FUNKCIJU

- `cat client/utils/buildApiClient.ts`

```ts
import axios from "axios";
import { isSSR } from "./isSSR";

interface HeadersI {
  Host: string;
  Cookie: string;
}

export const buildApiClient = () => {
  const baseUrl = isSSR()
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  return async (
    path: string,
    method: "get" | "post",
    mainHeaders?: HeadersI,
    body?: any,
    otherHeaders?: Record<string, string>
  ) => {
    if (method === "post" && !body)
      throw new Error("You didn't provide the body of request");

    const url = baseUrl + (path.startsWith("/") ? "" : "/") + path;

    let headers = {};

    if (otherHeaders) {
      headers = { ...headers, ...otherHeaders };
    }
    if (mainHeaders) {
      headers = { ...headers, ...mainHeaders };
    }

    if (isSSR()) {
      if (method === "get") {
        return axios[method](url, {
          headers,
        });
      }

      if (method === "post") {
        return axios[method](url, body, {
          headers,
        });
      }
    } else {
      if (method === "get") {
        return axios[method](url, { headers });
      }

      if (method === "post") {
        return axios[method](url, body, { headers });
      }
    }
  };
};

```

# NAIME GORNJU FUNKCIJU MOZE DA ZAMENI UPOTREBA `axios.create`-A, KOJI SLUZI DA JA NESTO PREDEFINISEM ZA axios API CLIENT

VIDECES, OVA FUNKCIJA RETURN-UJE POTPUNO NOVI `axios` CLIENT

ALI TAJ NOVI CLIENT MOZE IMATI NEKE PREDEFINED STVARI

JEDNA OD TIH PREDEFINED STVARI MOZE BITI `baseURL`

- `code client/utils/buildApiClient.ts`

```tsx
import axios from "axios";
import { isSSR } from "./isSSR";

export const buildApiClient = () => {
  const baseURL = isSSR()
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  // MOGAO SAM SAMO OVO URADITI
  return axios.create({
    baseURL,
  });

  // OVO DOLE JA NISTA NISAM NI MORAO RADITI, I ZATO TO UKLANJAM

  /* return async (
    path: string,
    method: "get" | "post",
    mainHeaders?: HeadersI,
    body?: any,
    otherHeaders?: Record<string, string>
  ) => {
    if (method === "post" && !body)
      throw new Error("You didn't provide the body of request");

    const url = baseUrl + (path.startsWith("/") ? "" : "/") + path;

    let headers = {};

    if (otherHeaders) {
      headers = { ...headers, ...otherHeaders };
    }
    if (mainHeaders) {
      headers = { ...headers, ...mainHeaders };
    }

    if (isSSR()) {
      if (method === "get") {
        return axios[method](url, {
          headers,
        });
      }

      if (method === "post") {
        return axios[method](url, body, {
          headers,
        });
      }
    } else {
      if (method === "get") {
        return axios[method](url, { headers });
      }

      if (method === "post") {
        return axios[method](url, body, { headers });
      }
    }
  }; */
};

```

## MOZES SADA A REFAKTORISES SVE U PAGE KOMPONENTI, TAKODJE I INSIDE `getServerSideProps`, KAKO BI ISKORISTIO PRAVILNO, GORNJU FUNKCIJU

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// import axios from "axios";
import { buildApiClient } from "../utils/buildApiClient";

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
  useEffect(() => {
    // EVO OVDE SE PRAVI DAKLE NOVI axios ALI SA PREDEFINITIONSIMA
    // KOJE SAM DEFINISAO
    const apiClient = buildApiClient();

    // REQUEST SE ISTO SALJE KAO I KOD axios
    apiClient.get("/api/users/current-user").then((response) => {
      // NAMERNO STMPAM DATA KAKO BI VIDO DA LI CE SE
      // POKLAPATI SA ONIM PODACIMA KOJE CU ISTO STMAPATI NA SERVERU
      console.log("FRONTEND");
      console.log(response.data);
    });
  }, []);
  // --------------------------------------------------

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
    // I OVDE TO RADIM ISTO, PRAVIM NOVOG API CLIENT-A
    const apiClient = buildApiClient();

    // EVO PRAVIM REQUEST
    // I OPET TI NAPOMINJEM DA OVDE NE MORAS DEFINISATI BASE URL
    // JER TO SI VEC URADIO U FUNKCIJI KOJU SI KREIRAO KOJA IZBACUJE
    // PREDEFINED axios CLIENT
    const response = await apiClient.get("/api/users/current-user", {
      headers: {
        // NARAVNO I DALJE TI MOZES U SKLADU SA axios-OVIM API-OM
        // DA PROSLEDJUJES ONO STO ZELIS
        Host: host,
        Cookie: cookie,
      },
    });

    // I OVO NAMERNO STMAPAM DA VIDIM DA LI CE SE DATA STVARNO UZETI
    console.log("BACKEND");
    console.log(response.data);

    // ----------------------------------

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

## TESTIRAO SAM SVE

MOZES DA SE OPET DA NAPRAVIS USERA NA PAGE /auth/signup

TO CE TE PROGRAMTICALLY NAVIGATE-OVATI DO MAIN PAGE

AKO POGLEDAS TERMINAL (SKAFFOLD TERMINAL) VIDECES DA SE OVO STMAPALO

```zsh
[client] BACKEND
[client] {
[client]   currentUser: {
[client]     email: 'stavros66@mail.com',
[client]     id: '6076be41e2f90400194af2d6',
[client]     iat: 1618394689
[client]   }
[client] }
```

AKO POGLEDAS KONZOLU U BROWSER-U VIDECES DA SE OVO STMAPALO

```js
"FRONTEND"
{
  currentUser: {
    email: 'stavros66@mail.com',
    id: '6076be41e2f90400194af2d6',
    iat: 1618394689
  }
}
```
**STO ZNACI DA SI USPESNO KORISTIO, TVOJ CUSTOM API CLIENT, I NA FRONTENTU ALI I INSIDE `getServerSideProps`**

DAKLE U BUDUCNOSTI MOZES KORISTITI TOG API CLIENT, KADA BUDES ZELEO DA PRAVIS REQUESTS INSIDE HOOKS (getServerSideProps I OSTALI) OF NEXTJS; NECES VSE MORATI, PORED OSTLOG DA STALNO PREKUCAVAS ONAJ DUGACKI BASE URL, JER JE ON PREDEFINED U ZAVISNOSTI DA LI JE REC O FRONTENDU ILI `getServerSideProps`

**A STO JE NAJVAZNIJE, I SA TIM, TI I DALJE KORISTIS axios ZA SLANJE REQUEST-OVA, STO ZNAACI DA JE SINTAKSA U SKLADU SA AXIOS-OVOM, A JOS IMAM I TYPESCRIPT PODRSKU STO JE ODLICNO**


