import axios from "axios";
import { isSSR } from "./isSSR";

interface HeadersI {
  Host: string;
  Cookie: string;
}

export const buildApiClient = () => {
  const baseURL = isSSR()
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  // MOGAO SAM SAMO OVO URADITI
  return axios.create({
    baseURL,
  });

  // OVO DOLE JA NISTA NISAM MORAO RADITI

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
