/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useCallback } from "react";

// OVO OVDE VISE NIJE POTREBNO
// import axios from "axios";

// UVOZIM CUSTOM HOOK
import useRequest from "../../hooks/useRequest";

const SignupPage: FunctionComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // KORISTIM GA
  const {
    userData,
    data,
    errors,
    makeRequest,
    hasErrors,
  } = useRequest("/api/users/signup", "post", { email, password });

  // ON ZAMENJUJE SVE OVO STO SAM COMMENT-OVAO OUT

  /* const [errors, setErrors] = useState<{ message: string; field?: string }[]>(
    []
  ); */

  /* const sendRequest = useCallback(async () => {
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

      // OVDE SE MOGU CLEAR-OVATI ERRORS
      setErrors([]);
      //

      const data = response.data;

      setEmail("");
      setPassword("");
    } catch (err) {
      setErrors(err.response.data.errors);
    }
  }, [email, password, setEmail, setPassword, setErrors]);
  */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        // PRAVIM REQUEST
        makeRequest().then(() => {
          // OVDE JE LOGIKA MALO ZAGULJNA ALI SHVATICES
          // KAD SE MALO ZAGLEDAS ZASTO BAS OVAKAV USLOV
          // IZGLEDA TI OBRNUTO ALI NECE BITI VERUJ MI
          if (hasErrors) {
            setEmail("");
            setPassword("");
          }
        });
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
      {/* OVO CE SE RENDER-OVATI AKO JE hasErrors USTVARI true */}
      {hasErrors && (
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {errors.map(({ message, field }) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )}
      {/* ---------------------------------------------------- */}
      <button className="btn btn-primary" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default SignupPage;
