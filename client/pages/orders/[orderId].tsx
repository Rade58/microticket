/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";
import { buildApiClient } from "../../utils/buildApiClient";
// UVOZIM PAKET KOJ ISAM MALOCAS INSTALIRAO
import StripeCheckoutModal from "react-stripe-checkout";
//

interface PropsI extends InitialPropsI {
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
    order: {
      expiresAt,
      ticket: { price },
    },
    currentUser: { email },
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
      {timeDiffMiliseconds > 0 ? (
        <StripeCheckoutModal
          // PRVA DVA PROPA SU REQUIRED
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
          // TOKEN MORA DA BUDE CALLBACK FUNKCIJA
          // DAKLE TO JE TOKEN KOJI CE BITI KREIRAN
          // KADA KORISNIK UNESE INFO SVOJE KREDITNE KARTICE
          token={(token) => {
            console.log(token);
            // ODAVDE CEMO HIT-OVATI NAS payments MICROSERVICE
            // JEDINI ENDPOINT TOG MICROSERVICE
            // MI TAMO SA TOKENOM PRAVIM OSTRIPE CHECKOUT
          }}
          // OPCIONO MOZES DODATI EMAIL KORISNIKA
          email={email}
          // ONO STO BI TREBALO DA DA DODAS JESTE AMOUNT
          // ON MORA BITI U CENTIMA (najmanjoj jedinici valute)
          amount={price * 100}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default OrderPage;
