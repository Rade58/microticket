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
      placement="left"
      open={isDrawerOppened}
      toggleHandler={() => setIsDrwerOpened((prev) => !prev)}
      width="320px"
      handler={
        <Box sx={styles.handler}>
          <IoMdMenu size="26px" />
        </Box>
      }
      closeButton={<IoMdClose size="24px  " color="#000000" />}
      drawerStyle={styles.drawer}
      closeBtnStyle={styles.close}
    ></Drawer>
  );
};

export default MobileDrawer;
