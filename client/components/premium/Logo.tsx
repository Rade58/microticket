/* eslint jsx-a11y/anchor-is-valid: 1 */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Image } from "theme-ui";
import { FunctionComponent } from "react";

interface LogoPropsI {
  src: string;
}

// LOGO CE KASNIJE BITI WRAPPED INSIDE LINK, KOJI CU DEFINISATI
// KASNIJE (A UNDER THE HOOD KORISTICE next/link)
// LINK CE VODITI DO "/premium", ODNOSNO DO PAGE-A
// `client/pages/premium/index.tsx`
const Logo: FunctionComponent<LogoPropsI> = ({ src }) => {
  return <Image src={src} alt="landing page logo" />;
};

export default Logo;
