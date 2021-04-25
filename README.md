# CUSTOM PUBLISHER

NAPRAVICU I Publisher BASE CLASS, ODNOSNO Publisher ABSTRACT CLASS, SIMILAR TO Listener CLASS, KOJI SAM VEC NAPRAVIO

NARAVNO, UZ SLICAN TYPESCRIPT SUPPORT, KOJI SAM URADIO I U Listener KLASI

- `touch nats_test_project/src/events/abstr-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";

interface Event {
  channelName: any;
  data: any;
}

export abstract class Publisher<T extends Event> {
  /**
   * @description NAME OF THE CHANNEL YOU ARE PUBLISHING TO
   */
  abstract channelName: T["channelName"];

  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */
  private stanClient: Stan;

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;

    Object.setPrototypeOf(this, Publisher.prototype);
  }

  /**
   *
   * @param data To be published
   */
  publih(data: T["data"]) {
    const jsonData = JSON.stringify(data);

    this.stanClient.publish(this.channelName, jsonData, () => {
      console.log(`
        Event Published
        Channel: ${this.channelName}
      `);
    });
  }
}
```

## SADA CEMO ODMAH UPOTREBITI GORNJI ABSTRACT CLASS, KAKO BI NAPRAVILI `TicketCreatedPublisher` CLASS

- `touch nats_test_project/src/events/ticket-publisher-created.ts`

```ts
import { Stan } from "node-nats-streaming";
import { Publisher } from "./abstr-publisher";
// UVESCEMO I ONAJ INTERFACE KOJI SMO VEC UPOTREBILI ZA TicketCreatedListener-A
import { TicketCreatedEventI } from "./ticket-created-event";
// ALI CE TREBA TI I ENUM
import { ChannelNamesEnum as CNE } from "./channel-names";

export class TicketCreated extends Publisher<TicketCreatedEventI> {
  /**
   * @description channel name (also known as subject)
   */
  public channelName: CNE.ticket_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreated.prototype);
  }

  // METODU publish VEC NASLEDJUJES IZ ASTRCTNE KLASE
  // TAMO SI JE FULLY DEFINISAO
}
```

## SADA MOZEMO DA ISPROBAMO PUBLISHER TAKO STO CEM OREFAKTORISTI ONOG PUBLISHER-A, KOJEG SMO KORISTILI U NASEM SUB PROJECTU, PREKO KOJEG UCIMO SVE OVE NATS STREAMING STVARI

- `code nats_test_project/src/publisher.ts`

```ts

```

