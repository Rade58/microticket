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
