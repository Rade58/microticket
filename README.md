# PROBLEM SA SERVER SIDE RENDERING-OM I DETERMINING-A DA LI JE USER AUTHENTICATED

***

NAIME KAD, U SLUCAJU USPESNOG SIGNUP-A REDIRECT-UJES SA `/auth/signup` PAGE-A DO INDEX PAGE-A (ODNOSNO DO LANDING PAGE-A), TREBALO BI DA SE **INDICIRA DA JE KORISNIK SIGNED IN, ODNOSNO DA JE AUTHENTICATED**

ODNOSNO AKO USER NJETE AUTHENICATED TREBALO BI DA NA INDEX PAGE-U PISE `You are signed in`, U SUPROTNOM TREBA DA PISE `You are not signed in`

**ISTO TAKO KADA USER ODE NA INDEX PAGE, FOR THE FIRST TIME, TAJ TEKST `You are not signed in` TREBA DA BUDE DISPLAYED**

DA JE U PITANJU NORMAL REACT APPLICATION, SIGURNO BI ON MOUNTING INDEX PAGE-A DEFINISAO DA SE NAPRAVI DODATNI REQUEST, KA `/api/users/current-user` NADAJUCI SE DA CE COOKIE, USTVARI BITI PROVIDED U TOM FOLLOW UP REQUEST-U

***

**ALI TI SADA KORISTIS NEXTJS APP, I KORISTIS SERVER SIDE RENDERING**

**TREBAS DEFINISATI HOOK, KOJIM CES MOCI DA DEFINISES CODE KOJI CE SE IZVRSITI SERVER SIDE NA DELU NEXTJS-OVOG SERVERA, JER MOGUCE JE DA TAKVO NESTO DEFINISES; TAKO CCES POSTICI DA USTVARI SERVER SIDE TI NA SVAKU POSETU INDEX PAGE-A NAPRAVIS REQUEST PREMA `/api/users/current-user` I TAKO DETERMINE-UJES DA LI JE USER AUTHENTICATED ILI NE**

# KORISTICES `getServerSideProps` HOOK NEXTJS-A, KAKO BI PRAVIO SERVER SIDE REQUESTS, PRE SAMOG RENDERINGA, CIME CE SE PAGE RENDER-OVATI SA PROPSIMA KOJE TI POSALJES IZ TOG HOOK-A

JA SAM VEC DOSTA NAPISAO O [`SERVER SIDE DATA FETCHING-U U NEXTJS-U`](https://github.com/Rade58/production_grade-nextjs/tree/8_SERVER_SIDE_DATA_FETCHING#server-side-data-fetching)

SADA CU GA SAMO IMPPLEMENTIRATI BEZ DA PRETERANO SIRIM PRICU

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
// UVESCU, NEKE TYPE-OVE KOJI SE TICU getServerSideProps-A
import { GetServerSideProps } from "next";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //

  console.log(props);

  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // OVDE CES PARAVITI REQUEST PREMA /api/users/current-user

  // AKO UZMEM USERA, SLACU GA KAO PROPS U KOMPONENTU

  return {
    props: {
      placeholder: true,
    },
  };
};


export default IndexPage;
```

## SADA MOZES DA ZAHTEVAS CURRENT USER-A FROM `getServerSideProps`; ALI HAJDE DA POCNEMO MALO SPORIJE; HAJDE DA STAMPAMO HEADERS INSIDE getServerSideProps; A HEADERS MOZEMO UZETI, POSTO INSIDE getServerSideProps IMAMO PRISTUP REQUEST-U I RESPONSE-U

AKO JE COOKIE PRISUTAN PRI NAVIGATINGU NA PAGE (PRI TOM REQUEST-U, ONDA BI TREBALO DA BUDES U MOGUCNOSTI DA UZMES USER-A)

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  console.log({ props });

  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // UZIMAM REQUEST I STMPAM cookie HEADER
  const { headers } = ctx.req;

  // A OVI HEADESI SU PARSED INTO JAVASCRIPT OBJECT, A PLUS JOS IMAM TYPESCRIPT
  // TAKO DA MOGU LAKO SELEKTOVATI HEADERS KOJI ME ZANIMA

  const { cookie } = headers;

  console.log({ cookie });
  //

  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;

```

