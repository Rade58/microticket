# CREATING A CHARGE WITH STRIPE

DAKLE U PROSLOM BRANCHU SMO PODESILI STRIPE SECRET KEY U SECRET KUBERNETES OBJECT-U, I DEFINISALI SMO U CONFIGU UCITAVANJE TOG KEY-A, KO ENVIROMENT VARIIJABLE

SADA CEMO TO DA KORISTIMO U JEDNOM SEPARATE FILE-U, KOJEG CEMO DA NAPRAVIMO, U CILJU DA U NJEGA UVEZEMO STRIPE LIBRARY I INSTATIATE-UJEM STRIPE LIBRARY

- `touch payments/src/stripe.ts`

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY as string, {
  apiVersion: "2020-08-27", // CIM NAPISES "" BIO MI JE SUGESTED OVAJ VERSION
  typescript: true, // za ovo kazu da nema nekog efekta, ali stavicu ovo
});

```

# MOZEMO SADA IMPORTOVATI `Stripe` INSTANCU, U NASEM HANDLERU, I KORISTITI JE DA CHARGE-UJEMO USERS CREDIT CARD

***
***

ALI KAKO MI, USTVARI CHARG-UJEMO USERS CREDIT CARD KORISCENJE STRIPE LIBRARY-JA

[NAJBOLJE JE POGLEDATI API REFERENCE](https://stripe.com/docs/api) KAKO BI OVO BOLJE RAZUMEO 

LEFT SIDE NADJI SECTION [`Charges`](https://stripe.com/docs/api/charges)

A TU PRONALAZIMO SECTION [`Create A Charge`](https://stripe.com/docs/api/charges/create?lang=node)

NA CODE SAMPLE-OVIMA TI MOZES DA BIRS LIBRARY, PA TI BIRAJ NODEJS

TU DAKLE SAZNAJEM DA SE CHARGE KREIRA (ODNOSNO DA SE USER CREDIT CARD BILL-UJE), TAKO STO SE KORISTI `await <Stripe INSTANCA>.charges.create(`

DODAJE SE KAI ARGUMENT OPPTION OBJECT

DVA FIELD-A SU REQUIRED A TO SU `amount` I `currency`

MI CEMO SVE GA UNETI TRI DO 4 OPCIJE

`amount` SE POSTAVLJA U SMALLEST CURRENCY UNIT-IMA; STO ZNACI DA CE SE PODESAVATI BROJ `CENTA`(`CENTS`) AKO SE KAO `currency` KOORISTI `usd`

STO BI ZNACILO DA KADA STRIPE BUDE SUPPORTED U SRBIJI, MOCI CES DA CHARGE-UJES A amount BI POSTAVLJAU U BROJU `PARA` (JER PARA JE SMALLEST UNIT OD DINARA)

**DAKLE AKO TI STORE-UJES PRICE U DOLARIMA, NEOPHODNO JE DA IH PRE POZIVA POMENUTE FUNKCIJE, USTVARI CONVERTUJES U CENTS; A 100 CENTS JE 1$, STO ZNACI DA DOLARE MULTIPLY-UJES SA 100 DA DOBIJES CENTS**

currency USTVARI TREBA DA IMA VREDNOSTU CURRENCY CODE-A, CURENCY-JA KOJI KORISTIS, NA PRIMER `"usd"` (UNUITED STATES DOLLAR) ILI `"rsd"` (REPUBLIC SERBIA DINAR)

**POSTOJI I TRECI PROPERTI, KOJI JE OPTIONAL A KOJ IJE POTREBNO IPAK DEFINISATI; TO `source`**

**TO JE PAYMENT SOURCE TO BE CHARGED, A POSTOJI MNOGO MOGUCIH SOURCE-VA, KOJE MOZES CHARGE-OVATI**

**JEDAN VIABLE `source` JESTE `token`**

TO CE BITI NESTO STO REPREZENTUJE CREDIT CARD, KOJI MOZEMO DA BILL-UJEMO FOR SOME AMOUNT OF MONEY (**A JA CU PODESITI KADA KORISNIK PRITISNE DUGME TO BE CHARGED NA FRONTENDU, DA SE TAJ TOKEN SALJE, DO NASEG ENDPOINTA ZA CREATING CHARGE** (VEC SAM TAJ TOKEN RESTRUKTURIRAO U SAMOM HANDLERU))

**OPCIONO, MOZEMO PROVIDEOVATI `description`; I ON NEMA VEZE SA CHARGE-OM, ALI CE SE POKAZATI NA STRIPE DASBOARD-U, A MOZDA I KORISNICIMA AS WELL, KADA BUDU GLEDALI CREDIT CARD BILLING STATEMENTS**

***
***

KONACNO UVIZIKO I KORISTIMO Stripe INSTANCU

- `code payments/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Order } from "../models/order.model";
// UVOZIMO DAKLE Stripe INSTANCU
import { stripe } from "../stripe";

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("stripe token not provided"),
    body("orderId").not().isEmpty().withMessage("orderId is missing"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // PRONALAZENJE ORDER-A KOJI USER ZELI DA PAY-UJE
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    // MAKING SURE THAT THE ORDER BELONGS TO THE USER

    if (req.currentUser?.id !== order.userId) {
      throw new NotAuthorizedError();
    }

    // MAKE SURE THAT ORDER IS NOT ALREADY CANCELLED
    if (order.status === OSE.cancelled) {
      throw new BadRequestError("cant't pay fo already cancelled order");
    }

    // ****** EVO OVDE KORISTIMO Stripe INSTANCU ****

    await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100, // ZATO STO PRETVARAMO DOLARE U CENTE
      // A OVDE PASS-UJEMO token AS A SOURCE
      source: token,
    });

    // ------------------------
    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };

