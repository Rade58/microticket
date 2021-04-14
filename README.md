# CREATING `/auth/signin` PAGE

**DA ZAISTA ZA OVO MI NIJE TREBALA SEPARATE PAGE, VEC SAM TO MOGO DEFINISATI U SKLOPU SIGNUP PAGE, SAMO CONDITINAL RENDERINGOM, ALI REACT MI NIJE U FOCUSU, TAK ODA UBRZAM STVARI SAMO CU KREIRATI SIGNIN PAGE**

- `touch client/pages/auth/signin.tsx`

U SUSTINI PREKOPIRAO SAM CODE `client/pages/auth/signup.tsx` I IZVRSIO SAMO IZMENE

```tsx
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
```

MOZES DA TESTIRAS

NAPRAVI PRVO USER-A NA SIGNUP PAGE

NAKON STO TO URADIS MOZES DA UKLONIS COOKIE, MANELNO, ILI PRAVLJENJEM REQUESTA, NA PRIMER IZ INSOMNIA-E PREMA /api/iuser/signout

ONDA POSETI TVOJ NOVI `/auth/sigin` PAGE I UKUCAJ MATCING EMAIL I PASSWORD DA VIDIS DA LI CES SE PUSPESNO PRIJAVITI

**FUNKKCIONISALO JE**
