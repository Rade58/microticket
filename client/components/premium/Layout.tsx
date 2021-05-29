/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import { FunctionComponent, Fragment } from "react";

const Layout: FunctionComponent = ({ children }) => {
  return (
    <Fragment>
      {/* OVDE CE ICI Header */}

      <main>{children}</main>
      {/* OVDE CE ICI Footer */}
    </Fragment>
  );
};

export default Layout;
