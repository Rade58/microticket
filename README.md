# HEADER LINKS

- `code client/components/Header.tsx`

```tsx
/* eslint jsx-a11y/anchor-is-valid: 1 */
import React, { FunctionComponent, Fragment } from "react";
import Link from "next/link";
import { CurrentUserI } from "../types/current-user";

interface HeaderPropsI {
  currentUser: CurrentUserI;
}

const Header: FunctionComponent<HeaderPropsI> = ({ currentUser }) => {
  const links = [
    // DODAJEM I OVO
    currentUser && { label: "Sell Tickets", href: "/tickets/new" },
    // OVO CE BITI PAGE, KOJI CU DODATI, A N KOJEM CU PRIKAZATI SVE
    // ORDERS KOJE JE USER NAPRAVIO
    currentUser && { label: "My Orders", href: "/orders" },
    // NAPRAVICU GORNJI PAGE U SLEDECEM BRANCH-U
    currentUser && { label: "Sign Out", href: "/auth/signout" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
  ].map((item) => {
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
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

export default Header;
```
