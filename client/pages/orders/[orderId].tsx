/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useEffect } from "react";
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
  const {
    order: { expiresAt },
  } = props;

  const expirationTimeMiliseconds: number = new Date(expiresAt).getTime();

  const [
    currentTimeMiliseconds,
    setCurrnetTimeMiliseconds,
  ] = useState<number>();

  const [timerId, setTimerId] = useState<number | undefined>(undefined);

  // OVO JE MALO OSIGURANJE DA NE MOZE ICI MANJE OD NULA
  const timeDiffMiliseconds =
    expirationTimeMiliseconds - currentTimeMiliseconds > 0
      ? expirationTimeMiliseconds - currentTimeMiliseconds
      : 0;

  console.log({ timeDiffMiliseconds });

  const minutes = new Date(timeDiffMiliseconds).getMinutes();
  const seconds = new Date(timeDiffMiliseconds).getSeconds();

  // ---------- SETTING TIMER ---------------
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrnetTimeMiliseconds(new Date().getTime());
    }, 1000);

    setTimerId(timerId);
  }, []);

  // --------- CLEARING TIMER ZALUCAJ OVAKO ----------------
  useEffect(
    () => () => {
      window.clearInterval(timerId);
    },
    [timerId]
  );
  // ------------------------------------------
  // ALI HJDE DA CLEAR-UJEMO TIMER I KADA JE RAZLIKA
  // DOSLA DO NULA ILI ISPOD NULA

  useEffect(() => {
    if (timeDiffMiliseconds <= 0) {
      window.clearInterval(timerId);
    }
  }, [timeDiffMiliseconds, timerId]);

  // ZA SADA SAMO DA TI POKAZEM DA SVE FUNKCIONISE
  // PRIKAZUJEM TI SLEDECI UI
  return (
    <div>
      expires in: {minutes} minutes and {seconds} seconds
    </div>
  );
};

export default OrderPage;
