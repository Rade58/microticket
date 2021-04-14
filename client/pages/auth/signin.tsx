/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState } from "react";
import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    // userData,
    // data,
    // hasErrors,
    ErrorMessages,
    errors,
    makeRequest,
    // PROMENIO SAM URL NA /signin
  } = useRequest("/api/users/signin", "post", { email, password }, "/");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const ob = await makeRequest();

        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");
        }
      }}
    >
      <h1>Sign In</h1>
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
      <ErrorMessages errors={errors} />
      <button className="btn btn-primary" type="submit">
        Sign In
      </button>
    </form>
  );
};

export default SignupPage;