```

# MI BI SADA OVO MOGLI DA TESTIRAMO MANUELNO U INSOMII

KSNIJE CEMO MI DA NAPRAVIMO AUTOMATED TESTS SA JESTOM, ALI SADA MOZEMO KORISTITI INSOMNI-U

**TI ZISTA SMES TESTIRATI, JER U SUTINI SE KORISTI TEST DATA STRIPE-A, STO SI MOAGAO I SAM VIDETI U DASBORD-U, JER TAMO TI JE TO OBZANJENO; A PORED TOGA STRIPE NIJE SUPPORTED U MOM REGIONU, TAK ODA NISAM NI POVEZAO BANKING ACCOUNT OF MY ORGANIZATION, NA KOJI BI STIZAJE PARE OD CHARGES-A**

DA MI JE SUPPORTED STRIPE MOGAO BI UNTOGGLE-OVATI TEST DATA MODE, I ONDA POVEZATI ACCOUNT, STO JE MALO VISE ENVOLVED PROCESS; **TO SE I RADI KADA SVOJ APP ZELIS DA PUSH-UJES TO PRODUCTION**

STO SE TICE TESTINGA U INSOMII, MORAMO PRVO DA NAPRAVIMO JEDAN TICKET, PA DA NAPRAVIMO ORDER ZA TAJ TICKET

***
***

digresija:

MOZDA BI SADA BILO DA EXPIRATION TIME OF ORDER, POVECAS SA 20 SEKUNDI NA 15 MINUTA, JER MOZE TI SE DESITI DA TI BRZO ORDER POSTANE CANCELLED, ODNONO DA MU status POSTANE "cancelled"

OVO OBAVLJAM U `orders` MICROSERVICE-U

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

// UMESTO OVOGA
// const EXPIRATION_PERIOD_SECONDS = 20;
// DEFINISEM OVO
const EXPIRATION_PERIOD_SECONDS = 15 * 60;
// I TO JE SVE

const router = Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const userId = req?.currentUser?.id;
    const ticket = await Ticket.findOne({ _id: ticketId }).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    const order = await Order.create({
      ticket: ticket.id,
      userId: userId as string,
      expiresAt: expirationDate,
      status: OSE.created,
    });

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      expiresAt: new Date(order.expiresAt).toISOString(),
      userId: order.userId,
      status: order.status,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createNewOrderRouter };
```

***
***

DEFINITIVNO PRE BILO KAKVOG TESTIRANJA U INSOMII, MORAMO POKRENUTI SKAFFOLD, DA BI SE CHANGES APPLY-OVALE NA NAS CLUSTER

- `skaffold dev`

***
***

DA SE SADA VRATIM NA MANUELNO TESTIRANJE SA INSOMNIOM


