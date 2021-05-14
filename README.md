# REMINDER AND FEW FIXES

DAKLE JA KORISTIM SERVER SIDE RENDERING

I TO IMAM DVA MOGUCA MESTA SA KOJEG SALJEM PROPSE; **I KADA KAZEM DVA MOGUCA MESTA MISLIM NA DVE FUNKCIJE, TACNIJE DVA REQUEST HANDLER-A; KOJA SE MOGUCE MOGU IZVRSAVATI ON VISIT OF PAGE MOJE APLIKCIJE**

`getInitialProps` SE HOCE IZVRSITI ZA SVAKI PAGE NASE CLIENT SIDE APLIKACIJE, ZASIGURNO; I TU FUNKCIJU SAM PODESIO U APP PAGE-U `/pages/_app.tsx`

`getServerSideProps` SE HOCE IZVRSITI ZA SVAKI PAGE ZA KOJI JE DEFINISAN; JA IMAM SAMO JEDAN OVAJ HANDLER DEFINISAN, ZA INDEX PAGE, ALI NE SALJEM NISTA RELEVANTNO, SAMO NEKI FOO MESSAGE, U CILJU TRY OUT-A

## TRENUTNO KOD MENE `getInitialProps`, IMA PRIMARNU NAMENU DA POSALJE REQUEST ZA CURRRENT USER (`/api/users/current-user` ENDPOINT), I DA TAKO OSIGURA AUTHENTICATION LOGIC, PRE NEGO STO JE BILO STA RENDERED NA PAGE-U

NARAVNO, AKO NEMA USER-A, SLACE SE errors KAO PROPS

## ALI SAMI `/pages/_app.tsx` MENI SLUZI I DA RENDER-UJEM JEDNU TE ISTU KOMPONENTU NA SVIM PAGE-OVIMA, I DA KOMPONENTI PROSLEDIM ONO STAZELIM KAO PROPSE

KOD NAS JE Header KOMPONENTA RENDERED NA SVAKOM PAGE-U, A `currentUser`-A JOJ PROSLEDJUMEO KAO PROPS; **BAS ZATO STO SMO JE DEFINISALI KROZ `_app.tsx`**

I HEADER IMA SVOJU LOGIKU, I U ODNUSA NA TO DA LI POSTOJU CURRENT USER, ON PRIKAZUJE DUGMAD ZA SIGNIN ILI SIGNUP ILI SIGNOUT

## CISTO DA VIDIS PRAKTICNO KAKO SE IZVRSVAJU `getInitialProps` "`APP PAGE`"-A, I `getServerSideProps` INDEX PAGE-A, STAMPACU NESTO U TIM FUNKCIJAMA

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

SADA CU DA POKRENEM SKAFFOLD

- `skaffold dev`

MOZES DA OBAVIS ONU PRIJAVU NA SIGNUP NAMERNO, AKO SI TO BVEC RANIJE RADIO IMAS COOKIE I SVE JE OK ALI PRIJAVI SE, POSTO ZELIM DA CURRENT USER BUDE PRISUTAN KADA BUDEMO OBAVLJALI OVAJ NAS MANUELNI TEST

OTVORI NOVI TAB BROWSER-A

1. UNESI `https://microticket.com/` U ADRESS BAR I PRISTISNI ENTER (DAKLE IDEMO NA INDEX PAGE)

PA POGLEDAJ SKAFFOLD TERMINAL

EVO STA SE STAMPALO U SKAFFOLD TERMIANLU

