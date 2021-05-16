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
    const { data } = await client.get(`/api/tickets/${ticketId}`);

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

## MOZEMO SADA DA KRIEAMO NEKI TICKET; PA DA PROBAMO DA VISIT-UJEMO `https://microticket.com/tickets/<id ticket-a>`

I ZAISTA KREIRAO SM TICKET (POSTO STMAPAM SVE TICKETS NA MAIN PAG-U, JAS SAM KOPIRAO ID)

FORMIRAO SAM URL, DOADAO MU POMENUTI ID, I ZISTA PAGE SINGLE TICKET-A JESTE SERVED

# SADA CEMO NA INDEX PAGE-U DEFINISATI LINKOVE, KOJI VODE DO INDIVIDUAL TICKET PAGE-A

- `code client/pages/index.tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// UVOZIM NEXT LINK
import Link from "next/link";
//
import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";
import { allTicketsType } from "../types/data/all-tickets";

interface PropsI extends InitialPropsI {
  tickets: allTicketsType;
}

// ---------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
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
  const { tickets } = props;

  // USTVARI DODACU JOS JEDNU KOLONU
  // KOJA CE BITI KOLONA ZA LINK TICKET

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(({ price, title, id }) => {
            return (
              <tr key={id}>
                <td>{title}</td>
                <td>${price.toFixed(2)}</td>
                {/* EVO VIDIS STA SAM URADIO */}
                {/* NE ZNA ZASTO MORA OVAKVA PRAKASA */}
                {/* GDE SE U as PROSLEDJUJE REAL URL
                A DA JE HREF TKAV DA UKAZUJE NA IME PAGE-A
                SA [ticketId] IN IT */}
                <td>
                  <Link href="/tickets/[ticketId]" as={`/tickets/${id}`}>
                    <a>view</a>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IndexPage;
```

SADA NA INDEX PAGE-U IMAS LINKOVE ZA SVAKI LISTED TICKET

I KLIKTAO SAM I UREDNO POSECIVAO PAGE

**U DOKUMENTACIJI NIGDE NISAM VIDEO DA SE KORISTI GORNJI `as` MADA FUNKCIONISE** (ALI VEROVATNO SAM JA KORISTIO NEKI OUTTADED LEGACY NACIN)

ALI NECU NISTA MENJATI, KADA I OVAKO FUNKCIONISE
