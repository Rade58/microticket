import { useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ErrorMessagesComponent from "../components/ErrorMessages";

interface OptionsI {
  method: "post" | "put" | "patch" | "get";
  redirectSuccessUrl?: string;
  onSuccess?: () => any;
  redirectFailireUrl?: string;
  onFailiure?: () => any;
}

/**
 *
 * @param options OptionsI
 * @param body T
 */

/**
 *
 * @param url string
 * @param options OptionsI
 * @param body T
 * @description T (first generic) DESCRIBES DATA OF body ARGUMENT
 * @description P (second generic) DESCRIBES data OF response
 */
const useRequestHook = <T, P>(url: string, options: OptionsI) => {
  //

  const {
    onSuccess,
    redirectSuccessUrl,
    onFailiure,
    redirectFailireUrl,
    method,
  } = options;

  const { push } = useRouter();

  const [data, setData] = useState<P>(null);

  const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  );

  const [hasErrors, setHasError] = useState<boolean>(false);

  // ------------------------------------------------------------------
  const afterSuccess = useCallback(() => {
    if (hasErrors) {
      return;
    }

    if (onSuccess) {
      onSuccess();
      return;
    }
    return;
  }, [hasErrors, onSuccess]);

  const redicectAfterSuccess = useCallback(async () => {
    if (hasErrors) {
      return;
    }

    if (redirectSuccessUrl) {
      await push(redirectSuccessUrl);
      return;
    }

    return;
  }, [redirectSuccessUrl, hasErrors, push]);

  const afterFailiure = useCallback(() => {
    if (!hasErrors) {
      return;
    }

    if (onFailiure) {
      onFailiure;
      return;
    }

    return;
  }, [hasErrors, onFailiure]);

  const redirectAfterFailiure = useCallback(async () => {
    if (!hasErrors) {
      return;
    }

    if (redirectFailireUrl) {
      await push(redirectFailireUrl);
    }
  }, [hasErrors, redirectFailireUrl, push]);
  // ----------------------------------------------------------

  const makeRequest = useCallback(
    async (body?: T) => {
      if (body && method !== "get") {
        try {
          const response = await axios[method](url, body);

          setData(response.data as P);
          setErrors([]);
          setHasError(false);

          afterSuccess();
          await redicectAfterSuccess();

          return response.data;
        } catch (err) {
          console.log(err);

          setErrors(err.response.data.errors);
          setHasError(true);
          setData(null);

          afterFailiure();
          await redirectAfterFailiure();
          return err;
        }
      }

      if (method === "get") {
        try {
          const response = await axios[method](url);

          setData(response.data as P);
          setErrors([]);
          setHasError(false);

          afterSuccess();
          await redicectAfterSuccess();
          return response.data;
        } catch (err) {
          setErrors(err.response.data.errors);
          setHasError(true);
          setData(null);

          afterFailiure();
          await redirectAfterFailiure();
          return err;
        }
      }
    },
    [
      setData,
      setErrors,
      setHasError,
      method,
      afterFailiure,
      afterSuccess,
      redicectAfterSuccess,
      redirectAfterFailiure,
      url,
    ]
  );

  return {
    makeRequest,
    data,
    errors,
    hasErrors,
    ErrorMessagesComponent,
  };
};

export default useRequestHook;
