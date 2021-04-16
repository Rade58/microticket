/* eslint jsx-a11y/anchor-is-valid: 1 */
import React, { FunctionComponent } from "react";

// UVEZAO SAM I NEXT LINK
import Link from "next/link";

// DAKLE OVOJ KOMPONENTI CE SE KAO PROP DODAVATI currentUser
import { currentUserType } from "../pages/index";

interface HeaderPropsI {
  currentUser: currentUserType;
}

const Header: FunctionComponent<HeaderPropsI> = ({ currentUser }) => {
  // AKO JE currentUser PRIUTAN TREBALO BI DA POKAZES SIGNOUT BUTTON
  // AKO JE currentUser, USTVARI null, ONDA POKAZUJES Sign In I Sign Up LINKOVE

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">MicTick</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {currentUser !== null ? (
            <li>
              <button>Sign Out</button>
            </li>
          ) : (
            <>
              <li>
                <Link href="/auth/signup">
                  <a>Sign Up</a>
                </Link>
              </li>
              <li>
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
