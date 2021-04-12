/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";

import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    // userData,
    // data,
    // MOZES SADA KORISTITI I KOMPONENTU
    ErrorMessages,
    //
    errors,
    makeRequest,
    hasErrors,
  } = useRequest("/api/users/signup", "post", { email, password });

  return (
    <form
      onSubmit={async (e) => {
        // MISLIM DA JE BOLJE DA OVO BUDE async FUNKCIJA

        e.preventDefault();

        const ob = await makeRequest();

        // OVO JE NAKAKO BOLJE RESENJE (LEPSA JE LOGIKA)
        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");
        }
      }}
    >
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="email-signup">Email Address: </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          id="email-signup"
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password-signup">Password: </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password-signup"
          type="password"
          className="form-control"
        />
      </div>
      {/* UMESTO OVOGA */}
      {/* {hasErrors && (
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {errors.map(({ message, field }) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )} */}
      {/* KORISTIM SAMO OVO */}
      <ErrorMessages errors={errors} />
      {/* ---------------------------------------------------- */}
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;
