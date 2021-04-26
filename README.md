# ACCESSING NATS CLIENT; CREATING CUSTOM PUBLISHER CLASS; PUBLISHING TICKET CREATION EVENT

MORAMO KREIRATI CUSTOM PUBLISHER KLASU EXTENDINGOM NASE BASE ABSTRACT `Publisher` KLASE, KOJU UVOZIMO IZ common MODULE-A

## KREIRAM SADA CUSTOM PUBLISHERA

- `mkdir -p tickets/src/events/publishers`

- `touch tickets/src/events/ticket-created-publisher.ts`

BICE IDENTICAN ONOME KOJEG SMO NAPRAVILU U NASEM [TEST PROJEKTU](nats_test_project/src/publisher.ts)

```ts
import { Stan } from "node-nats-streaming";

import {
  Publisher,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEventI> {
  public channelName: CNE.ticket_created;

  constructor(stan: Stan) {
    super(stan);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreatedPublisher.prototype);
  }
}

// NISTA TI NE TREBA OVDE VISE
// SECAS SE DA TI JE publish VEC POTPUNO DEFINISANO
// I ONO RETURN-UJE PROMISE, TAKO DA GA MOZES KORISTITI SA await
// ONA NIJE ABSTRACT METODA
// ABTRACT PROPERTI JE JEDINO BIO channelName
```

# ZELIM DA REDEFINISEM GETTER-A IZ `NatsWrapper` KLASE, KAKO IPAK TAJ GETTER NE BI RETURN-OVAO `undefined`, JER POSTOJI I TA MOGUCNOST

**USTVARI AKO JE CLIENT, USTVARI undefined; THROW-OVCEMO ERROR**

- `code tickets/src/events/nats-wrapper.ts`

```ts
import { Stan, connect, ClientOpts } from "node-nats-streaming";

class NatsWrapper {
  /**
   * @description CAN BE UNDEFINED BECAUSE IT IS GOING TO BE INITIALIZED
   * FROM METHOD OF THE NatsWrapper CLASS ("connect" METHOD)
   */
  private _client?: Stan;

  /**
   *
   * @param clusterId cluster id (specifi) (you can find it in nats-depl.yaml) (you setted it as `"-cid"`)
   * @param clientId make up one
   * @param clientOpts ClientOpts (but you are interested in "url" filed only)
   */
  connect(clusterId: string, clientId: string, clientOpts: ClientOpts) {
    this._client = connect(clusterId, clientId, clientOpts);

    const _client = this._client;

    return new Promise<void>((res, rej) => {
      _client.on("connect", () => {
        console.log(`
          Connected to Nats Streaming Server
          clientId: ${clientId}
        `);

        res();
      });

      _client.on("error", () => {
        console.log(
          `client ${clientId} Failed to connect to Nats Streaming Server`
        );

        rej();
      });
    });
  }

  // EVO OVDE, UMESTO OVOG
  /* get client(): Stan | undefined {
    return this._client;
  } */
  // BOLJE DA URDIM OVAKO
  /**
   * client GETTER
   */
  get client(): Stan {
    if (!this._client) {
      throw new Error("Can't access NATS Streaming Server before connecting.");
    }

    return this._client;
  }
}

export const natsWrapper = new NatsWrapper();

```

# SADA MOGU DA INSTATICIZIRAM CUSTOM PUBLISHER-A, SA NATS CLIENT-OM KAO ARGUMENTOM

- `code tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

// EVO UVOZIM, PRVO MOJ UCUSTOM PUBLISHER KLASU
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
// UVOZIM I NATS WRAPPER-A, S KOJEG CU UZETI NATS CLIENT-A
import { natsWrapper } from "../events/nats-wrapper";
//

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = (req.currentUser as {
      id: string;
      email: string;
      iat: number;
    }).id;

    const ticket = await Ticket.create({ title, price, userId });

    // OVDE JE TICKET CREATED
    // I MOZEMO OVDE DA PUBLISH-UJEMO EVENT NA SLEDECI NACIN
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      // BITNO JE DA OVAKO DODELJUJEM VREDNOSTI, JER GARANTUJEM DA SAM DAT UZEO
      // SA DOKUMENTA KOJI JE KREIRAN
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
```
