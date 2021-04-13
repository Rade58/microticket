/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface PropsI {
  placeholder: boolean;
  data?: any;
  error?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  const { data, error } = props;

  console.log({ data, error });

  // eslint-disable-next-line
  return <div>🦉</div>;
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const { headers } = ctx.req;

  const { cookie, host } = headers;

  console.log({ cookie, host });

  // DODAJEM try catch BLOK

  try {
    const response = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/current-user",
      {
        headers: {
          // EVO DODACU OVDE I host HEADER
          Host: "microticket.com",
          //
          Cookie: cookie,
        },
      }
    );

    console.log({ data: response.data });

    return {
      props: {
        placeholder: true,
        data: response.data as any,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        placeholder: true,
        error: err as any,
      },
    };
  }

  /* return {
    props: {
      placeholder: true,
    },
  }; */
};

export default IndexPage;
