# ADDING A SIGNUP FORM

***

**NAPOMENA**:

**OVDE SAM OBJASNIO I `thisisunsafe` (OVO JJE STVAR VEZANA ZA HSSL, ODNOSNO HTTPS), STO CE BITI VAZNO ZA COOKIE, A VIDECES I ZASTO**

***

KREIRAM `/auth/signup` PAGE

- `mkddir client/pages/auth`

- `touch client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const SignupPage: FunctionComponent = () => {
  return (
    <form>
      <h1>Sign Up</h1>
    </form>
  );
};

export default SignupPage;
```

AKO TI JE UGASEN SKAFFOLD POKRENI GA `skaffold dev`

SADA MOZES DA POSETIS I PAGE `microticket.com/auth/signup`

## SADA NASTAVLJAM SA DEFINISANJEM FORMULARA

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const SignupPage: FunctionComponent = () => {
  return (
    <form>
      <h1>Sign Up</h1>
      <label htmlFor="email-signup">Email Address: </label>
      <input id="email-signup" type="email" className="form-control" />
      <label htmlFor="password-signup">Password: </label>
      <input id="password-signup" type="password" className="form-control" />
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default SignupPage;
```

# HANDLING email AND password INPUTS

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const sendRequest = useCallback(async () => {
    // request will be here
    console.log("Sending Request");

    setEmail("");
    setPassword("");
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

# SUCCESSFUL USER SIGNUP

PRAVIM REQUEST PREMA `/api/users/signup`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const sendRequest = useCallback(async () => {
    // EVO SADA STVARNO PRAVIM REQUEST
    const response = await fetch("/api/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // STAMPAM DATA
    console.log({ data });

    setEmail("");
    setPassword("");
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

**MEDJUTIM AUTOR WORKSHOPA VOLI axios TAK ODA CU INSTLAIRATI axios I ONDA CU **


KADA SAVE-UJES MOZES DA NAPRAVIS REQUESTS U BROWSER-U

VIDECES DA CE SE USPESNO NAPRAVITI NOVI USER OBJEKAT

MOZES U BROWSER-U DA INSPECT-UJES COOKIES

