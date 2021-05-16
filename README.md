# DISPLAYING TIMER ON ORDER PAGE

***
***

digresija:

IMAO SAM GRESKE KOJE SAM PRAVIO PRILIKOM NAVIGATING-A; I KORISCENJE data FROM `useRequestHook` MI JE LOSE, ZATO SAM IPAK POPRAVI MALO TAJ HOOK DA MI IPAK APPROPRIATE data DAJE `makeRequest`

ISTO TAKO NE KORISTIM VISE `as` NI U LINKOVIMA, A NI PRI KORISCENJU `push`

**USTVARI TO I NIJE BIO PROBLEM (IMAO SAM DRUGI PROBLEM (OBICAN TYPE-O))**

A SADA SE VRATI NA TEMU

***
***

DAKLE JA NA ORDER PAGE-U ZELIM DA PRIKAZEM TIMER, KOJI CE POKAZIVATI KORISNIKU, KOLIKO JOS MINUTA ILI SEKUNDI IMA DOK MU ORDER BNE EXPIRE-UJE; ODNPNO KOLIKO JOS IMA VREMENA DA PRISTISNE NA `Pay` DUGME, KOJE CE ISTO BITI DISPLAYED, ALI SA `Pay` DUGMENTOM CU SE POZABAVITI U SLEDECEM BRANCH-U

IMAM NEKE IDEJE

KADA BUDE OVAVLJEN PROGRAMATICALLY NAVIGATION TO THE ORDER PAGE, ILI KADA SE RELOAD-UJE PAGE, TREBALO BI DA SE NAPRAVI REQUEST PREMA ENDPOINTU ZA GETTING SINGLE ORDERA (MOZE SERVER SIDE INSIDE getServerSideProps); A MEDJU PODACIMA BI TREBALO DA DOBIJES `expiresAt`; I PREMA TOME TI MOZES PODESAVATI TIMER

**KADA TIMER DODJE DO ZERO, SAKRICEMO I TIMER, A I `Pay` BUTTON** 

**ALI TO CEMO URADITI NESTO KASNIJE, ZA SADA CU SAMO DA DEFINISEM SVU TIMER LOGIKU**

- `code client/pages/orders/[orderId].tsx`

```tsx
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

// DEFINISAO SAM SERVER SIDE CODE, A SADA CU DA SE POZABAVIM DEFINISANJEM TIMER-A, U KOMPONENTI

const OrderPage: FunctionComponent<PropsI> = (props) => {
  const {
    order: { expiresAt },
  } = props;

  const expirationTimeMiliseconds: number = new Date(expiresAt).getTime();

  const [currentTimeMiliseconds, setCurrnetTimeMiliseconds] = useState<number>(
    new Date().getTime()
  );

  const [timerId, setTimerId] = useState<number | undefined>(undefined);

  // OVO JE MALO OSIGURANJE DA NE MOZE ICI MANJE OD NULA
  const timeDiffMiliseconds =
    expirationTimeMiliseconds - currentTimeMiliseconds;

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

  // AKO JE RAZLIMA MANJA OD NULE ILI NULA
  // DISPLAY-OVACU NESTO DRUGO
  return (
    <div>
      {timeDiffMiliseconds > 0 ? (
        <span>
          expires in: {minutes} minutes and {seconds} seconds
        </span>
      ) : (
        <span>order expired</span>
      )}
    </div>
  );
};

export default OrderPage;

```

U SUSTINI SVE FUNKCIONISE U POGLEDU TIMER-A

MI BI TREBALI BI DA DISPLAY-UJEMO I `Pay` BUTTON, KOJI CE SE USLOVNO PRIKAZIVATI, AKO JE VARIJABLA, KOJOJ SAM DAO IME `timeDiffMiliseconds` VECA OD NULA 

## POSTO CE `Pay` DUGME I NJEGOVA LOGIKA BITI VEZANA ZA STRIPE, TIME CU SE POZABAVITI U SLEDECEM BRANCH-U
