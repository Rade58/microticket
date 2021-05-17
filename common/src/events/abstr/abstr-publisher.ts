import { Stan } from "node-nats-streaming";
import { ChannelNamesEnum as CNE } from "../channel-names";

interface EventI {
  channelName: CNE;
  data: any;
}

// U SUSTINI, SVE STO TREBAMO URADITI, JSTE DA NAPRAVIMO
// DA client FIELD NE BUDE VISE private
// VEC protected

export abstract class Publisher<T extends EventI> {
  /**
   * @description NAME OF THE CHANNEL YOU ARE PUBLISHING TO
   */
  abstract channelName: T["channelName"];

  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */

  protected stanClient: Stan;

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;

    Object.setPrototypeOf(this, Publisher.prototype);
  }

  /**
   *
   * @param data To be published
   * @returns Promise<any>
   */
  publish(data: T["data"]) {
    const jsonData = JSON.stringify(data);
    const stan = this.stanClient;
    const channelName = this.channelName;

    return new Promise<void>((res, rej) => {
      stan.publish(
        channelName,
        jsonData,
        /**
         *
         * @param error Error | undefined
         */
        (error) => {
          if (error) {
            return rej(error);
          }

          console.log(`
            Event Published
            Channel: ${this.channelName}
          `);

          res();
        }
      );
    });
  }
}
