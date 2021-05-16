/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";
import { buildApiClient } from "../../utils/buildApiClient";
// UVOZIM PAKET KOJ ISAM MALOCAS INSTALIRAO
import StripeCheckoutModal from "react-stripe-checkout";
//

interface PropsI {
  order: OrderDataTicketPopulatedI;
}

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  const client = buildApiClient(ctx);

  const { orderId } = ctx.params;

  try {
    const { data } = await client.get(`/api/orders/${orderId}`);

    return {
      props: {
        order: data,
      },
    };
  } catch (err) {
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

  const [currentTimeMiliseconds, setCurrnetTimeMiliseconds] = useState<number>(
    new Date().getTime()
  );

  const [timerId, setTimerId] = useState<number | undefined>(undefined);

  const timeDiffMiliseconds =
    expirationTimeMiliseconds - currentTimeMiliseconds;

  const minutes = new Date(timeDiffMiliseconds).getMinutes();
  const seconds = new Date(timeDiffMiliseconds).getSeconds();

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrnetTimeMiliseconds(new Date().getTime());
    }, 1000);

    setTimerId(timerId);
  }, []);

  useEffect(
    () => () => {
      window.clearInterval(timerId);
    },
    [timerId]
  );

  useEffect(() => {
    if (timeDiffMiliseconds <= 0) {
      window.clearInterval(timerId);
    }
  }, [timeDiffMiliseconds, timerId]);

  return (
    <div>
      {timeDiffMiliseconds > 0 ? (
        <span>
          expires in: {minutes} minutes and {seconds} seconds
        </span>
      ) : (
        <span>order expired</span>
      )}

      <StripeCheckoutModal
        stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        //
      />
    </div>
  );
};

export default OrderPage;
