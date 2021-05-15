# SADA ZELIM DA UPOTPUNIM CODE `client/pages/tickets/new.tsx` KAKO BI DEFINISAO SLANJE REQUESTA ZA KREIRANJE NOVOG TICKETA

JA SAM VEC NESTO RADIO, MEDJUTIM NISAM KORISTIO `useRequestHook`, KOJI SAM NAPRAVIO U PROSLOM BRANCH-U

SADA CU MALO REFAKTORISATI CODE, KAKO BI KORISTIO, TAJ HOOK

ALI BOLJE DA PRE TOGA NAPRAVIM INTERFACE ZA DATA, KOJI MOZES OBTAIN-OVATI PRAVLJANJEM REQUEST-A

ZNAMO KOJI JE DATA, JER SMO MI PRAVILI I API ENDPOINTS; ODNOSNO PRAVILI SMO SVE ROUTES U NASIM MICROSERVICE-OVIMA

- `mkdir client/types/data`

- `touch client/types/data/ticket-data.ts`

```ts
export interface TicketDataI {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;
}
```
**SADA MOGU D ASE POSVETIM PRAVLJANJU REQUEST, KORISCENJEM MOG CUSTOM HOOK-A**

- `code client/pages/tickets/new.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM useState I useCallback
import { FunctionComponent, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
// OVO NAM NE TREBA
// import { buildApiClient } from "../../utils/buildApiClient";
// UVOZIM INTERFACE ZA DATA
import { TicketDataI } from "../../types/data/ticket-data";
// UVOZIM I MOJ CUSTOM HOOK ZA REQUESTS
import useRequest from "../../hooks/useRequestHook";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  // const { currentUser } = props;

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("0.00");

  // EVO OVDE KORISTIM HOOK

  const { makeRequest: makeRequestToCreateTicket, data } = useRequest<
    { title: string; price: number },
    TicketDataI
  >("/api/tickets", { method: "post" });
  // ---------------------------------------------------------------------

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

  // OVO NECU KORISTITI
  /* const createTicket = useCallback(async () => {
    const client = buildApiClient();

    try {
      const response = await client.post("/tickets/new", {
        title,
        price,
      });

      console.log(response.data);

      return response.data;
    } catch (err) {
      console.error(err);

      return err;
    }
  }, [title, price]); */

  // DATU TI STMAPAM, JER KADA SE USPESNO NAPRAVI REQUEST, TREBALO BI
  // data BI TREBALO DA BUDE DEFINED
  console.log({ data });

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          // PRICE MORA DA BUDE NUMBER, JER MI OCEKUJEMO NUMBER U HANDLERU
          const priceNumber = parseFloat(price);
          //
          // PRAVIM REQUEST; I KAO STO VIDIS OVDE PROSLEDJUJEM BODY
          makeRequestToCreateTicket({
            price: priceNumber,
            title,
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
            // EVO DODAJEM JE OVDE
            onBlur={sanitizePriceOnBlur}
            //
            value={price}
            className="form-control"
            // NAMERNO SAM STAVIO DA JE TEXT, DA BI SE
            // PRIKAZIVALO .00 ON BLUR
            type="text"
            id="price-input"
          />
        </div>
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

- `skaffold dev`

SADA BI TREBALO DA MOZES DA USPESNO KREIRAS TICKET

PROBACU TO

I ZAISTA MI JE USPELO

STAMPAO SAM DATA I USPESNO SAM MOGAO DA UZMEME ID NOVOKREIRANOG TICKETA IZMEDJU OSTALIH PODATKA

ZATO SAM STAVIO OVO U ADRESS BAR BROWSER-A

<https://microticket.com/api/tickets/609ffd7d2781ce00230cf53c>

PRITISNUO SAM ENTER CIME SAM NAPRAVIO GET REQUEST, MOGAO SAM VIDETI DATA (JOS JEDNA POTVRDA DA JE TICKET STVARNO NAPRAVLJEN)

# MOZES DA RENDER-UJES I ONU KOMPONENTU, KOJA PRIKAZUJE ERROR MESSAGES AKO IH IMA

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

  // RESTRUKTURIRAM I ERROR MESSAGE KOMPONENTU, TAKODJE I errors
  const {
    makeRequest: makeRequestToCreateTicket,
    data,
    ErrorMessagesComponent,
    errors,
  } = useRequest<{ title: string; price: number }, TicketDataI>(
    "/api/tickets",
    { method: "post" }
  );
  // ---------------------------------------------------------------------

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

  console.log({ data });
  console.log({ errors });

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
        {/* EVO OVDE STAVLJAM ERROR MESSAGES */}
        <ErrorMessagesComponent errors={errors} />
        {/* -------------------------------- */}
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
