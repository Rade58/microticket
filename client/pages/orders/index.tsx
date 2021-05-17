/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
import { buildApiClient } from "../../utils/buildApiClient";

interface PropsI extends InitialPropsI {
  placeholder: boolean;
}

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  const orders = await client.get("/api/orders");

  console.log({ orders: orders.data });

  return {
    props: {
      placeholder: true,
    },
  };
};

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //

  console.log(props);

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export default IndexPage;
