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
