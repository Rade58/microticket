import { useState, useCallback } from "react";
import axios from "axios";
// UVESCU POMENUTI HOOK
import { useRouter } from "next/router";
//

import ErrorMessages from "../components/ErrorMessages";

const useRequest = (
  url: string,
  method: "post" | "get",
  body?: { email: string; password: string } | any,
  // DODACU OVDE KAO PARMAETAR REDIRECTING URL
  redirectUrl?: string,
  // DEFINISACU I DA SE MOZE ZADATI DODATINI CALLBACK, KOJ IBI SE IZVRSIO
  // onSuccess
  onSuccess?: () => any
) => {
  const [userData, setUserData] = useState<{
    email: string;
    id: string;
  } | null>(null);

  const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  );
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  // EVO OVDE PRAVIM TU FUNKCIJU ZA REDIRECTING
  const { push } = useRouter();
  // MOGU SADA OVU METODU PUSH, KORISTITI UNUTAR CALLBACK-A
  // KOJEG CU ISTO RETURNOVATI IZ CUSTOM HOOK-A

  const afterSuccess = useCallback(async () => {
    if (onSuccess) {
      onSuccess();
    }

    if (redirectUrl) {
      await push(redirectUrl);
    }
  }, []);

  const makeRequest = useCallback(async () => {
    try {
      const response = await axios[method](
        url,
        method === "post" ? body : undefined
      );

      if ((response.data as { email: string; id: string }).email) {
        setUserData(response.data);
      }
      setData(response.data);
      setHasErrors(false);
      setErrors([]);

      // MOGAO BI OVDE DA IZVRSIM REDIRRECT
      afterSuccess();
      //

      return { hasErrors: false };
    } catch (err) {
      setErrors(err.response.data.errors);

      setHasErrors(true);
      setData(null);
      setUserData(null);

      return { hasErrors: true };
    }
  }, [body, url, method, setUserData, setHasErrors, setErrors, setData]);

  return {
    makeRequest,
    userData,
    errors,
    hasErrors,
    data,
    // EVO RETURN-UJEM I OVU KOMPONENTU
    ErrorMessages,
  };
};

export default useRequest;
