import { useState, useCallback, FC } from "react";
import axios from "axios";

// UVOZIM, POMENUTI HIGHER ORDER COMPONENT
import BuildErrorMessages from "../components/higher_order/BuildErrorMessages";

const useRequest = (
  url: string,
  method: "post" | "get",
  body?: { email: string; password: string } | any
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

  // PRAVIM NOVU GRANU STATE-A, KOJA TREBA DA HOLD-UJE
  // ONO STO OUTPUT-UJE MOJ HIGHER ORDER COMPOMONENT
  // A TO JE ONA FUNCTIONAL KCOMPONENT,
  // CIJA JE ULOGA DA DISPLAY-UJE ERROR MESSAGES
  const [ErrorMessagesComponent, setErrorMessagesComponent] = useState<FC>(
    null
  );
  //

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
    } catch (err) {
      setErrors(err.response.data.errors);

      // OVDE CU DA NAPRAVIM NOVI ERROR MESSAGE COMPONENT
      setErrorMessagesComponent(BuildErrorMessages(err.response.data.errors));

      setHasErrors(true);
      setData(null);
      setUserData(null);
    }
  }, [
    body,
    url,
    method,
    setUserData,
    setHasErrors,
    setErrors,
    setData,
    setErrorMessagesComponent,
  ]);

  // DODAJEM I BUILT ERROR MESSAGE COMPONENT
  return {
    makeRequest,
    userData,
    errors,
    hasErrors,
    data,
    ErrorMessagesComponent,
  };
};

export default useRequest;
