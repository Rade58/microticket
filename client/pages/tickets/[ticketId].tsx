/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA MI useEffect
// JER MI SE NE SVIDJA MOJ useRequestHook
// MOZE LAKO DOCI DO GRESKE (NECU DA TI OBJASNJAVAM ZASTO JER NEMAM VREMENA)
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// TREBACE MI I push FROM ROUTER
import router from "next/router";
//
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
  const { push } = router;

  const {
    ticket: { id: ticketId, price, title },
  } = props;

  // EVO KORISTIM HOOK
  const {
    makeRequest: makeRequestToCreateOrder,
    data,
    errors,
    ErrorMessagesComponent,
    hasErrors,
  } = useRequest<{ ticketId: string }, OrderataI>("/api/orders", {
    method: "post",
  });

  // NAMERNO KORISTIM EFFECT ZA REDIRECTING, JER CE ELIMINISATI MNOGE PROBLEME KOJ ISE MOGU JAVITI
  // JER data IL Ierrors IZ useRequestHook-A SU NEKAKO PODESNE
  // VISE ZA DEFINISANJE RENDERING STVARI, A NE ZA REDIRECCT

  // OVO JE KONKRETNO VAZNO ZA TO DA SE REDIRECT NE DESI KADA
  // KORISNIK POKUSA DA MAKE-UJE ORDER ZA VEC RESERVED TICKET
  useEffect(() => {
    if (data && !hasErrors) {
      push("/orders/[orderId]", `/orders/${data.id}`);
    }
  }, [data, hasErrors, push]);

  // DA BUILD-UJEMO I UI ZA INDIVIDUAL TICKET PAGE

  // A DODACEM I BUTTON, NA CIJI CLICK TREBA DA SE
  // INCIRA KREIRANJE ORDER-A

  // NA NJEMU CE PISATI `Purchase` A KLIK NA TO DUGME, PORED STO PRAVI
  // ORDER, TREBALO BI DA NAS REDIRECT-UJE NA ORDER PAGE, ZA
  // TAJ ORDER

  return (
    <div>
      <h1>{title}</h1>
      <h4>Price: {price}</h4>
      <button
        onClick={() => {
          makeRequestToCreateOrder({ ticketId });
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
