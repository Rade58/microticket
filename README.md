# ADDING A SIGNUP FORM

***

**NAPOMENA**:

**OVDE SAM OBJASNIO I ZASTO SE KUCA `thisisunsafe` (OVO JJE STVAR VEZANA ZA HSSL, ODNOSNO HTTPS), STO CE BITI VAZNO ZA COOKIE, A VIDECES I ZASTO**

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

KADA SAVE-UJES MOZES DA NAPRAVIS REQUESTS U BROWSER-U

**ALI DA TE UPOZORIM NA CINJENICU KOJU SI PODESIO U SVOM auth-U A TICE SE COOKIE-A**

# `Your connection is not private` ERROR U BROWSER-U

TI DA BI DOBIO COOKIE U RESPONSE-U **MORAS DA SEND-UJES REQUEST KORISTECI HTTPS PROTOCOL, ODNONO TVOJ NEXTJS APP, MORA BITI SERVED PREKO HTTPS**

**JA SAM PODESIO SECURE COOKIE OPCIJU, U NASEM auth MICROSERVICE-U, ZATO JE TO TAKO**

TI MOZES PREVARIRI DA KAZEMO BROWSER TAK OSTO CES URADITI JEDNIU STVAR

PRVO NARAVNO MORAS OTVORITI TVOJ PAGE U BROWSERU KORISTECI HTTPS U URL-U, ODNONO KUCACES `https://microticket.com/auth/signup`

**ODMAH ZATO STO SI IZABRAO https IMACES ERROR**

`Your connection is not private`, I TVOJ PAGE NECE BITI RENDERED

**OVO CES PREVAAZICI SAMO KUCANJEM: `thisisunsafe`** (KLIKNI BIL OGDE NA STRANICU, SAMO DA JE U FOKUSU, I KUCAJ OVO)

**NAKON TOGA CE TI SE PRIKAZATI PAGE**

# SADA MOZES DA TESTIRAS

KUCAO SAM email I password I SUBMITOVAO

VIDECES DA CE SE USPESNO NAPRAVITI NOVI USER OBJEKAT

MOZES U BROWSER-U DA INSPECT-UJES COOKIES, IDUCI U `Application -> Cookis`

**VIDECES TAMO VREDNOST TVOG COOKIE-A, KOJI JE AKO SE SECAS, USTVARI BASE 64 ENCODING OD OVAKVOG OBJEKTA `{jwt: <issued json web token>}`**

# EDJUTIM AUTOR WORKSHOPA VOLI axios VISE NEGO `window.fetch` TAKO DA CU INSTLAIRATI axios I ONDA CU NJEGA USTVARI UPOTREBITI ZA SLANJE NETWORK REQUEST-OVA


