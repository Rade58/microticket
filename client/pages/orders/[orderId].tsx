/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// NAPRAVIO SAM TYPE ZA DATA ZA ORDER, KOJI CES OBTIN-OVATI
// ISTO TAKO ON CE IMATI POPULATED TICKET
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";
// TREBA I DA BUILD-UJEMO API CLIENT-A
import { buildApiClient } from "../../utils/buildApiClient";

interface PropsI {
  order: OrderDataTicketPopulatedI;
}

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  // UZIMAS [orderId]
  const { orderId } = ctx.params;

  // UZIMAMO ORDER
  try {
    const { data } = await client.get(`/api/orders/${orderId}`);

    console.log({ data });

    return {
      props: {
        order: data,
      },
    };
  } catch (err) {
    // AKO NEMA ORDER-A I OVDE BI TREBAO DA NAPRAVIM REDIRECT
    ctx.res.writeHead(302, { Location: "/" });

    ctx.res.end();

    return { props: { order: {} } };
  }
};

const OrderPage: FunctionComponent<PropsI> = (props) => {
  console.log({ props });

  const {
    order: { expiresAt },
  } = props;

  return <div>{expiresAt}</div>;
};

export default OrderPage;
