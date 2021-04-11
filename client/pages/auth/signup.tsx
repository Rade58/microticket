/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const SignupPage: FunctionComponent = () => {
  return (
    <form>
      <h1>Sign Up</h1>
      <label htmlFor="email-signup">Email Address: </label>
      <input id="email-signup" type="email" />
      <br />
      <label htmlFor="password-signup">Password: </label>
      <input id="password-signup" type="password" />
    </form>
  );
};

export default SignupPage;
