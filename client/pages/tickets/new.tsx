/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// UVOZIM ONAJ INTERFACE KOJI DESCRIBE-UJE INITIAL PROPS
import { InitialPropsI } from "../../types/initial-props";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //

  console.log(props);

  return (
    <div>
      <pre>{JSON.stringify({ props }, null, 2)}</pre>
    </div>
  );
};

export default IndexPage;
