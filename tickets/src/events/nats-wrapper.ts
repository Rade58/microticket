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
