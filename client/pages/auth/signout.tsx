/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import useRequest from "../../hooks/useRequest";

const SignOutPage: FunctionComponent = () => {
  // VEC OVDE SAM JA DEFINISAO KAKAV SE REQUEST MOZE OBAVITI
  const { makeRequest } = useRequest(
    "/api/users/signout",
    "get",
    {},
    // OVO OVDE ZNACI DA SAM PLANIRAO DA SE PROGRAMMATICAL
    // NAVIGATION OBAVI PREMA MAIN PAGE-U
    "/"
  );

  useEffect(() => {
    // PRAVIM REQUEST
    makeRequest();
  }, [makeRequest]);

  return <div>Signing you out...</div>;
};

export default SignOutPage;
