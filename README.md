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

```
