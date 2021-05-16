# SHOWING STRIPE PAYMENT FORM

VEC SAM RANIJE KORISTIO STRIPE NA FRONEND-U

EVO MOZES DA [POGLEDAS OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_SETTING_UP_STRIPE), [I OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_1_STRIPE_MULTIPLE_PRODUCTS_MULTIPLE_PRICES), [I OVDE](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_2_FETCHING_STRIPE_DATA)

ALI PROVEO BI DOSTA VREMENA POKUSAVAJUCI NESTO OVAKO, ZATO CU KORISTITI PAKET, KOJI KORISTI I AUTOR WORKSHOPA (**IAKO JE KAKO VIDIM, UNMAINTAINED FOR 4 YEARS**)

STVARI KOJE SAM RANIJE RADIO ZAHTEVAJU DEFINISANJE CELOG JEDNOG PAGE-A ZA STRIPE CHECKOUT (STO JE NARAVNO PRAVI NACIN DA SE IDE KADA SE KORISTI STRIPE, ALI TO JE TOO MUCH ZA MOJU APLIKACIJU)

ZATO CU KORISTITI PAKET KOJI KORISTI AUTOR WORKSHOPAS

## KORISTICEMO PAKET `react-stripe-checkout`; IAKO GA NIKAD NECU KORISTITI U PRODUCTION-U; CISTO ZELIM DA STO PRE ZAVRSIM WORKSHOP

DAKLE KADA BUDEM PRAVIO REAL WORLD APP, [KORISTIO BI NESTO OVAKO](https://stripe.com/docs/payments/integration-builder), A NE OVO STO CU SADA URADITI

**MEDJUTIM PAKET NIJE LOS; JEDINO STA OON RADI, JESTE DA PROVIDE-UJE UI U KOJE CE KORISNIK UNOSITI SVOJ CREDIT CARD DATA; A ONO STO SE DOBIJA IZ SVGA TOGA JESTE `token`; TOKEN KOJI JE POTREBAN I KOJI MI OCEKUJEMO U NASEM ENDPOINTU ZA payments MICROSERVICE, KAKO BISMO USPESNO NAPRAVILI STRIPE CHECKOUT**

- `cd client`

- `yarn add` [react-stripe-checkout](https://www.npmjs.com/package/react-stripe-checkout)

## TREBACE TI PUBLISHABLE STRIPE KEY, KOJI MOZES NACI U STRIPE DASBOARD-U

POSTO JE PUBLISHABLE MOZES GA HARDCODE-OVATI GDE HOCES

ALI NIJE NI TO DOBRA PARKASA

ZATO CU GA DODATI U .env.local FILE KOJI NE COMMIT-UJEM

- `touch client/.env.local`

```zsh
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

# MOZEMO KONACNO DA UPOTREBIMO PAKET KOJ ISMO INSTALIRALI

- `code client/pages/orders/[orderId].tsx`

```tsx
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
          token={({ id: token }) => {
            console.log({ token });
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

```

MOZEMO OVO ODMAH DA TESTIRAMO

- `skaffold dev`

OBAVI SAV PROCES OD KRIRANJA TICKETA (`https://microticket.com/tickets/new`), DO MAKINGA ORDER-A ZA TAJ TICKET

**PA NA ORDER PAGE-U, PRITISNI NA DUGME ZA BUY I POSMATRAJ KONZOLU** (OBJASNJENO TI JE DA MOZES KORISTITI `4242424242424242` KAO CARD NUMBER A TESTIRANJE ([pogledaj i ovo](https://stripe.com/docs/testing#cards)))

TREBAO BI DA SE STMAPA TOKEN NAMENJAN ZA PRAVLJANJE STRIPE CHECKOUT-A

**I ZAISTA JE TAKO**

# SADA MOZEMO DA DEFINISEMO PRAVLJNJE REQUESTA, PREMA `/api/payments`


