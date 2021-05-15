# SKAFFOLDING FORM FOR CREATING NEW TICKET

SAMO CU SADA KRIRATI PAGE, NA KOJOJ TREBA DA BUDE FORMULAR ZA KREIRANJE TICKET-A

- `mkdir client/pages/tickets`

- `touch client/pages/tickets/new.tsx`
 
```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// UVOZIM ONAJ INTERFACE KOJI DESCRIBE-UJE INITIAL PROPS
import { InitialPropsI } from "../../types/initial-props";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  //

  console.log(props);

  return (
    <div>
      <pre>{JSON.stringify({ props }, null, 2)}</pre>
    </div>
  );
};

export default CreateNewTicketPage;
```

POKRENUCU SKAFFOLD

I SADA IDEM NA <https://microticket.com/tickets/new> DA VIDIM DA LI JE PAGE KREIRAN

I ZAIST PAGE JE SERVED

# SADA CEMO KREIRATI FORM NA STRANICI

- `code client/pages/tickets/new.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM use
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  return (
    <div>
      <h1>Create A Ticket</h1>
      <form>
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input className="form-control" id="title-input" type="text" />
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <input className="form-control" type="number" id="price-input" />
        </div>
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE ,UKLONICU GA NA KRAJU
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

export default CreateNewTicketPage;

```

# FORMULAR ZA SADA IZGLEDA RUZNO JER SE PROTEZE PREKO CELE STRANE, ALI MI MOZEMO WRAPP-OVATI SVE KROZ `_app.tsx` U NEKI ELEMENT, KOJI BI CONTAIN-OVAO FORMUALAR NA NASEM PAGE-U, ALI TO CE BITI APPLIED I NA DRUGE PAGE-OVE

- `code client/pages/_app.tsx`

```tsx
import React from "react";
import App, { AppProps, AppContext } from "next/app";
// import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";
import "bootstrap/dist/css/bootstrap.css";
import Header from "../components/Header";
import { getCurrentUser } from "../utils/getCurrentUser";

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { ctx } = appCtx;
  try {
    const { currentUser } = await getCurrentUser(ctx);
    const appProps = await App.getInitialProps(appCtx);
    appProps.pageProps.initialProps = { currentUser } as {
      currentUser: InitialPropsI["initialProps"]["currentUser"];
    };
    return appProps;
  } catch (err) {
    console.log(err);
    return {
      pageProps: {
        initialProps: {
          errors: err.message as any,
        },
      },
    };
  }
};

//
function MyApp({ Component: PageComponent, pageProps }: AppProps) {
  // EVO VIDIS
  const { currentUser } = pageProps.initialProps;

  return (
    <div>
      <Header currentUser={currentUser} />
      {/* EVO WRAPP-OVAO SAM SVE U OVAJ container div */}
      <div className="container">
        <PageComponent currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;

```

SADA LEPSE IZGLEDA

