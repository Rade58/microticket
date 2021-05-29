# `Header` COMPONENT FOR PREMIUM PAGE

INSTALIRACEMO `@emotion/react` PAKET DA BI IZ NJEGA KORISTITLI `keyframes`

ALI MI TREBAJU I TYPE DEFINITIONS ZA `react-stickynode`

- `yarn add @emotion/react @types/react-stickynode`

A SADA PRAVIMO HEADER KOMPONENTU

- `mkdir client/components/premium/header`

- `touch client/components/premium/header/Header.tsx`

**HEADER CE BITI STICKY ILI NE U ZAVISNOSTI OD PROPA, KOJI CE SE KORISTITI KAO CSS CLASS**

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Container, Flex, Button, ThemeStyles } from "theme-ui";
import { FunctionComponent } from "react";
import { keyframes } from "@emotion/react";

interface HeaderPropsI {
  className: "sticky" | "non-sticky";
}

// OVO JE JEDAN ANIMACIJA
const headerPoitionAnim = keyframes`
  from {
    position: fixed;
    opacity: 1;
  }

  to {
    position: absolute;
    opacity: 1;
    transition: all 0.4s ease;
  }

`;

// STILOVI PASSED AS sx
// OVO CU PASS-OVATI U KOMPONENTU
// A DODAO SAM I TYPESCRIPT PODRSKU
// KADA ZELIM HEADERU DA DAM STILOVE, PASS-UJEM styles.header
const styles: ThemeStyles = {
  header: {
    color: "text",
    fontWeight: "body",
    py: 4,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
    transition: "all 0.4s ease",
    animation: `${headerPoitionAnim} 0.4s ease`,
    ".donate__btn": {
      flexShrink: 0,
      mr: [15, 20, null, null, 0],
      ml: ["auto", null, null, null, 0],
    },
    "&.sticky": {
      // EVO STILOVA ZA STICKY KLASU STO ZNACI DA CE HEADER BITI STICKI KADA IMA sticky KLASU
      // ALI NIJE ON TAJ KOJ ICE BITI STICKY, VEC ELEMNT KOJ IGA WRAPP-UJ A KOJI CU TI POKAZATI
      position: "fixed",
      backgroundColor: "background",
      color: "#000000",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
      py: 3,
      "nev > a": {
        color: "text",
      },
    },
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nav: {
    mx: "auto",
    display: "none",
    "@media screen and (min-width: 1024px)": {
      display: "block",
    },
    a: {
      fontSize: 2,
      fontWeight: "body",
      px: 5,
      cursor: "pointer",
      lineHeight: "1.2",
      transition: "all 0.15s",
      "&:hover": {
        color: "primary",
      },
      "&.active": {
        color: "primary",
      },
    },
  },
};

const Header: FunctionComponent<HeaderPropsI> = ({ className }) => {
  return (
    <header sx={styles.header} id="header" className={className}>
      {/*  */}
      ove cu ubrzo da definisem sta ce biti u header-u
      {/*  */}
    </header>
  );
};

export default Header;

```

# A SADA DA HOOK-UJEM UP HEADER, KOJI CE BITI PRVA STVAR NESTED U LAYOUT-U

MEDJUTIM KORISTICU ONAJ PAKET KOJI CINI DA HEADER BUDE STICKY

ODNOSNO WRAPP-OVACE GA ELEMENT KOJ ICE BITI STICKY

ALI VIDECES KAKO JE PAKET POSEBAN

- `code client/components/premium/Layout.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { FunctionComponent, Fragment, useState } from "react";
// OVO CE NAM TREBATI
import Sticky, { Status } from "react-stickynode";
// EVO GA HEADER
import Header from "./header/Header";

const Layout: FunctionComponent = ({ children }) => {
  const [isSticky, setIsSticky] = useState<boolean>(false);

  // DEFINISEM OVU FUNKCIJU KOJA ODREDJUJE DA LI CE HEADER BITI STICKY
  const handleStatus = (status: Status["status"]) => {
    if (status === Sticky.STATUS_FIXED) {
      setIsSticky(true);
    } else if (status === Sticky.STATUS_ORIGINAL) {
      setIsSticky(false);
    }
  };

  return (
    <Fragment>
      {/* STAVLJAM Header ALI STETE MENJA FUNKCIJA KOJ USAM DEFINISAO*/}
      <Sticky
        innerZ={1001}
        top={0}
        onStateChange={({ status }) => handleStatus(status)}
      >
        <Header className={isSticky ? "sticky" : "non-sticky"} />
      </Sticky>
      {/* KORISTIM VARIANTU KOJA JE DEFINISANA U TEMI */}
      <main id="content" sx={{ variant: "layout.main" }}>
        {children}
      </main>
      {/* OVDE CE ICI Footer */}
    </Fragment>
  );
};

export default Layout;

```

# SADA CEMO DODATI NEKE STVARI INSIDE HEADER

- `code client/components/premium/header/Header.tsx`

```tsx

```
