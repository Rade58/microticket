/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA MI useEffect
// JER MI SE NE SVIDJA MOJ useRequestHook
// MOZE LAKO DOCI DO GRESKE (NECU DA TI OBJASNJAVAM ZASTO JER NEMAM VREMENA)
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// TREBACE MI I push FROM ROUTER
import { useRouter } from "next/router";
//
import { buildApiClient } from "../../utils/buildApiClient";
import { TicketDataI } from "../../types/data/ticket-data";
// TREBACE MI CUSTOM HOOK
import useRequest from "../../hooks/useRequestHook";
//TREBA MI I OVO
import { OrderDataI } from "../../types/data/order-data";

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
  const { push } = useRouter();

  const {
    ticket: { id: ticketId, price, title },
  } = props;

  // EVO KORISTIM HOOK
  const {
    makeRequest: makeRequestToCreateOrder,
    errors,
    ErrorMessagesComponent,
    hasErrors,
  } = useRequest<{ ticketId: string }, OrderDataI>("/api/orders", {
    method: "post",
  });

  // OVO NE VALJA
  /* useEffect(() => {
    if (data) {
      push(`/orders/${data.id}`);
    }
  }, [data]);
 */

  return (
    <div>
      <h1>{title}</h1>
      <h4>Price: {price}</h4>
      <button
        onClick={() => {
          makeRequestToCreateOrder({ ticketId }).then((data) => {
            console.log({ data });
            if (data) {
              push(`/orders/${data.id}`);
            }
          });
        }}
        className="btn btn-primary"
      >
        Purchase
      </button>
      <ErrorMessagesComponent errors={errors} />
    </div>
  );
};

export default SingleTicketPage;
