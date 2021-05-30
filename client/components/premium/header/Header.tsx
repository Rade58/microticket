/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
// EVO UZEO SAM KOMPONENTE Container, Flex I Button
import { jsx, ThemeStyles, Container, Flex, Button } from "theme-ui";
import { FunctionComponent } from "react";
import { keyframes } from "@emotion/react";

interface HeaderPropsI {
  className: "sticky" | "non-sticky";
}

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

// KAO STO VIDIS NEST-UJEM POMENUTE REACT ELEMENTE
// INSIDE header I ZADAJEM IM PREDODREDJENE STILOVE
const Header: FunctionComponent<HeaderPropsI> = ({ className }) => {
  return (
    <header sx={styles.header} id="header" className={className}>
      {/* USTVARI SVE STAVLJAMO U CONTAINER THEME UI-A */}
      <Container sx={styles.container}>
        <div>logo</div>
        {/* OVO CE BITI NAV */}
        <Flex as="nav" sx={styles.nav}>
          {/* OVDE CE BITI NAVIGACIJA  */}
        </Flex>
      </Container>
    </header>
  );
};

export default Header;
