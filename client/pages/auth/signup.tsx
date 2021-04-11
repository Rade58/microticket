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

      // JASNO JE DA CU OVDE HANDLE-OVATI ERROROUS RESPONSES
      // ONDE RESPONSE-OVE, KOJI NISU SA STATUS CODE-OVIMA
      // KOJI SU U RANGU 200

      // err JE USTVARI Error INSTANCA KOJU JE THROW-OVAO
      // AXIOS U SLUCAJU FAILED REQUEST-A

      // ONE PODATKE O ERRORU, KOJI MOJ MICROSERVICE SALJE SE NALAZE U
      //      err.response.data

      console.log(err.response.data); // OVO JE ONAJ
      //                                {errors: [{message, field}]}
      //                                 OBJEKAT, KOJI SAM JA TAKO FORMATIRAO
      //                                  ZA SVAKI ERROR, KAKO BI BIO CONSISTENT
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
