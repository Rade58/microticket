import axios from "axios";
import { isSSR } from "./isSSR";

export const buildApiClient = () => {
  const baseURL = isSSR()
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";

  return axios.create({
    baseURL,
  });
};
