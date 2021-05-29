# HOOKING UP THEME (`theme-ui` THEME)

THEME CE BITI PROVIDED ZA PAGE `client/pages/premium/index.tsx`

- `code client/pages/premium/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// THEME PROVIDER
import { ThemeProvider } from "theme-ui";
// TEMA
import theme from "../../theme";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // STAVLJAMO THEME PROVIDER-A
  return (
    <ThemeProvider theme={theme}>
      <div>premium page</div>;
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

