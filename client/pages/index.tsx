/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
import { buildApiClient } from "../utils/buildApiClient";

// U CILJU DA LAKSE SHVATIS POGLEDAJ PRVO `getServerSideProps`
// KOJI SAM STAVIO ISPOD
// ZASTO NJEGA DA GLEDAS PRVOG?
// PA LOGICNO, ZATO STO SE ON PRVI IZVRSAVA, PRE PAGE-A
// A ZELIM DA TI TAMO OBJASNIM NESTO

interface CurrentUserI {
  id: string;
  email: string;
  iat: number;
}

export type currentUserType = CurrentUserI | null;

interface PropsI {
  data?: { currentUser: currentUserType };
  errors?: any;
  foo?: string;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // ZASTO STMAPAM PROPSE
  // PA ZELI MDA TI POKAZEM DA JE U NJIMA I ONO STO SALJES IZ getInitialProps
  // A I ONO STO SALJEM IZ getServerSideProps
  console.log(props);

  useEffect(() => {
    const apiClient = buildApiClient();

    apiClient.get("/api/users/current-user").then((response) => {
      console.log("FRONTEND");
      console.log(response.data);
    });
  }, []);

  const { data, errors } = props;

  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (data) {
    const { currentUser } = data;

    return <h1>You are {!currentUser ? "not" : ""} signed in.</h1>;
  }

  return null;
};

// EVO OVDE IMAS getServerSideProps

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // ISTO KAO I  U getInitialProps TI IMAS OVDE
  // PRISTUP req I res

  // BEZVEZE SAM SAMO UZEO HEADERS
  const headers = ctx.req.headers;

  // I STMAPAM IH
  console.log({ FROM_GET_SERVER_SIDE_PROPS_INDEX_PAGE: headers });

  return {
    props: {
      // KAO STO VIDIS NE SALJEM NISTA SMISLENO
      // SAMO ZELIM DA VIDIM DA LI CE SE NACI MEDJU PROPISMA
      // NA FRONTEND-U
      foo: "bar",
    },
  };
};

export default IndexPage;
