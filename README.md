# SKAFFOLDING LAYOUT; AND HOOKING UP LAYOUT 

- `mkdir -p client/components/premium`

PRAVIM KOPMONENTU, CIJA CE ULOGA BITI DA HOLD-UJE `Heder` I ZATIM `Footer` KOMPONENTU (NARAVNO, JOS NEMAM OVE KOMPONENTE ,NAPRAVICU IH KASNIJE)

- `touch client/components/premium/Layout.tsx`

**MEDJUTIM VAZNA STVAR JE DA CE `children` BITI NESTED INSIDE `main`**

```tsx
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

```

**REKAO SAM DA CU U GORNJI JSX DA DIREKTNO NEST-UJEM STVARI, POPUT HEADER MAIN I FOOTER SEKCIJA**

ALI CU ONO STO CE PRIPADATI main TAGU, NEST-OVATI, PRILIKOM PRAVLJANJA REACT ELEMENATA OD GORNJE KOMPONENTE 

# DA HOOK-UJEMO OVAJ `Layout` ;A TO USTVARI RADIMO U PAGE-U

- `code client/pages/premium/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import { ThemeProvider } from "theme-ui";
import theme from "../../theme";
// EVO JE KOMPONENTA
import Layout from "../../components/premium/Layout";
//

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      {/* STAVLJAMO LAYOUT OVDE */}
      {/* ALI REKI SMO DA CE main DOBIJATI children KROZ LAYOUT */}
      <Layout>
        {/*  */}
        {/* OVDE STAVLJAM ONO STO CE BITI NESTED U main TAG */}
        {/*  */}
      </Layout>
    </ThemeProvider>
  );
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;

```


