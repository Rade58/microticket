# MAKING INDEX PAGE INTO PAGE WHICH LIST ALL TICKETS

DATA MOGU FETCH-OVATI INSIDE `getServerSideProps`

ALI PRE TOGA DA NAPRAVIM TYPE ZA DATA KOJE RECEIVE-UJE KADA HITT-UJEMO NAS ENDPOINT `"GET"` `/api/tickets`

- `touch client/types/data/all-tickets.ts`

```ts
import { TicketDataI } from "./ticket-data";

export type allTicketsType = TicketDataI[];
```

DA SADA REDEFINISEMO INDEX PAGE

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// OVO CE MI TREBATI JER CU DATA UZETI SERVER SIDE
import { buildApiClient } from "../utils/buildApiClient";
//
import { InitialPropsI } from "../types/initial-props";
// UVESCU I TYPE, KOJI SAM MALOCAS NAPRAVIO
import { allTicketsType } from "../types/data/all-tickets";

// SADA MOGU TYPE-OVATI DA CU ALL TICKETS PROSLEDITI KAO PROP
interface PropsI extends InitialPropsI {
  tickets: allTicketsType;
}

// ---------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // BUILD-UJEMO CLIENT-A
  const client = buildApiClient(ctx);

  try {
    const { data } = await client.get("/api/tickets");

    return {
      props: {
        tickets: data as allTicketsType,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        tickets: [],
      },
    };
  }
};
// ---------------------------------------------------

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // SADA BI MEDJU PROPSIMA TREBAL IDA SE NADJU ALL TICKETS

  return <pre>{JSON.stringify({ tickets: props.tickets }, null, 2)}</pre>;
};

export default IndexPage;

```

SKAFFOLD MI JE VEC BIO UPALJEN, A RANIJE SAM KREIRAO PAR TICKETS (TAK ODA SU SVE PROMENE BILE SYNCED, A NISAM REBUILD-OVAO CLUSTER, CIME BI BILE UNISTENE I REKREIRANE BAZE PODATAKA)

SADA CU DA IDEM NA INDEX PAGE, PA DA VIDIM DA LI CE TICKETS BITI RENDERED

UNEO OVO U ADRESS BAR

<https://microticket.com>

PRITISNUO ENTER

I USPESNO MI JE PRIKAZAN LISTA TICKETS-A

NECEMO ODMAH DODAVATI KOMPONENTE U PAGE, JER CEMO DA URADIMO NESTO U POGLEDU REDIRECTING-A

# SADA CEMO DEFINISATI DA SE NAKON CREATING-A TICKETA, USTVARI DESI REDIRECT DO INDEX PAGE-A

- `code client/pages/tickets/new.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM useState I useCallback
import { FunctionComponent, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
import { TicketDataI } from "../../types/data/ticket-data";
import useRequest from "../../hooks/useRequestHook";

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  // const { currentUser } = props;

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("0.00");

  // NE TREBAM NISTA POSEBNO RADITI, JER SAM DEFINISAO
  // DA SE REDIRECTING MOZE DESITI KADA PROVIDE-UJEM
  // REDIRECT PATH, ODNOSNO URL
  const {
    makeRequest: makeRequestToCreateTicket,
    // data,
    ErrorMessagesComponent,
    errors,
  } = useRequest<{ title: string; price: number }, TicketDataI>(
    "/api/tickets",
    {
      method: "post",
      // EVO OVDE PODESAVAM TAJ URL
      redirectSuccessUrl: "/",
    }
  );

  const sanitizePriceOnBlur = useCallback(() => {
    const priceValue = parseFloat(price);
    const fixedDecimals = priceValue.toFixed(2);

    if (!isNaN(priceValue)) {
      setPrice(fixedDecimals);
      return;
    }

    setPrice("0.00");
    return;
  }, [price]);

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const priceNumber = parseFloat(price);

          makeRequestToCreateTicket({
            price: priceNumber,
            title,
          })
            // OVDE MOGU RESETOVATI
            .then(() => {
              setPrice("0.00");
              setTitle("");
            });
        }}
      >
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="form-control"
            id="title-input"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            onBlur={sanitizePriceOnBlur}
            value={price}
            className="form-control"
            type="text"
            id="price-input"
          />
        </div>
        <ErrorMessagesComponent errors={errors} />
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

// (OD RANIJE)
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

IDI SAD NA <https://microticket.com/tickets/new>, I PROBAJ DA NAPRAVIS TICKET

KAD USPESNO NAPRAVIS TICKET, TO BI TREBAL ODA TE REDIRECT-UJE NA <https://microticket.com>

I OVO JE BILO USPESNO
