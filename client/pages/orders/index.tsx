/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { InitialPropsI } from "../../types/initial-props";
import { buildApiClient } from "../../utils/buildApiClient";
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";

interface PropsI extends InitialPropsI {
  orders: OrderDataTicketPopulatedI[];
}

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  // IMAS ORDER SA POPULATED ticket FIELD-OM
  const { data } = await client.get("/api/orders");

  // RETURN-UJEM orders KAO PROP
  return {
    props: {
      orders: data,
    },
  };
};

const IndexPage: FunctionComponent<PropsI> = (props) => {
  const { orders } = props;

  return (
    <ul>
      {orders.map(({ ticket: { title }, status, id }) => {
        return (
          <li key={id}>
            {status === OSE.complete || status === OSE.cancelled ? (
              <>{title}</>
            ) : (
              <Link href={`/orders/${id}`}>
                <a>{title}</a>
              </Link>
            )}
            - {status}
          </li>
        );
      })}
    </ul>
  );
};

export default IndexPage;
