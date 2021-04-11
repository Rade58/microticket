# BUILDING `useRequest` CUSTOM HOOK

IMAM LOKIGIKU, KOJA SE VRTI OKO NETWORK REQUEST-A, A TOTALN OVIDIM DA BI ONA TREBALA BITI IZGRADJENA DA BUDE REUSABLE, I ZATO PRAVIM CUSTOM HOOK KOJI CE SE ZVATI `useRequest`

ON CE UZIMATI URL (ODNOSNO ROUTE), ZATIM METHOD I DATA KOJI SE SEND-UJE (ODNOSNO BODY)

I TAJ HOOK BI TREBALO DA RETURN-UJE I PROPERTI KOJI SE ODNOSI NA DATA ALI I NA ERRORS; ALI I NA PRIMER BOOLEAN PROPERTI `hasErrors`

**ALI NAJVAZNIJE, POSTO TI EXECUTE-UJES REQUEST INSIDE onSubmit ,TREBALO BI DA OVAJ HHOK IMA I FUNKCIJU KOJA SE TAK ONAKNADNO MOZE POZVATI, I ONA CE DA CHANG-UJE STATE** (LAKSE POKAZATI NEGO OBJASNITI)

- `mkdir client/hooks`

- `touch client/hooks/useRequest.ts`

JA SAM OVDE KREIRAO MALO VISE STVARI OD USER-A, CISTO SAM SE MALO VISE IGRAO; UGLAVNO MKADA SE ZAGLEDAS RAZUMCES OVAJ CUSTOM HOOK

```ts
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
        // NEKADA CE userData I data BITI ISTO
        setUserData(response.data);
        // KADA ZAHTEVAS USER-A BICE (AKO IMA email-A BICE)
        // TO SAM URAIO JER JE AUTOR WORKSHOPA
        // REKAO DA BI ZELEO OVAJ HOOK KORISTIT I ZA NESTO DRUGO
        // MOZDA CE SE OVAKJ CUSTOM HOOK KORISTITI ZA REQUESTS
        // PREM NEKIM DRUGIM MICROSERVICE-OVIMA, KOJI NISU auth
      }
      // MALO SAM SE IGRAO SA LOGIKOM

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

```

# MOZES SADA REFAKTORISATI `/auth/signup` PAGE, KAKO BI KORISTILA MOJ CUSTOM HOOK `useRequest`

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";

// OVO OVDE VISE NIJE POTREBNO
// import axios from "axios";

// UVOZIM CUSTOM HOOK
import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // KORISTIM GA
  const {
    userData,
    data,
    errors,
    makeRequest,
    hasErrors,
  } = useRequest("/api/users/signup", "post", { email, password });

  // ON ZAMENJUJE SVE OVO STO SAM COMMENT-OVAO OUT

  /* const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  ); */

  /* const sendRequest = useCallback(async () => {
    try {
      const response = await axios.post(
        "/api/users/signup",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // OVDE SE MOGU CLEAR-OVATI ERRORS
      setErrors([]);
      //

      const data = response.data;

      setEmail("");
      setPassword("");
    } catch (err) {
      setErrors(err.response.data.errors);
    }
  }, [email, password, setEmail, setPassword, setErrors]);
  */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        // PRAVIM REQUEST
        makeRequest().then(() => {
          // OVDE JE LOGIKA MALO ZAGULJNA ALI SHVATICES
          // KAD SE MALO ZAGLEDAS ZASTO BAS OVAKAV USLOV
          // IZGLEDA TI OBRNUTO ALI NECE BITI VERUJ MI
          if (hasErrors) {
            setEmail("");
            setPassword("");
          }
        });
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
      {/* OVO CE SE RENDER-OVATI AKO JE hasErrors USTVARI true */}
      {hasErrors && (
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {errors.map(({ message, field }) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )}
      {/* ---------------------------------------------------- */}
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;

```

NECE BITI NIKAKVIH, DA KAZEM ODSTUPANJA U LOGICKOM SMISLU, NISAM NAPRAVIO N IJEDAN PROBLEM, KADA SAM TESTIRAO OVO

U SUSTINI MOGU SMTRATI DA JE SVE OK, KAO I U SLUCAJU IZ PREDHODNOG BRANCH-A KADA NISAM KORISTIO CUSTOM HOOK
