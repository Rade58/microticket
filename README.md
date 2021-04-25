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
