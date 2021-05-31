/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Box, ThemeUIStyleObject, ThemeStyles } from "theme-ui";
import { FunctionComponent, useState } from "react";
import { IoMdClose, IoMdMenu } from "react-icons/io";
// EVO IH SOCIAL ICONS
import {
  FaFacebookF,
  FaTwitter,
  FaGithubAlt,
  FaDribbble,
} from "react-icons/fa";
// UVESCU I OVO
import Scrollbars from "react-custom-scrollbars";
//
import Drawer from "../Drawer";

// EVO GA TAJ CONTENT
const mobileDrawerData = [
  {
    path: "/",
    icon: <FaFacebookF />,
  },
  {
    path: "/",
    icon: <FaTwitter />,
  },
  {
    path: "/",
    icon: <FaGithubAlt />,
  },
  {
    path: "/",
    icon: <FaDribbble />,
  },
];

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
    >
      {/* DODAJEMO SCROLLBARS */}
      <Scrollbars autoHide>
        <Box sx={styles.content}>
          <Box sx={styles.menu}>
            {/* SPREAD-UJEMO CONTENT OVDE  */}
            {mobileDrawerData.map(({ icon, path }, i) => {
              // OVDE CU KASIJE DEFINISATI LINK
              // ZA SADA CU SAMO DA PRIKAZEM TEXT
              // i icon
              return (
                <Box as="span" key={i}>
                  {icon} {path}
                </Box>
              );
            })}
          </Box>
          <Box sx={styles.menuFooter}></Box>
        </Box>
      </Scrollbars>
    </Drawer>
  );
};

export default MobileDrawer;
