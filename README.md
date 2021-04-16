# BUILDING `/auth/signout` PAGE

AUTOR WORKSHOPA ODLUCIO JE DA IMA I SIGNUP PAGE (ISTO TAKO IRACIONALNO, KAO STO IMAM I SIGIN I SIGNUP PAGE (TO BI USTVARI SVE TREBALO DA BUDU CONDITIONALY RENDERED FORMULARI NA JEDNOM PAGE-U; ALI OVO JE CISTO ZBOG BRZINE, DA STO VISE STVARI PREDJEM, A TI ZNAS KAKO DA NAPRAVIS CONDITIONALLY RENDERE FORMS BY YOURSELF))

**MEDJUTIM SIGNUP PAGE CE BITI TAKAV DA CE U NJEMU ODMAH BITI DEFINISAN REDIRECT, ODNOSNO PROGRAMMATICAL NAVIGATION**

**JER REQUEST CE SE PRAVITI INSIDE `useEffect` HOOK-A**

**A ZA PROGRAMMATICAL NAVIGATION CE SE POSTARATI, MOJ CUSTOM `useRequest` HOOK, JER SAM TU LOGIKU NAPRAVIO UNDER THE HOOD, KADA SAM PRAVIO TAJ CUSTOM HOOK**

- `touch `

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import useRequest from "../../hooks/useRequest";

const SignOutPage: FunctionComponent = () => {
  // VEC OVDE SAM JA DEFINISAO KAKAV SE REQUEST MOZE OBAVITI
  const { makeRequest } = useRequest(
    "/api/users/signout",
    "get",
    {},
    // OVO OVDE ZNACI DA SAM PLANIRAO DA SE PROGRAMMATICAL
    // NAVIGATION OBAVI PREMA MAIN PAGE-U
    "/"
  );

  useEffect(() => {
    // PRAVIM REQUEST
    makeRequest();
  }, [makeRequest]);

  return <div>Signing you out...</div>;
};

export default SignOutPage;

```

## TI IMAS U Header KOMPONENTI DEFINISAN SIGNOUT ;LINK, KOJI TE VODI DO `/auth/signout` PAGE-A

DAKLE CIM PRITISNES TAJ LINK, BICES NAVIGATED NA POMENUTI PAGE

DESICE SE ON MOUNTING, ODAMH TAJ REQUEST, PREMA SIGNOUT ENDPOINTU TVOG auth MICROSERVICE-A

A TI CES BITI PROGRMATTICALLY NAVIGATED DO / PAGE-A

MOZES SVE OVO TESTIRATI LAKO, A AKO TI NIJE JASNO ISCITAJ MALO CODE
