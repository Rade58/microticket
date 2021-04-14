/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface CurrentUserI {
  id: string;
  email: string;
  iat: number;
}

type currentUserType = CurrentUserI | null;

interface PropsI {
  data?: { currentUser: currentUserType };
  errors?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  const { data, errors } = props;

  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    return <div>You are {!currentUser ? "not" : ""} signed in.</div>;
  }

  return null;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  try {
    const response = await axios.get(
      // MISLIM NA OVAJ URL, POGLEDAJ KOLIKI JE
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      {
        headers: {
          Host: host,
          Cookie: cookie ? cookie : "",
        },
      }
    );

    return {
      props: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        errors: err.message as any,
      },
    };
  }
};

export default IndexPage;
