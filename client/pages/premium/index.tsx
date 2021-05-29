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
