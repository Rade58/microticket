/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
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
  // DA RESTRUKTURIRAMO tickets ARRAY
  const { tickets } = props;

  console.log({ tickets });

  // PRAVIMO UI, ODNONO TABLE UI
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(({ price, title, id }) => {
            return (
              <tr key={id}>
                <td>{title}</td>
                <td>${price.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IndexPage;
