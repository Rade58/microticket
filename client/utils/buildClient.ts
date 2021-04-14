// UVESCU axios
import axios from "axios";
// I isSSR HELPER-A
import { isSSR } from "./isSSR";

interface HeadersI {
  Host: string;
  Cookie: string;
}

// ZELIM DA NAPRAVIM SIGNATURES ZA OVU FUNKCIJU

export const buildClient = (
  path: string,
  method: "get" | "post",
  // OVO SU ONI HEADERSI (Host, Cookie)
  mainHeaders?: HeadersI,
  body?: any,
  otherHeaders?: Record<string, string>
) => {
  if (method === "post" && !body)
    throw new Error("You didn't provide the body of request");

  const baseUrl = isSSR()
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  const url = baseUrl + (path.startsWith("/") ? "" : "/") + path;

  let headers = {};

  if (otherHeaders) {
    headers = { ...headers, ...otherHeaders };
  }
  if (mainHeaders) {
    headers = { ...headers, ...mainHeaders };
  }

  return async () => {
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
        return axios[method](url, {});
      }

      if (method === "post") {
        return axios[method](url, body);
      }
    }
  };
};
