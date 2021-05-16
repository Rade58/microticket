/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";
import { buildApiClient } from "../../utils/buildApiClient";
import StripeCheckoutModal from "react-stripe-checkout";
// KORISTICEMO OPET ONAJ useRequestHook
import useRequest from "../../hooks/useRequestHook";
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

//
const OrderPage: FunctionComponent<PropsI> = (props) => {
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);

  // EVO SADA MOZEMO ODMAH OVDE DA KORISTIMO useRequest

  const {
    makeRequest: makeRequestToPayments,
    ErrorMessagesComponent,
    errors,
  } = useRequest<{ orderId: string; token: string }, { id: string }>(
    "/api/payments",
    { method: "post" }
  );
  // SADA MOZEMO KORISTITI GORNJU FUNKCIJU ZA MAKING REQUEST , U token CALLBACK-U

  const {
    order: {
      id: orderId,
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
    if (timeDiffMiliseconds <= 0 || orderCompleted === true) {
      window.clearInterval(timerId);
    }
  }, [timeDiffMiliseconds, timerId, orderCompleted]);

  return (
    <div>
      {timeDiffMiliseconds > 0 && orderCompleted === false ? (
        <span>
          expires in: {minutes} minutes and {seconds} seconds
        </span>
      ) : (
        <span>order expired</span>
      )}
      {timeDiffMiliseconds > 0 && orderCompleted === false ? (
        <StripeCheckoutModal
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
          token={({ id: token }) => {
            // console.log({ token });

            // EVO OVDE PRAVIM REQUEST
            makeRequestToPayments({ orderId, token }).then((data) => {
              if (data) {
                console.log(data.id);

                setOrderCompleted(true);
              }
            });
          }}
          email={email}
          amount={price * 100}
        />
      ) : (
        ""
      )}
      <ErrorMessagesComponent errors={errors} />
    </div>
  );
};

export default OrderPage;
