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


