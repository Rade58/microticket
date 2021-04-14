/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

// DA DEFINISEM BOLJI TYPESCRIPT SUPPORT
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

  // console.log({ data, errors });

  // OVO SAM DODAO, CISTO DA PRIKAZEM ERRORS
  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    // NAMERNO SAM OVDE ZA ZA SADA DEFINISAO DA SE OVAKO
    // POKAZE DA LI JE USER SIGNED IN ILI NIJE
    return <div>You are {!currentUser ? "not" : ""} signed in.</div>;
  }

  return null;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  console.log({ cookie, host });

  try {
    const response = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      {
        headers: {
          // NE MORAS OVO DA HARDCODE-UJES
          // Host: "microticket.com",
          // MOZE I OVAKO
          Host: host,
          //
          Cookie: cookie ? cookie : "",
        },
      }
    );

    // console.log({ data: response.data });

    return {
      props: {
        data: response.data as { currentUser: currentUserType },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        // SLACU I OVO
        errors: err.message as any,
      },
    };
  }
};

export default IndexPage;
