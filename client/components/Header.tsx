/* eslint jsx-a11y/anchor-is-valid: 1 */
import React, { FunctionComponent, Fragment } from "react";
import Link from "next/link";
import { currentUserType } from "../pages/index";

interface HeaderPropsI {
  currentUser: currentUserType;
}

const Header: FunctionComponent<HeaderPropsI> = ({ currentUser }) => {
  // EVO DEFINISEM OVAKO
  const links = [
    currentUser && { label: "Sign Out", href: "/auth/signout" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
  ]
    // IAKO TO CESTO NE VOLIM DA RADIM, JSX MOZES OVAKO DA SE STORE-UJE
    // U VARIJABLOJ
    .map((item) => {
      if (item && item.label) {
        return (
          <Fragment key={item.label}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <li key={item.label} className="nav-item">
              <Link href={item.href}>
                <a>{item.label}</a>
              </Link>
            </li>
          </Fragment>
        );
      }
    });

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">MicTick</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {/* UMESTO OVOGA*/}
          {/* {currentUser && (
            <li className="nav-item">
              <button>Sign Out</button>
            </li>
          )}
          {!currentUser && (
            <>
              <li className="nav-item">
                <Link href="/auth/signup">
                  <a>Sign Up</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/auth/signin">
                  <a>Sign In</a>
                </Link>
              </li>
            </>
          )} */}
          {/* STAVLJAM OVO */}
          {links}
          {/* ------------------ */}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
