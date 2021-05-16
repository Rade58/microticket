/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import { buildApiClient } from "../../utils/buildApiClient";
import { TicketDataI } from "../../types/data/ticket-data";
// TREBACE MI CUSTOM HOOK
import useRequest from "../../hooks/useRequestHook";
//TREBA MI I OVO
import { OrderataI } from "../../types/data/order-data";

interface PropsI {
  ticket?: TicketDataI;
}

//-------------------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  const { params } = ctx;

  const { ticketId } = params;

  try {
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return {
      props: {
        ticket: data,
      },
    };
  } catch (err) {
    ctx.res.writeHead(302, { Location: "/" });

    ctx.res.end();

    return {
      props: {},
    };
  }
};
// -----------------------------------------------------------

const SingleTicketPage: FunctionComponent<PropsI> = (props) => {
  const {
    ticket: { id },
  } = props;

  // EVO KORISTIM HOOK
  const { makeRequest: makeRequestToCreateOrder } = useRequest<
    { ticketId: string },
    OrderataI
  >("/api/orders", { method: "post" });

  return <pre>{JSON.stringify({ ticket: props.ticket })}</pre>;
};

export default SingleTicketPage;
