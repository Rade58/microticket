/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { Box, jsx, ThemeStyles } from "theme-ui";
import { FunctionComponent, Fragment, ReactElement } from "react";
// UVOZIM KOMPONENTU
import RcDrawer from "rc-drawer";
//

// DA PRVO TYPE-UJEMO PROPSE, KOJI MOGU DOCI U KOMPONENTI

interface DrawerPropsI {
  className: string;
  closeButton: ReactElement;
  toggleHandler: () => void;
  open: boolean;
  width: string | number;
  placement: "left" | "top" | "right" | "bottom";
  drawerStyle: ThemeStyles;
  closeBtnStyle: ThemeStyles;
  handler: boolean | ReactElement;
}

const Drawer: FunctionComponent<DrawerPropsI> = ({
  children,
  open,
  className,
  width,
  placement,
  closeButton,
  toggleHandler,
  closeBtnStyle,
  drawerStyle,
  handler,
  ...props
}) => {
  // DAKLE SVE STO SE STAVI INSIDE DRAWER JESTE
  // ONO STO CE TAMO BITI NESTED, JESTE ONO STO CE BITI MENU DRAWER-A

  return (
    <Fragment>
      <RcDrawer
        open={open}
        onClose={toggleHandler}
        className={`drawer ${className || ""}`.trim()}
        width={width}
        placement={placement}
        handler={false}
        level={null}
        duration="0.4s"
        {...props}
      >
        {closeButton && (
          <Box as="div" onClick={toggleHandler} sx={closeBtnStyle}>
            {closeButton}
          </Box>
        )}
        <Box sx={drawerStyle}>{children}</Box>
      </RcDrawer>
      <Box
        className="drawer__handler"
        style={{ display: "inline-block" }}
        onClick={toggleHandler}
      >
        {handler}
      </Box>
    </Fragment>
  );
};

export default Drawer;
