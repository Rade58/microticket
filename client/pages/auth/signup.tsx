/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState } from "react";
// OVO VISE NE TREBA OVDE
// import { useRouter } from "next/router";

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
    // DODAJEM OVE DODATNE ARGUMENTE (USTVARI SAMO JEDAN)
  } = useRequest("/api/users/signup", "post", { email, password }, "/");

  // OVO VISEE NIJE POTREBNO
  // const { push: routerPush } = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const ob = await makeRequest();

        if (!ob.hasErrors) {
          setEmail("");
          setPassword("");

          // OVO VISE NIJE POTREBNO
          // routerPush("/");
        }
        // ALI I OVAJ CELA GORNJ USLOVNA IZJAVA IZGLED DA JE BESPOTREBNA ALI CU JE OSTAVITI TU
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
      <ErrorMessages errors={errors} />
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;