```zsh
# EVO IMAS ONO STO SAM DEFINISAO DA SE STAMPA U `getInitialProps`
[client] {
[client]   FROM_GET_INITIAL_PROPS_FUNCTION: {
[client]     currentUser: {
[client]       email: 'stavros@mail.com',
[client]       id: '609e682ba16d56002385afb0',
[client]       iat: 1620994091
[client]     }
[client]   }
[client] }
# OVO JE ONO STO SAM DEFINISAO DA SE STMAPA U `getServerSideProps` ZA INDEX PAGE
[client] {
[client]   FROM_GET_SERVER_SIDE_PROPS_INDEX_PAGE: {
[client]     host: 'microticket.com',
[client]     'x-request-id': '397b6e513b6cf45b50d61722ad0d58b4',
[client]     'x-real-ip': '178.223.56.235',
[client]     'x-forwarded-for': '178.223.56.235',
[client]     'x-forwarded-host': 'microticket.com',
[client]     'x-forwarded-port': '443',
[client]     'x-forwarded-proto': 'https',
[client]     'x-scheme': 'https',
[client]     'upgrade-insecure-requests': '1',
[client]     'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
[client]     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
[client]     'sec-gpc': '1',
[client]     'sec-fetch-site': 'none',
[client]     'sec-fetch-mode': 'navigate',
[client]     'sec-fetch-user': '?1',
[client]     'sec-fetch-dest': 'document',
[client]     'accept-encoding': 'gzip, deflate, br',
[client]     'accept-language': 'en-US,en;q=0.9',
[client]     cookie: 'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW5OMFlYWnliM05BYldGcGJDNWpiMjBpTENKcFpDSTZJall3T1dVMk9ESmlZVEUyWkRVMk1EQXlNemcxWVdaaU1DSXNJbWxoZENJNk1UWXlNRGs1TkRBNU1YMC5BSUFSamFteVh6eGhqTVJRTnR6Q3poQllLRVljREM2Q0lGY3hWODJKYVZvIn0='
# OVO SU PROPSI KOJE SAM DEFINISAO DA SE STMAPAJU U SAMOJ KOMPONENTI
# ALI TAJ CODE LOGGINGA SE IZVRSIO I SERVER SIDE
# ZATO JE OVO STMAPANO OVDE U TERMINALU
# A PORED TOGA NACI CES OVAJ LOG I U BROWSEROVOJ KONZOLI
[client]   }
[client] }
[client] {
[client]   data: {
[client]     currentUser: {
[client]       email: 'stavros@mail.com',
[client]       id: '609e682ba16d56002385afb0',
[client]       iat: 1620994091
[client]     }
[client]   },
[client]   foo: 'bar'
[client] }
# DAKLE SVE JE KAKO SAM I OCEKIVAO
# I ONO PROSLEDJENO IZ getInitialProps I getServerSideProps
# JE ZAVRSILO U KOMPONENTI 
# foo : 'bar' SMP PROSLEDILI IZ `getServerSideProps`
```

2. SADA CEMO POSETITI DRUGI PAGE NASE APLIKACIJE, A TO CE BITI `https://microticket.com/auth/signin`

OVO JE ONO STA SE STAMPALO U SKAFFOLD TERMINALU

```zsh
# EVO OVO SAM DEFINISAO DA SE STMAPA INSIDE `getInitialProps`
[client] {
[client]   FROM_GET_INITIAL_PROPS_FUNCTION: {
[client]     currentUser: {
[client]       email: 'stavros@mail.com',
[client]       id: '609e682ba16d56002385afb0',
[client]       iat: 1620994091
[client]     }
[client]   }
[client] }
# NISMO DEFINISALI     `getServerSideProps`    ZA POMENUTI PAGE
# PREMA TOME OKO TOGA SE NISTA NIJE NI MOGLO STMAPTI

# ALI EVO I OVDE IMAMO ONO STA SMO DEFINISALI DA SE STMAPA CLIENT SIDE (DAKLE U BROWSERU)
# STO ZNACI DA SE CODE IZVRSIO I SERVER SIDE, CIM JE STMAPAN OVDE
# ALI NAJVAZNIJA STVAR JE DA JE TO ONO STO SMO PROSLEDILI IZ
# `getInitialProps` APP PAGE-A
[client] {
[client]   data: {
[client]     currentUser: {
[client]       email: 'stavros@mail.com',
[client]       id: '609e682ba16d56002385afb0',
[client]       iat: 1620994091
[client]     }
[client]   },
[client] }
```

