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
    // DAKLE U OVOJ FUNKCIJI PRVO CEMO DA KONEKTUJEMO
    // STAN CLIENTA
    // TAKODJE GA DODELJUJEMO _client PROPERTIJU INSTANCE
    this._client = connect(clusterId, clientId, clientOpts);

    // OVO CU DODELITI VARIJABLOJ JER CU TO KORISTITI
    // U PROMISE-OVOM CALLBACK-U
    const _client = this._client;
    // PROMISE RETURNUJM  IZ OVE METODE

    return new Promise<void>((res, rej) => {
      // OVAJ HANDLER CE SE IZVRSITI NAKON USPESNE KONEKCIJE
      _client.on("connect", () => {
        console.log(`
          Connected to Nats Streaming Server
          clientId: ${clientId}
        `);
        // I RESOLVE-UJEM
        res();
      });

      // DEFINISEM I HANDLER KOJI CE SE IZFRSITI AKO SE DESI
      // FAILING TO CONNECT
      _client.on("error", () => {
        console.log(
          `client ${clientId} Failed to connect to Nats Streaming Server`
        );
        // U OVOOM SLUCJU REJECTUJEMO PROMISE
        rej();
      });
    });
  }

  // TREBACE NAM I GETTER ZA CLIENT
  // JER TO CEMO UPOTREBLJAVATI KADA BUDEMO
  // KORISTILI OVOG CLIENTA U HANDLERIMA, KADA BUDEMO
  // INSTATICIZIRALI CUSTOM LISTENERA ILI PUBLISHERA

  get client(): Stan | undefined {
    return this._client;
  }
}

// KAO STO VIDIS IZVOZIS INSTANCU OVE KLASE
export const natsWrapper = new NatsWrapper();
