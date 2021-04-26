import { Stan } from "node-nats-streaming";
// UVOZIM OVO
import { ChannelNamesEnum as CNE } from "../channel-names";

interface EventI {
  // UMESTO OVOGA
  // channelName: any;
  // OVO
  channelName: CNE;
  //
  data: any;
}

// DALJE NISTA NECU MENJATI

export abstract class Publisher<T extends EventI> {
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
