import { useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ErrorMessages from "../components/ErrorMessages";

// TYPE-OVACEMO PRVO OBJECT ARGUMENT, KOJI CE SE DODAVATI OVOM HOOK-U
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
const useRequestHook = <T, P>(url: string, options: OptionsI, body?: T) => {
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

  const [errors, setErrors] = useState<{
    errors: { message: string; field?: string }[];
  }>({ errors: [] });

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

  const makeRequest = useCallback(async () => {
    if (body && method !== "get") {
      try {
        const response = await axios[method](url, body);

        setData(response.data as P);
        setErrors({ errors: [] });
        setHasError(false);

        afterSuccess();
        await redicectAfterSuccess();
      } catch (err) {
        console.error(err);

        setErrors(err);
        setHasError(true);
        setData(null);

        afterFailiure();
        await redirectAfterFailiure();
      }
    }

    if (method === "get") {
      try {
        const response = await axios[method](url);

        setData(response.data as P);
        setErrors({ errors: [] });
        setHasError(false);

        afterSuccess();
        await redicectAfterSuccess();
      } catch (err) {
        console.error(err);

        setErrors(err);
        setHasError(true);
        setData(null);

        afterFailiure();
        await redirectAfterFailiure();
      }
    }
  }, [setData, setErrors, setHasError, body]);

  return {
    makeRequest,
    data,
    errors,
    hasErrors,
  };
};

export default useRequestHook;