**MOZES SADA DA ODES NA `/auth/signup` PAGE I NAPRAVI NOVOG USER-A**

DEFINISAO SI NA POMENUTOM PAGE-U DA BUDES REDIRECTED PREMA INDEX PAGE-U, KADA SE DOGODI USPESNO KREIRANJE NOVOG USER-A, ODNOSNO USPESAN SIGNUP

MOZES U TERMINALU POSMATRATI DA LI CE SE STAMPATI COOKIE NEPOSREDNO PRE NEGO STO TI SE RENDER-UJE INDEX PAGE

```zsh
{
  cookie: 'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW5OMFlYWnliM000T0RnNFFHMWhhV3d1WTI5dElpd2lhV1FpT2lJMk1EYzBPREEwWVdFNE1HVXdOekF3TWpRd1pUSTBNak1pTENKcFlYUWlPakUyTVRneU5EYzNOVFI5LkpFMEVnYndnTmZCYXl3ajlVa1kwMjZnMlQxMnRIMl8tNUtfR1VUSURueGcifQ=='
}
```

**COOKIE JE ZAISTA STAMPAN U TERMINALU, STO ZNACI DA JE COOKIE PRISUTAN** (DAKLE PRISUTAN JE U FOLLOW UP REQUESTU, POSLE ONOG REQUEST-A GDE JE COOKIE SETT-OVAN (Set-Cookie HEADER))

## TI SADA, INSIDE `getServerSideProps` ZELIS DA NAPRAVIS REQUEST PREMA `/api/users/current-user`; I TADA CES TI MORATI MANUELNO DA SETT-UJES COOKIE HEADER, JER `getServerSideProps` NIJE BROWSER I NEMA MOC DA AUTOMASTSKI SALJE COOKIE HEADER; MEDJUTIM TO NIJE JEDINI PROBLEM KOJI CES SUSRECI; PROBLEM CE BITI KUBERNETES INFRASTRUCTURE

HAJDE DA POSALJEMO REQUEST PA DA VIDIS KAKAV CES PROBLEM IMATI

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// SADA UZIMAM AXIOS
import axios from "axios";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  console.log({ props });

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie } = headers;

  console.log({ cookie });

  // EVO SALJEEM REQUEST
  const response = await axios.get("/api/users/current-user", {
    headers: {
      cookie,
    },
  });

  console.log({ data: response.data });

  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;

```

MOZES DA RELOAD-UJES PAGE

**ONO STO CU DOBITI JESTE OVAKAV ERROR, I MOCI CES GA VIDETI U TERMINALU (`skaffold`-U), A MOCI CES GA VIDETI I U BROWSER-U, JER JE I SAV RENDERING PREVENTED**

```zsh
Server Error
Error: connect ECONNREFUSED 127.0.0.1:80

This error happened while generating the page. Any console logs will be displayed in the terminal window.
```

## ERROR KOJI JE THROWN JESTE `Error: connect ECONNREFUSED`

IZ GORNJEG ERRORA MOZES VIDETI DA JE ERROR (127.0.0.1:80)

**NAIME TI DA NISI REQUEST PRAVIO INSIDE `getServerSideProps` ;VEC DA SI IZ BROWSERA, ODNOSNO IZ TVOJE REACT KOMPONENTE DA SI NAPRAVIO ISTI REQUEST SVE BI BILO U REDU, IMAO BI USPESAN REQUEST; AKO USER NE BI BIO AUTHENTICATED DOBIO BI `{currentUser: null}`, U SUPROTNOM BI FOBIO `currentUser`-A**

