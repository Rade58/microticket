# ADDING `"next-optimized-images-plugin"`

EVO VIDECES KAKO CU GA ZADATI

- `code client/next.config.js`

```js
// OVD SU MNOGE STVARI KOJE SAM DEFINISAO OD RANIJE I
// TO IGNORISI
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const dotenvLoad = require("dotenv-load");

const nextEnv = require("next-env");
const withPlugins = require("next-compose-plugins");

// EVO UVOZIMO PLUGIN, A KORISTIM GA DOLE NA SAMOM KRAJU
const nextOptimizedImagesPlugin = require("next-optimized-images");

dotenvLoad();

const envPlugin = nextEnv();

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) console.log("Development");
  if (phase === PHASE_PRODUCTION_BUILD) console.log("Production");

  const newConfig = { ...defaultConfig };

  newConfig.webpack = (config, options) => {
    /* config.module.rules.push({
      test: /\.js$/,
      exclude: /(node_modules)/,
      enforce: "post",
      use: {
        loader: "ify-loader",
      },
    }); */

    return config;
  };

  // WEBPACK 5 ENABLING
  /* newConfig.future = {
    webpack5: true,
  }; */

  newConfig.webpackDevMiddleware = (config) => {
    config.watchOptions.poll = 300;
    config.watchOptions.aggregateTimeout = 300;
    return config;
  };
  

  const configuration = withPlugins([
    envPlugin,
    // OVDE CEMO ZADATI TAJ PLUGIN, ALI DODAJEMO I OPCIJU target
    nextOptimizedImagesPlugin
  ])(
    phase,
    {
      defaultConfig: newConfig,
      // EVO JOS SAM OVO DODAO (NE ZNAM CEMU SLUZI I DA LI ISTA RADI)
      // ALI TO JE DEFINISAO AUUTOR TUTORIJALA
      target: "serverless",
    }
  );


  return configuration;
};

```

## I SADA MI VISE NECE DAVATI ERROR, TAMO GDE SAM POKUSAO DA UVEZEM IMAGE

- `cat client/components/premium/header/Header.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, ThemeStyles, Container, Flex, Button } from "theme-ui";
import { FunctionComponent } from "react";
import { keyframes } from "@emotion/react";
import { Link } from "react-scroll";
import pathsAndLables from "./react-scroll-data";

import Logo from "../Logo";
// OVO CE SADA BITI U REDU
// eslint-disable-next-line
// @ts-ignore
import logoPath from "../../../assets/logo.svg";
// I MOCI CES DA KORISTIS GORNJE KAO PATH
// POGLEDAJ DOLE GDE RENDER-UJES LOGO

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
        {/* EVO VIDIS KAKO SAM OVDE URADIO */}
        {/* UNDER THE HOOD OVO KORISTI theme-ui IMAGE KOMPONENTU (SAMO NAPOMINJEM) */}
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

```

SADA JE SVE U REDU, VIDECES RENDERED SLIKU, NARAVNO RESTARTUJE SKAFFOLD PRVO (`skaffold dev`)

## JA JOS NISAM LOGO WRAPP-OVAO U NEKI LINK

TO NISAM JOS URADIO JER ZELIM TIME DA SE POSEBNO POZABAVIM KASNIJE
