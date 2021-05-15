# SANITIZING `price` INPUT, ON `client/pages/tickets/new.tsx` PAGE

PRVO CEMO DAKLE DA KORISTIMO `useState` DA BI MOGLI DA IMAMO STATE ZA CONTROLE FORMULARA

**TAKODJE CU DA OBEZBEDIM I `onSubmit` ,A KASNIJE CEMO DA GOVORIMO O SANITIZINGU**

- `code client/pages/tickets/new.tsx`

JA CU OVDE BITI MALO SLOBODNIJI, ALI ONO STA PLANIRAM JESTE DA NAPRAVIM NOVI HOOK ZA REQUESTS (A TO CU URADITI KASNIJE)

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM useState I useCallback
import { FunctionComponent, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
//
import { buildApiClient } from "../../utils/buildApiClient";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  // ZA KREIRANJE TICKETA TI NE TREBA I userId
  const { currentUser } = props;
  // ZATO STO JE CURRENT USER DEO COOKIE-A

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const createTicket = useCallback(async () => {
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
  }, [title, price]);

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          createTicket();
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
            value={price}
            className="form-control"
            type="number"
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

OVO CE GORE FUNKCIONISATI

# MEDJUTIM MOZE SE DESITI PROBLEM DA KORISNIK UNESE, NEKAKV BROJ KOJI NE BI BIO U VALIDNOM FORMATU, STO SE TICE VALUTE; TADA BI MI TREBAL IDA SANITIZE-UJEMO TAJ UNOS

***

digresija:

BEZ OBZIRA KOJEG JE TIPA input FIELD, ON CE TI UVEK PROIZVODITI VREDNOSTI KOJE SU STRINGOVI

***

NAIME POSTO KORITIM INPUT KOJI "number" TIPA TO ZNACI DA KADA KORISNIK POKUSA DA UNESE KARAKTERE, DA SE ONI NECE UNOSITI; ALI POSTO AUTOR WORKSHOPA TO NIJE URADIO ,ON KORISTI TYPE "text", ON JE ZELEO DA PARSE-UJE VREDNOST

**USTVARI ON JE ZELEO DA POKAZE HANDLE-OVANJE `NaN`-A**

JER `parseFloat("8")` JESTE `8`

A `parseFloat("8nesto")` JESTE `8`

ALI `parseFloat("nesto8")` JESTE `NaN`

DA SE SADA VRATIM NA TEMU

NAPRAVICU FUNKCIJU, KOJA CE SANITIZE-OVATI price STATE, ONDA KADA SE BLUR-UJE

***

digresija:

BLUR SE DESI I KADA SA INPUT FIELD-A, PREDJES NA NEKI DRUGI FIELD; ILI PRITISNES NEKI BUTTON PORED; **DAKLE I TADA SE DESAVA BLUR ZA TAJ INPUT FIELD**

***

- `code client/pages/tickets/new.tsx`


