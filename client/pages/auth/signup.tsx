/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";
import axios from "axios";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const sendRequest = useCallback(async () => {
    // OVDE STAVLJAM TRY CATCH BLOK
    // --------------------------------------------
    try {
      const response = await axios.post(
        "/api/users/signup",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      console.log({ data });

      setEmail("");
      setPassword("");
    } catch (err) {
      console.log({ err });
    }
    // --------------------------------------------
  }, [email, password, setEmail, setPassword]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        sendRequest();
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
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;
