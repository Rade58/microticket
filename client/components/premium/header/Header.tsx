/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, ThemeStyles, Container, Flex, Button } from "theme-ui";
import { FunctionComponent } from "react";
import { keyframes } from "@emotion/react";
import { Link } from "react-scroll";
import pathsAndLables from "./react-scroll-data";

// UVOZIM LOGO
import Logo from "../Logo";
// A UVOZIMO I SVG, DNONO TO CE NAM OBEZBEDITI PATH DO LOGOA
// eslint-disable-next-line
// @ts-ignore
import logoPath from "../../../assets/logo.svg";

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

const Header: FunctionComponent<HeaderPropsI> = ({ className }) => {
  return (
    <header sx={styles.header} id="header" className={className}>
      <Container sx={styles.container}>
        {/* DODAJEM LOGO */}
        <Logo src={logoPath} />
        {/*  */}
        <Flex as="nav" sx={styles.nav}>
          {pathsAndLables.map(({ label, path }, i) => {
            return (
              <Link
                key={i}
                activeClass="active"
                to={path}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                {label}
              </Link>
            );
          })}
        </Flex>
        <Button
          className="donate__btn"
          variant="secondary"
          aria-label="Get Started"
        >
          Get Started
        </Button>
      </Container>
    </header>
  );
};

export default Header;
