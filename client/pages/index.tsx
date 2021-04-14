/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// import axios from "axios";
import { buildApiClient } from "../utils/buildApiClient";

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
  useEffect(() => {
    // EVO OVDE SE PRAVI DAKLE NOVI axios ALI SA PREDEFINITIONSIMA
    // KOJE SAM DEFINISAO
    const apiClient = buildApiClient();

    // REQUEST SE ISTO SALJE KAO I KOD axios
    apiClient.get("/api/users/current-user").then((response) => {
      // NAMERNO STMPAM DATA KAKO BI VIDO DA LI CE SE
      // POKLAPATI SA ONIM PODACIMA KOJE CU ISTO STMAPATI NA SERVERU
      console.log("FRONTEND");
      console.log(response.data);
    });
  }, []);
  // --------------------------------------------------

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
    // I OVDE TO RADIM ISTO, PRAVIM NOVOG API CLIENT-A
    const apiClient = buildApiClient();

    // EVO PRAVIM REQUEST
    // I OPET TI NAPOMINJEM DA OVDE NE MORAS DEFINISATI BASE URL
    // JER TO SI VEC URADIO U FUNKCIJI KOJU SI KREIRAO KOJA IZBACUJE
    // PREDEFINED axios CLIENT
    const response = await apiClient.get("/api/users/current-user", {
      headers: {
        // NARAVNO I DALJE TI MOZES U SKLADU SA axios-OVIM API-OM
        // DA PROSLEDJUJES ONO STO ZELIS
        Host: host,
        Cookie: cookie,
      },
    });

    // I OVO NAMERNO STMAPAM DA VIDIM DA LI CE SE DATA STVARNO UZETI
    console.log("BACKEND");
    console.log(response.data);

    // ----------------------------------

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
