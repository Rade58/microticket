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

  // EVO SADA SAM ZADAO DA METODA BUDE USTVARI async
  /**
   *
   * @param data To be published
   * @returns Promise<any>
   */
  publish(data: T["data"]) {
    const jsonData = JSON.stringify(data);

    // DEFINISEM PROMISE ,A U NJEMU POZIVAM
    // stan.publish
    // ALI IPAK DA NE RIZIKUJEM SA this
    // STAN CU CUVATI U VARIJABLOJ
    const stan = this.stanClient;
    // ALI I channelName
    const channelName = this.channelName;

    // AKO SE RESOLVE-UJE BICE RESOLVED NI SA CIM
    return new Promise<void>((res, rej) => {
      stan.publish(
        channelName,
        jsonData,
        /**
         *
         * @param error Error | undefined
         */
        (error) => {
          // REJECTUJEM PROMISE AKO POSTOJI ERROR
          // TAKODJE RETURNUJEM
          if (error) {
            return rej(error);
          }

          console.log(`
            Event Published
            Channel: ${this.channelName}
          `);

          // OVDE MOZES DA RESOLVE-UJES

          res();
        }
      );
    });
  }
}
