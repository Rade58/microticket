# PUBLISHING TICKET CREATION

DAKLE POTREBNO JE POMENUTI EVENT PUBLISH-OVATI NAKON USPESNOG TICKET CREATION-A

A PRE TOGA MORAMO KREIRATI CUSTOM PUBLISHER KLASU EXTENDINGOM NASE BASE ABSTRACT `Publisher` KLASE

**MEDJUTIM TREBACE TI I `node-nats-streaming` PAKET**

- `cd tickets`

- `yarn add node-nats-streaming`

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
