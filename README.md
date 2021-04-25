# AWAITING EVENT PUBLICATION

DAKLE BOLJE BI BILO DA EVENTS MOGU PUBLISH-OVATI, KORISCENJEM async await SINTAKSE

**ODNOSNO DA .publish() INSTANCE MOJE KLASE, RETURN-UJE PROMISE, KADA JE EVENT POSLAT**

ZBOG TOGA CU MORATI REDEFINISATI .publish METOD `Publisher` ABSTRACT KLASE

- `code `

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
```

## SADA MOZES DA AWIT-UJEM POZIV `.publish` METODE

TO CU SADA PROBATI NA INSTANCI KLASE, KOJA EXTEND-UJE GORNJU ABSTRACTNU

- `code nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

// OVO MOZE BITI async CALLBACK
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const ticketCretedPublisher = new TicketCreatedPublisher(stan);

  // A OVO MOGU AWAIT-OVATI
  // A SVE MOZE BITI U    try    catch    BLOKU
  // AKO ZELIS DA CAPTURE-UJES ERROR

  try {
    await ticketCretedPublisher.publish({
      id: "sfsfsf",
      price: 69,
      title: "Stavros concerto",
    });

    // I OVDE STMAPAM DA JE EVENT USPESNO POSLAT
    // AKO PUBLISHING NIJE SUCCESSFUL, NI JEDAN CODE OVDE
    // NE BI TREBALO DA SE IZVRSI
    console.log("Event is successfully published");
  } catch (err) {
    console.error(err);
  }
});
```

**ISPROBAO SAM OVO I ZAISTA SVE FUNKCIONISE**


## U SLEDECEM BRANCH-U SVU LOGIKU OKO PUBLISHERA I LISTENERA CU KOPIRATI I STAVITI U MOJ COMMON MODULE, ODNOSNO MOJ LIBRARY, KOJ ICU PUBLISH-OVATI NA NPM

AKO TE ZANIMA JEDAN SUMMARY I JOS NEKE DODATNE INFORMACIJE, TI POGLEDAJ VIDEO 15-14
