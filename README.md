# ADDING A SIGNUP FORM

KREIRAM `/auth/signup` PAGE

- `mkddir client/pages/auth`

- `touch client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const SignupPage: FunctionComponent = () => {
  return (
    <form>
      <h1>Sign Up</h1>
    </form>
  );
};

export default SignupPage;
```

AKO TI JE UGASEN SKAFFOLD POKRENI GA `skaffold dev`

SADA MOZES DA POSETIS I PAGE `microticket.com/auth/signup`

## SADA NASTAVLJAM SA DEFINISANJEM FORMULARA

- `code client/pages/auth/signup.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";

const SignupPage: FunctionComponent = () => {
  return (
    <form>
      <h1>Sign Up</h1>
      <label htmlFor="email-signup">Email Address: </label>
      <input id="email-signup" type="email" className="form-control" />
      <label htmlFor="password-signup">Password: </label>
      <input id="password-signup" type="password" className="form-control" />
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default SignupPage;
```
