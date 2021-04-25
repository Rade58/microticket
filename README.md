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
  publish(data: T["data"]) {
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

- `touch nats_test_project/src/events/ticket-created-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";
import { Publisher } from "./abstr-publisher";
// UVESCEMO I ONAJ INTERFACE KOJI SMO VEC UPOTREBILI ZA TicketCreatedListener-A
import { TicketCreatedEventI } from "./ticket-created-event";
// ALI CE TREBA TI I ENUM
import { ChannelNamesEnum as CNE } from "./channel-names";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEventI> {
  /**
   * @description channel name (also known as subject)
   */
  public channelName: CNE.ticket_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreatedPublisher.prototype);
  }

  // METODU publish VEC NASLEDJUJES IZ ASTRCTNE KLASE
  // TAMO SI JE FULLY DEFINISAO
}
```

## SADA MOZEMO DA ISPROBAMO PUBLISHER TAKO STO CEM OREFAKTORISTI ONOG PUBLISHER-A, KOJEG SMO KORISTILI U NASEM SUB PROJECTU, PREKO KOJEG UCIMO SVE OVE NATS STREAMING STVARI

- `code nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";

// UVOZIMO SADA NASU KLASU CUSTOM PUBLISERA
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // OVO SADA NE RADIMO OVAKO

  /* const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });


  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  }); */

  // VEC OVAKO

  const ticketCretedPublisher = new TicketCreatedPublisher(stan);

  // OVDE CES IMATI SAV TYPECRIPT TYPECHECKING
  // DAKLE AKO POGRESIS NEKI DATA PROPERTI TYPESCRIPT CE YELL-OVATI NA TEBE
  // ISTO TAKO SA CTRL + SPACE, TI ZNAS TACNO STA DA PROSLEDIS 
  ticketCretedPublisher.publish({
    id: "aw6dg76df",
    price: 69,
    title: "Stavros concerto",
  });
});

```

## MOZEMO SADA OVO TESTIRATI

PRVI TERMINAL

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          2d1h
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          2d1h
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          2d1h
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          2d1h
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          2d1h
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          2d1h
```

- `kubectl port-forward nats-depl-f878fb4f9-k6fgq 4222:4222`

DRUGI TERMINAL:

- `cd nats_test_project`

- `yarn listen`

TRECI TERMINAL:

- `cd nats_test_project`

- `yarn run publish`

IZGLEDA DA SVE FUNKCIONISE, I PVI PUT I KADA SAM RESTARTOVAO PUBLISHER SCRIPT
