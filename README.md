# REMINDER AND FEW FIXES

DAKLE JA KORISTIM SERVER SIDE RENDERING

I TO IMAM DVA MOGUCA MESTA SA KOJEG SALJEM PROPSE; **I KADA KAZEM DVA MOGUCA MESTA MISLIM NA DVE FUNKCIJE, TACNIJE DVA REQUEST HANDLER-A; KOJA SE MOGUCE MOGU IZVRSAVATI ON VISIT OF PAGE MOJE APLIKCIJE**

`getInitialProps` SE HOCE IZVRSITI ZA SVAKI PAGE NASE CLIENT SIDE APLIKACIJE, ZASIGURNO; I TU FUNKCIJU SAM PODESIO U APP PAGE-U `/pages/_app.tsx`

`getServerSideProps` SE HOCE IZVRSITI ZA SVAKI PAGE ZA KOJI JE DEFINISAN; JA IMAM SAMO JEDAN OVAJ HANDLER DEFINISAN, ZA INDEX PAGE, ALI NE SALJEM NISTA RELEVANTNO, SAMO NEKI FOO MESSAGE, U CILJU TRY OUT-A

# TRENUTNO KOD MENE `getInitialProps`, IMA PRIMARNU NAMENU DA POSALJE REQUEST ZA CURRRENT USER (`/api/users/current-user` ENDPOINT), I DA TAKO OSIGURA AUTHENTICATION LOGIC, PRE NEGO STO JE BILO STA RENDERED NA PAGE-U

NARAVNO, AKO NEMA USER-A, SLACE SE errors KAO PROPS

# ALI SAMI `/pages/_app.tsx` MENI SLUZI I DA RENDER-UJEM JEDNU TE ISTU KOMPONENTU NA SVIM PAGE-OVIMA, I DA KOMPONENTI PROSLEDIM ONO STAZELIM KAO PROPSE

KOD NAS JE Header KOMPONENTA RENDERED NA SVAKOM PAGE-U, A `currentUser`-A JOJ PROSLEDJUMEO KAO PROPS; **BAS ZATO STO SMO JE DEFINISALI KROZ `_app.tsx`**

I HEADER IMA SVOJU LOGIKU, I U ODNUSA NA TO DA LI POSTOJU CURRENT USER, ON PRIKAZUJE DUGMAD ZA SIGNIN ILI SIGNUP ILI SIGNOUT

# CISTO DA VIDIS PRAKTICNO KAKO SE IZVRSVAJU `getInitialProps` "`APP PAGE`"-A, I `getServerSideProps` INDEX PAGE-A, STAMPACU NESTO U TIM FUNKCIJAMA

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  const { currentUser } = pageProps.data;

  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;

  try {
    const apiClient = buildApiClient(ctx);

    const response = await apiClient.get("/api/users/current-user");

    // EVO OVDE CU DA STMAPAM DATA KOJI IZ RESPONSE-A ZA CURRENT USEROM
    console.log({ FROM_GET_INITIAL_PROPS_FUNCTION: response.data });

    return {
      // I VIDIS KAKO SE KAO PAGE PROP SALJE data ,A TO JE USTVARI DAT CUTRRENT USER-A
      pageProps: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        errors: err.message as any,
      },
    };
  }
};

export default MyApp;

```

- `code `

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
import { buildApiClient } from "../utils/buildApiClient";

// U CILJU DA LAKSE SHVATIS POGLEDAJ PRVO `getServerSideProps`
// KOJI SAM STAVIO ISPOD
// ZASTO NJEGA DA GLEDAS PRVOG?
// PA LOGICNO, ZATO STO SE ON PRVI IZVRSAVA, PRE PAGE-A
// A ZELIM DA TI TAMO OBJASNIM NESTO

interface CurrentUserI {
  id: string;
  email: string;
  iat: number;
}

export type currentUserType = CurrentUserI | null;

interface PropsI {
  data?: { currentUser: currentUserType };
  errors?: any;
  foo?: string;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // ZASTO STMAPAM PROPSE
  // PA ZELI MDA TI POKAZEM DA JE U NJIMA I ONO STO SALJES IZ getInitialProps
  // A I ONO STO SALJEM IZ getServerSideProps
  console.log(props);

  useEffect(() => {
    const apiClient = buildApiClient();

    apiClient.get("/api/users/current-user").then((response) => {
      console.log("FRONTEND");
      console.log(response.data);
    });
  }, []);

  const { data, errors } = props;

  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    return <h1>You are {!currentUser ? "not" : ""} signed in.</h1>;
  }

  return null;
};

// EVO OVDE IMAS getServerSideProps

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // ISTO KAO I  U getInitialProps TI IMAS OVDE
  // PRISTUP req I res

  // BEZVEZE SAM SAMO UZEO HEADERS
  const headers = ctx.req.headers;

  // I STMAPAM IH
  console.log({ FROM_GET_SERVER_SIDE_PROPS_INDEX_PAGE: headers });

  return {
    props: {
      // KAO STO VIDIS NE SALJEM NISTA SMISLENO
      // SAMO ZELIM DA VIDIM DA LI CE SE NACI MEDJU PROPISMA
      // NA FRONTEND-U
      foo: "bar",
    },
  };
};

export default IndexPage;
```

**HAJDE DA VIDIMO (ODNOSNO DA I HSTAMPAMO) I KOJE PROPSE CE IMATI I NEKI DRUGI PAGE, KOJEM NISI DEFINISAO `getServerSideProps` ALI KAO STA ZNAS ZA NJEGA CE SE IZVRISTI `getInitialProps` APP PAGE-A**

- `code client/pages/auth/signin.tsx`

```ts
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState } from "react";
import useRequest from "../../hooks/useRequest";

const SignInPage: FunctionComponent = (props) => {
  // EVO VIDIS STMAPAM POMENUTE PROPSE
  console.log({ props });

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    // userData,
    // data,
    // hasErrors,
    ErrorMessages,
    errors,
    makeRequest,
  } = useRequest("/api/users/signin", "post", { email, password }, "/");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const ob = await makeRequest();

        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");
        }
      }}
    >
      <h1>Sign In</h1>
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
        Sign In
      </button>
    </form>
  );
};

export default SignInPage;

```

SADA CI DA POKRENEM SKAFFOLD

- `skaffold dev`





