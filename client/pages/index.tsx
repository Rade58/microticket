/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

// NAMERNO SAM MALO PROSIRIO TYPE-OVE
interface PropsI {
  placeholder: boolean;
  data?: any;
  errors?: any;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //
  const { data, errors } = props;

  // OVO MI JE BITNO DA STAMPAM OVDE JER ZELIM DA VIDIM DA LI CE
  // DATA STICI DO KOMPONENTE
  console.log({ data, errors });

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
          // EVO DODACU OVDE I host HEADER STO JE NAJVAZNIJE
          Host: "microticket.com",
          // COOKIE CU I DALJE DA SALJEM
          Cookie: cookie ? cookie : "",
        },
      }
    );

    console.log({ data: response.data });

    return {
      props: {
        placeholder: true,
        // NAMERNO PROSLEDJUJEM DATA U KOMPONENTU
        data: response.data as any,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        placeholder: true,
        // SLACU I OVO
        errors: err.message as any,
      },
    };
  }
};

export default IndexPage;
