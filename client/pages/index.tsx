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
  placeholder?: string;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  console.log(props.placeholder);

  useEffect(() => {
    // OVDE NIS NE MENJAMO, OSTAVLJAMO, KAKVO JE BILO I RANIJE
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

/* export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {

  try {

    const apiClient = buildApiClient(ctx);

    const response = await apiClient.get(
      "/api/users/current-user"
    );

    console.log("BACKEND");
    console.log(response.data);
    // ----------------------------------------------------------

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
}; */

export default IndexPage;