DAKLE NAJVAZNIJA STVAR KOJU TREBAM DA ZAPAMTIM, JESTE TA DOBRA STRANA UPOTREBE `getInitialProps` ODNOSNO, ILI `getServerSideProps`-A  

# JA DAKLE TRENUTNO KORISTIM `getInitialProps` SAMO DA OBEZBEDIM CURRENT USER-A; ILI DA GA NE OBEZBEDIMA; DAKLE SAMO ZBOG AUTHENTICATION-A

MEDJUTIM NEKE STVARI NISMA DEFINISAO, VEZNE ZA TOG USER-A

**I SAM VIDIS DA SAM NESMETANO OTISAO NA SIGNIN PAGE A NISAM BIO REDIRECTED DO INDEX PAGE-A**

TO BI UPRAVO TREBAL ODA SE RADI U SLUCAJU DA JE PRISUTAN USER

TO BI VAZILO I ZA SIGNUP PAGE

DOBRO TO SU NEKE STVARI KOJE BI SE TREBALE PROMENITI, **A ZAISTA SE MOGU PROMENITI**

MOZDA CES TU LOGIKU TOKOM WORKSHOPA DEFINISATI U KOMPONENTI, KOJU BI MOZDA RENDER-OVAO ISTO KAO STO SI RENDER-OVAO I HEADER; NAIME INSIDE APP PAGE-A (ODNOSNO OVDE: `client/pages/_app.tsx`)

# NAIME ISTO POGLEDAJ `client/utils/buildApiClient.ts` DA SE PODSETIS KAKO SMO DEFINISALI DA SE BUILD-UJE API CLIENT, U ZAVISNOSTI OD TOGA DA LI SE RADI O SERVER SIDE MAKINGU REQUEST-OVA, PREM NASIM DRUGIM MICROSERVICE-OVIMA, ILI SE MAKE-UJU REQUESTS FROM THE BROWSER

- `cat client/utils/buildApiClient.ts`

```ts
import axios from "axios";
import { isSSR } from "./isSSR";
import { GetServerSidePropsContext, NextPageContext } from "next";

// OVA FUNKCIJA USTVARI UZIMA context U KOJEM SU REQUEST I RESPONSE PORED OSTALOG
export const buildApiClient = (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  const isServerSide = isSSR();

  // EVO VIDIS OVO JE BASE URL KOJI SE KORISTI KADA
  // SE MAKE-UJE REQUEST FROM ONE POD TO ANOTHER INSIDE CLUSTER
  const baseURL = isServerSide
    ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
    : "";
  // KAO STO SI VIDEO U PITANJU JE INGRESS NGINX STVAR

  if (isServerSide && ctx) {
    // OVDE SU PROSLEDJENI I SVI COOKIES FROM THE ctx.req
    return axios.create({
      // NARAVNO NOVI BASE URL SE KORISTI
      baseURL,
      headers: ctx.req.headers,
    });
  } else {
    // OVDE SE USTVARI RETURN-UJES SAMO axios
    // JER NIJE REC O SERVER SIDE-U CODE-U
    return axios;
  }
};

```

MISLIM DA JE OVO JASNO

OVO GORE SAM KORISTIO DA UZMEM USER OBJECT INSIDE `getInitialProps`

ZNAS I ZASTO; PA ZATO STO JE TO SERVER SIDE CODE, JEDNOG PODA; A `auth` MICROSERVICE RUNN-UJE U POTPUNO DRUGOM POD-U

# JA SAM TAKODJE NAPRAVIO `useRequest` CUSTOM HOOK, KOJI NE SLUZI SAMO DA SE NAPRAVI REQUEST, VEC SE MOZE PROSLEDITI I REDIRECTION URL, USTVARI URL ZA PROGRMATTIC NAVIGATION

TO POGLEDAJ ON YOUR OWN

A KORISTIO SAM GA U SIGNIN SIGNUP SIGNOUT PAGE-OVIMA ZA REDRECTIONG ON SUBMIT
