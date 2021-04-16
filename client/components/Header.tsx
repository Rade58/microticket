/* eslint jsx-a11y/anchor-is-valid: 1 */
import React, { FunctionComponent } from "react";
import Link from "next/link";
import { currentUserType } from "../pages/index";

interface HeaderPropsI {
  currentUser: currentUserType;
}

const Header: FunctionComponent<HeaderPropsI> = ({ currentUser }) => {
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">MicTick</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {/* EVO KORISTIM && */}
          {!currentUser && (
              <li className="nav-item">
                <button>Sign Out</button>
              </li>
            ) && (
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
            )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
