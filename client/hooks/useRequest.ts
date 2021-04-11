import { useState, useCallback } from "react";
import axios from "axios";

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
      setHasErrors(true);
      setData(null);
      setUserData(null);
    }
  }, [body, url, method, setUserData, setHasErrors, setErrors, setData]);

  return { makeRequest, userData, errors, hasErrors, data };
};

export default useRequest;
