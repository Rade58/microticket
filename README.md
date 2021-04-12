# REDIRECTION TO INDEX PAGE AFTER SUCCESSFUL SIGNUP

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState } from "react";
// ROUTER (KORISTICU useRouter HOOK)
import { useRouter } from "next/router";

import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    // userData,
    // data,
    // hasErrors,
    ErrorMessages,
    errors,
    makeRequest,
  } = useRequest("/api/users/signup", "post", { email, password });

  // EVO OVDE UZIMAM push, SA KOJIM MOZES DAA VRSIS NAVIGATING
  // NA FRONTEND-U
  const { push: routerPush } = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const ob = await makeRequest();

        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");

          // OVDE BI MOGAO DA OBAVIM REDIRECTING
          routerPush("/");
        }
      }}
    >
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="email-signup">Email Address: </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          id="email-signup"
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password-signup">Password: </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password-signup"
          type="password"
          className="form-control"
        />
      </div>
      <ErrorMessages errors={errors} />
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;

```

**TESTIRAO SAM OVO I REDIRECT JE BIO USPESN**

# ALI IDEJA JE DA SE IPAK OVA LOGIKA REDIRECTING-A IPAK IMPLEMENTIRA INSIDE MOG `useRequest` CUSTOM HOOK-A

TAKO DA CU TO SADA PROBATI

- `code client/hooks/useRequest.ts`

```tsx
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
```

## SADA DA REFAKTORISEM `client/pages/auth/signup.tsx`

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState } from "react";
// OVO VISE NE TREBA OVDE
// import { useRouter } from "next/router";

import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    // userData,
    // data,
    // hasErrors,
    ErrorMessages,
    errors,
    makeRequest,
    // DODAJEM OVE DODATNE ARGUMENTE (USTVARI SAMO JEDAN)
  } = useRequest("/api/users/signup", "post", { email, password }, "/");

  // OVO VISEE NIJE POTREBNO
  // const { push: routerPush } = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const ob = await makeRequest();

        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");

          // OVO VISE NIJE POTREBNO
          // routerPush("/");
        }
        // ALI I OVAJ CELA GORNJ USLOVNA IZJAVA IZGLED DA JE BESPOTREBNA ALI CU JE OSTAVITI TU
      }}
    >
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="email-signup">Email Address: </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          id="email-signup"
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password-signup">Password: </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password-signup"
          type="password"
          className="form-control"
        />
      </div>
      <ErrorMessages errors={errors} />
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;
```

TESTIRAO SAM, I FUNKCIONISALO JE
