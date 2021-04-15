/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
import { buildApiClient } from "../utils/buildApiClient";

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
  useEffect(() => {
    const apiClient = buildApiClient();

    apiClient.get("/api/users/current-user").then((response) => {
      console.log("FRONTEND");
      console.log(response.data);
    });
  }, []);
  // ----------------------------------------------------------

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

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // EVO ODAVDE SAMO RETURN-UJEM NESTO BEZVEZE
  return {
    props: {
      foo: "bar",
    },
  };
};

export default IndexPage;
