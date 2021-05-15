# MAKING INDIVIDUAL TICKET PAGE

- `touch client/pages/tickets/[ticketId].tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// TREBA DA SAGRADIM I API CLIENT-A
import { buildApiClient } from "../../utils/buildApiClient";
// UVOZIM ONAJ INTERFACE, KOJI DESCRIBE-IJE DATA, SINGLE
// TICKET DOKUMENTA
import { TicketDataI } from "../../types/data/ticket-data";
//

interface PropsI {
  ticket?: TicketDataI;
}

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  const { params } = ctx;

  const { ticketId } = params;

  // PREMA OVOM TICKET ID-JU KOJI CE BITI OBEZBEDJEN
  // TAKO STO NEKO NAVIGATE-UJE DO   /tickets/:ticketId
  // JA CU MOCI DA FETCH-UJEM DATA SINGLE TICKET-A

  try {
    const { data } = await client.get(`/api/${ticketId}`);

    // AKO POSTOJI TICKET SVE JE U REDU
    // RETURN-UJEM GA

    return {
      props: {
        ticket: data,
      },
    };
  } catch (err) {
    // ALI AKO NEMA TICKETA, PRAVICU REDIRECT NA INDEX PAGE

    ctx.res.writeHead(302, { Location: "/" });

    // ZAVRSAVAM
    ctx.res.end();

    // I NE RETURN-UJEM APSOLUTNO NISTA

    return {
      props: {},
    };
  }
};

const SingleTicketPage: FunctionComponent<PropsI> = (props) => {
  // ZA SADA SAMO OVO DEFINISEM

  return <pre>{JSON.stringify({ ticket: props.ticket })}</pre>;
};

export default SingleTicketPage;

```

## JA ODMAH MOGU DA TESTIRAM NEUSPESAN GETTING TICKET-A

DAKLE MOGU DEFINISATI NEKI RANDOM TICKET ID KADA PRAVIM PATH INSIDE URL KOJI UNOSUIM U BROWSER ADRESS BAR

DAKLE OVAKO NESTO

`https://microticket.com/tickets/<nepostojeeci id>`

I SADA PRITISKAM ENTER

I TREBAO BI BITI REDIRECTED NA MAIN PAGE, ODNOSNO NA `https://microticket.com`

**I ZAIST JESTE TAKO**
