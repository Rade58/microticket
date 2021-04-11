# HANDLING VALIDATION ERRORS

JA SALJEM CONSISTAN ERROR MESSAGES, ILI ERROROUS JSON IZ auth MICROSERVICE-A

SADA JE POTREBNO DA ONE ERRORS VEZANE ZA VALLIDATION, PRAVILNO HANDLE-UJEM U `/auth/signup` PAGE-U

MORAMO DA CAPT-URE-UJEMO VALIDATION ERRORS I DISPLAY-UJEMO IH NA SCREEN-U

- `code client/pages/auth/signup.tsx`

**KORISTICU `try catch` BLOK**

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";
import axios from "axios";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const sendRequest = useCallback(async () => {
    // OVDE STAVLJAM TRY CATCH BLOK
    // --------------------------------------------
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

      const data = response.data;

      console.log({ data });

      setEmail("");
      setPassword("");
    } catch (err) {
      console.log({ err });

      // JASNO JE DA CU OVDE HANDLE-OVATI ERROROUS RESPONSES
      // ONDE RESPONSE-OVE, KOJI NISU SA STATUS CODE-OVIMA
      // KOJI SU U RANGU 200

      // err JE USTVARI Error INSTANCA KOJU JE THROW-OVAO
      // AXIOS U SLUCAJU FAILED REQUEST-A

      // ONE PODATKE O ERRORU, KOJI MOJ MICROSERVICE SALJE SE NALAZE U
      //      err.response.data

      console.log(err.response.data); // OVO JE ONAJ
      //                                {errors: [{message, field}]}
      //                                 OBJEKAT, KOJI SAM JA TAKO FORMATIRAO
      //                                  ZA SVAKI ERROR, KAKO BI BIO CONSISTENT
    }
    // --------------------------------------------
  }, [email, password, setEmail, setPassword]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        sendRequest();
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
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;

```

## NAPRAVICU SADA JEDAN REQUEST, KOJI TREBA DA FAIL-UJE, JER CE `password` BITI PREKRATAK

EVO STA SE STAMPALO KAO `err.response.data`

```js
{
  errors: [
    {message: "Password must be valid", field: "password"}
  ]
}
```

# SADA CU NAPRAVITI STATE ZA ERRORS ARRAY, I DISPLAY-OVACU ERROR DATA TO THE USER

- `code client/pages/auth/signup.tsx`

NA DNU UI-A, PRE SUBBMIT BUTTON-A, SAM MAPP-OVAO ERRORS

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";
import axios from "axios";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // EVO PRAVIM I TAJ errors DEO STATE-A
  const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  );

  const sendRequest = useCallback(async () => {
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
      // SETT-UJEM ERRORS
      setErrors(err.response.data.errors);
    }
  }, [email, password, setEmail, setPassword, setErrors]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        sendRequest();
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
      {/* OVO SAM DODAO */}
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {errors.map(({ message, field }) => {
              // fields NECU KORISTITI
              // JER NEMAM VREMENA, A IDEJA JE DA SE KORISTI
              // KAD DISPLAY-UJEM GRESKE ISPOD SVAKOG OD FIELD-OVA
              // JA TO SADA NE RADDIM (DISPPLAY-UJEM SVE U JEDNOM BLOKU, JER NEMAM VREMENA)
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )}
      {/* -------------------------- */}
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;

```

SAVE-UJ

POKUSAJ SADA DA ODMAH SUBMITT-UJES BEZ IKAKVIH UNOSA ZA email I password, ILI PROBAJ DA STAVIS NEVALIDNI PASSWORD MANJI OD 4 KARAKTERA, VIDECES DISPLAYED ERROR MESSAGES

