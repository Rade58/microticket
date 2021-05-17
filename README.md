# RENDERING LIST OF ORDERS

- `touch client/pages/orders/index.tsx`

ONO STO CU URADITI JE HITTING orders MICROSERVICE, KAKO BI UZEO ORDERS BY USER

```tsx
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
```

KAO STO VIDIS, DODAO SAM LINK DO ONOG ORDERS PAGE-A, KOJI NIJE CANCELLED ILI COMPLETED

## ZA PAGE INDIVIDUAL ORDERA, KAD SE DOGODI USPESAN PAYMENT, DEFINISACU RIRECT TO LIST OF ORDERS

- `code client/pages/orders/[orderId].tsx`

```tsx
/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { InitialPropsI } from "../../types/initial-props";
import { OrderDataTicketPopulatedI } from "../../types/data/order-data";
import { buildApiClient } from "../../utils/buildApiClient";
import StripeCheckoutModal from "react-stripe-checkout";
import useRequest from "../../hooks/useRequestHook";

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

  const { push } = useRouter();

  const {
    makeRequest: makeRequestToPayments,
    ErrorMessagesComponent,
    errors,
  } = useRequest<{ orderId: string; token: string }, { id: string }>(
    "/api/payments",
    { method: "post" }
  );

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
      {orderCompleted === false ? (
        <>
          {timeDiffMiliseconds > 0 ? (
            <span>
              expires in: {minutes} minutes and {seconds} seconds
            </span>
          ) : (
            <span>order expired</span>
          )}
        </>
      ) : null}
      {timeDiffMiliseconds > 0 && orderCompleted === false ? (
        <StripeCheckoutModal
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
          token={({ id: token }) => {
            makeRequestToPayments({ orderId, token }).then((data) => {
              if (data) {
                console.log(data.id);

                setOrderCompleted(true);

                // EVO OVDE MOGU NAPRAVITI TAJ REDIRECT
                push(`/orders`);
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

```

