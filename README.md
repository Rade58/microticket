# DEFINING MOBILE DRAWER

OVDE CEMO KORISTITI ["rc-drawer"](https://github.com/react-component/drawer) PACKAGE

ALI SMANJICU MU VERZIJU NA `v4.1.0`

- `cd client`

- `yarn add rc-drawer@v4.1.0`

NAPRAVICEMO PRVO DRAWER KOMPONENTU

ONA JE SELF CLOSING KOMPONENTA

- `touch client/components/premium/Drawer.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Box, jsx, ThemeStyles, SxProp } from "theme-ui";
import { FunctionComponent, Fragment, ReactElement } from "react";
// UVOZIM KOMPONENTU
import RcDrawer from "rc-drawer";
//

// DA PRVO TYPE-UJEMO PROPSE, KOJI MOGU DOCI U KOMPONENTI

interface DrawerPropsI {
  className?: string;
  toggle: () => void;
  open: boolean;
  width: string | number;
  placement?: "left" | "top" | "right" | "bottom";
  drawerHandler: boolean | ReactElement;
  closeButton: ReactElement;
  drawerStyle: any;
  closeBtnStyle: any;
  closeButtonStyle?: any;
}

const Drawer: FunctionComponent<DrawerPropsI> = ({
  children,
  open,
  className,
  width,
  placement,
  closeButton,
  toggle,
  closeBtnStyle,
  drawerStyle,
  drawerHandler,
  ...props
}) => {
  // DAKLE SVE STO SE STAVI INSIDE DRAWER JESTE
  // ONO STO CE TAMO BITI NESTED, JESTE ONO STO CE BITI MENU DRAWER-A

  return (
    <Fragment>
      <RcDrawer
        open={open}
        onClose={toggle}
        className={`drawer ${className || ""}`.trim()}
        width={width}
        placement={placement}
        handler={false}
        // OVO OVDE MI NE ODGOVARA UOPSTE
        // level={null} // AKO PODESIM NE RADI
        duration="0.4s"
        {...props}
      >
        {closeButton && (
          <Box as="div" onClick={toggle} sx={closeBtnStyle}>
            {closeButton}
          </Box>
        )}
        <Box sx={drawerStyle}>{children}</Box>
      </RcDrawer>
      <Box
        className="drawer__handler"
        style={{ display: "inline-block" }}
        onClick={toggle}
      >
        {drawerHandler}
      </Box>
    </Fragment>
  );
};

export default Drawer;
```

DAKLE DRAWER MI TREBA NA MOBILE UREDJAJIMA

STAVICU KOMPONENTU U ISTI FOLDER, GDE JE I HEADER

- `touch client/components/premium/header/MobileDrawer.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Box, ThemeUIStyleObject, ThemeStyles } from "theme-ui";
import { FunctionComponent, useState } from "react";
// TREBACE MI IKONE IZ OVOG PAKETA
import { IoMdClose, IoMdMenu } from "react-icons/io";

// UVESCU DRAWER-A
import Drawer from "../Drawer";

// EVO IH STILOVI ZA DRAWER
const styles: ThemeStyles = {
  handler: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // eslint-disable-next-line
    // @ts-ignore
    flexShrink: "0",
    width: "26px",

    "@media screen and (min-width: 1024px)": {
      display: "none",
    },
  },

  drawer: {
    width: "100%",
    height: "100%",
    backgroundColor: "dark",
  },

  close: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "25px",
    right: "30px",
    zIndex: "1",
    cursor: "pointer",
  },

  content: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    pt: "100px",
    pb: "40px",
    px: "30px",
  },

  menu: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    a: {
      fontSize: "16px",
      fontWeight: "500",
      color: "text_white",
      py: "15px",
      cursor: "pointer",
      borderBottom: "1px solid #e8e5e5",
      transition: "all 0.25s",
      "&:hover": {
        color: "secondary",
      },
      "&.active": {
        color: "secondary",
      },
    },
  },

  menuFooter: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    mt: "auto",
  },

  social: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    icon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "text",
      fontSize: 14,
      mr: "15px",
      transition: "all 0.25s",
      cursor: "pointer",
      ":last-child": {
        mr: "0",
      },
      "&:hover": {
        color: "secondary",
      },
    },
  },

  button: {
    color: "white",
    fontSize: "14px",
    fw: "700",
    height: "45px",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    py: "0",
  },
};

const MobileDrawer: FunctionComponent = () => {
  // TREBA NAM STATE O TOME DA LI JE DRAWER OPENED ILI NE

  const [isDrawerOppened, setIsDrwerOpened] = useState<boolean>(false);

  return (
    <Drawer
      width="320px"
      drawerHandler={
        <Box sx={styles.handler}>
          <IoMdMenu size="26px" />
        </Box>
      }
      open={isDrawerOppened}
      toggle={() => setIsDrwerOpened((prev) => !prev)}
      closeButton={<IoMdClose size="24px  " color="#000000" />}
      // placement="right"
      drawerStyle={styles.drawer}
      closeBtnStyle={styles.close}
    ></Drawer>
  );
};

export default MobileDrawer;
```

# SADA CU DA STAVIM MOBILE DRAWER INSIDE HEADER COMPONENT

- `code client/components/premium/header/Header.tsx`

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
// eslint-disable-next-line
// @ts-ignore
import logoPath from "../../../assets/logo.svg";
// UZIMAM MOBILE DRAWER
import MobileDrawer from "./MobileDrawer";
//

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
        {/* STAVICU GA OVDE */}
        <MobileDrawer />
      </Container>
    </header>
  );
};

export default Header;
```

PROBAO SAM I VIDIM DA LEPO RADI, IMA ANIMACIJU

# STAVICEMO CONTENT INSIDE MOBILE DRAWER

PRVO CEMO DA NAPRAVIMO CONTENT, KOJI CE UKLJUCIVATI I NEKE IKONICE

PA ONDA DA DA SPRED-UJEMO SAV TAJ DATA INSIDE MOBILE DRAWER

ALI KORISTICEMO PAKET KOJI SE ZOVE [`"react-custom-scrollbars"`](https://www.npmjs.com/package/react-custom-scrollbars)

- `touch client/components/premium/header/MobileDrawer.tsx`

```tsx

```



***
***
***
***
***

PODSETNIK:

`client/__premium/comps/link.js`

LOGO TREBA DA BUDE WRAPPED U LINK
