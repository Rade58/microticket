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
