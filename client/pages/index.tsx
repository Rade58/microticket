/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// UVOZIM NEXT LINK
import Link from "next/link";

import { buildApiClient } from "../utils/buildApiClient";
import { InitialPropsI } from "../types/initial-props";
import { allTicketsType } from "../types/data/all-tickets";

interface PropsI extends InitialPropsI {
  tickets: allTicketsType;
}

// ---------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {

  console.log({NODE_ENV: process.env.NODE_ENV})

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
                  <Link href={`/tickets/${id}`}>
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
