/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  console.log({ props });

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie } = headers;

  console.log({ cookie });

  /* const response = await axios.get(
    "https://34.89.40.241/api/users/current-user",
    {
      headers: {
        cookie,
      },
    }
  );

  console.log({ data: response.data });
 */
  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;
