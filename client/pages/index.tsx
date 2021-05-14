/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";

// EVO EXTEND-UJEM OVAJ INTERFACE, KOJI TYPE-UJE
// PROPSE INDIVIDUAL PAGE-A
interface PropsI extends InitialPropsI {
  foo: string;
}

// ---------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: "bar",
    },
  };
};
// ---------------------------------------------------

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // STAMPACU PROPSE
  console.log(props);

  useEffect(() => {
    const apiClient = buildApiClient();

    apiClient.get("/api/users/current-user").then((response) => {
      console.log(response.data);
    });
  }, []);

  // OVDE SADA MOGU RESTRUKTURIRATI NESTO DRUGO
  const { initialProps, foo } = props;

  const { currentUser, errors } = initialProps;

  if (errors) {
    return <pre>{JSON.stringify(errors, null, 2)}</pre>;
  }

  if (currentUser) {
    return <h1>You are {!currentUser ? "not" : ""} signed in.</h1>;
  }

  return null;
};

export default IndexPage;
