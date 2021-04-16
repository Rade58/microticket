# LOGIKA HEADER-A

DAKLE SADA MI JE currentUser DOSTUPAN INSIDE _app PAGE COMPONENT, JER JE _app.getInitialProps ODGOVORAN ZA GETTING CURRENT USER-A

ISTO TAKO, KROZ _app JA, STAVLJANJEM REACT ELEMENT-A, MOGU DEFINISATI DA IMAM HEADER NA SVAKOM OD PAGE-OVA

ALI POSTO ZELIM NAVIGACIJU U HEADER-U I MOZDA ZELIM I DA SE LINK NA KOJEM SAM TRENUTNO HIGHLIGHT-UJE, ILI ZELIM DA U HEADERU DIPLAY-UJEM EMAIL CURRENT USER-A, ILI ZELIM DA NE POKAZUJEM SIGNUP I SIGNIN LINKS, AKO currentUser NIJE null; **JA MOGU ISKORISTITI PROPSE INSIDE `MyApp` PAGE COMPONENT, KAKO BI DEFINISAO LOGIKU I OSTALO, ZA TAJ HEADER**

# KREIRACU PRVO `Header` COMPONENT

- `touch client/components/Header.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
import React, { FunctionComponent } from "react";

// UVEZAO SAM I NEXT LINK
import Link from "next/link";

// DAKLE OVOJ KOMPONENTI CE SE KAO PROP DODAVATI currentUser
import { currentUserType } from "../pages/index";

interface HeaderPropsI {
  currentUser: currentUserType;
}

const Header: FunctionComponent<HeaderPropsI> = ({ currentUser }) => {
  // AKO JE currentUser PRIUTAN TREBALO BI DA POKAZES SIGNOUT BUTTON
  // AKO JE currentUser, USTVARI null, ONDA POKAZUJES Sign In I Sign Up LINKOVE

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">MicTick</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {currentUser !== null ? (
            <li>
              <button>Sign Out</button>
            </li>
          ) : (
            <>
              <li>
                <Link href="/auth/signup">
                  <a>Sign Up</a>
                </Link>
              </li>
              <li>
                <Link href="/auth/signin">
                  <a>Sign In</a>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
```

## POKAZACEMO HEADER DA VIDIMO KAKO CE IZGLEDATI NA PAGE-OVIMA

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import { AppProps, AppContext } from "next/app";
import { buildApiClient } from "../utils/buildApiClient";
import { currentUserType } from "./index";
import "bootstrap/dist/css/bootstrap.css";
// UVOZIM Header KOMPONENTU
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  // IZDVAJAMO currentUser IZ data PROP-A
  const { currentUser } = pageProps.data;

  return (
    <div>
      {/* STVLJAMO HEADER, I PASS-UJEMO currentUser*/}
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

    return {
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

**OVO ODMAH MOZES TESTIRATI**

UKLONI COOKIE, I VIDECES DA CE NA EKRANU BITI PRIKAZANI SIGN IN I SIGNUP LINKOVI

DOK AKO SE SIGN-UJES UP ILI IN, VIDECES DA CE NA HEADERU BITI SIGNOUT DUGME

