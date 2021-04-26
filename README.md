# CONNECTIONS AND NATS CLIENT

**OVO CE BITI DUGACAK BRANCH I RECI CU DOSTA STVARI**

GLEDACU DA OVDE BUDEM SAZET, A TI SE **`ZA DETALJNIJE OBJASNJENJE VRATI I POGLEDAJ VIDEO-E: ` `16-03 16-04`

**ALI IPAK MISLIM DA CU TI PRENETI NAJVAZNIJE STVARI U SAZETOM FORMATU**

## VEROVATNO MISLIS DA SE MOZES ODAMAH KONEKTOVATI NA NATS STREAMING SERVER; ODNOSNO VEROVATNO MISLIS DA BI MOGAO ODMAH POZVATI `stan.connect`, I DA JE LOGICNO MESTO DA AWAIT-UJES TAJ PROCES TAMO GDE SE I KONEKTUJES NA DATABASE SA MONGOOSE-OM; `E PA NIJE TAKO`

JEDNO JE SIGURNO; CONNECTING TI HOCES OBAVLJATI OVDE:

- `cat tickets/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    // ---------------------------------
    // EVO OVDE BI NAPRAVIO CONNECTING
    // DAKLE PRE CONNECTINGA TO DATBASE
    // ---------------------------------
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });


    console.log("Connected to DB (tickets-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();

```

ALI TO NE MOGU TEK TAKO ODRADITI

SA KONEKTINGOM NA MONGO UZ POMOC MONGOOSE-A JE TO MOGUCE ODRADDITI JER JE DOSTA STVARI ABTRACTED OUT

**E PA TO STO JE ZA MONGOOSE ABSTRACTED OUT, TI CES MORATI ZA CONNECTING TO NATS STREAMING SERVER DEFINISATI**

I SAMM MOZES VIDETI KAKO SMO SE KONEKTOVALI NA NATS U NASEM TEST PROJEKTU

TAMO JE POSTOJAO I HANDLER 'conecct' HANDLER, ZA NATS CLIENT-A I MI SMO U NJEMU RADILI SVU OSTALU LOGIKU, **JER SMO ZNAL IDA TU MOZEMO PUBLISH-OVATI EVENTS ILI AKO JE U PITANJU LISTENER DA TU DEFINISEMO SUBSCRIPTIONS**

## MONGO UZ POMOC MONGOOSEA SHARE-UJE TU KONRKCIJU SA SVIM FAJLOVIMA U KOJIMA SE KORISTI MONGOOSE MODEL

SAMO TAKO MI SMO MOGLI DEFINISATI STORING ILI READING FROM DATABASE

DAKLE CONNECTION ILI CLIENT JE U TOM SLUCAJU KORISCEN INTERNALY

## NAME JE PROBLEM, U SLUCAJU NATS STREAMING SERVERA STO CEMO MORATI DA SE KONEKTUJEMO, IZ CEGA KAO POVRATNU VREDNOST DOBIJAMO CLIENT-A; KOJEG MORAMO KORISTITI I NA DRUGIM MESTIMA, ODNONO KADA SALJEMO EVENTOVE, AKO JE U PITANJU PUBLISHER

OVO CEMO MORATI RESITI TAKO STO CEMO NATS CLIENT-A KREIRATI DA BUDE SINGLETON OF SORTS

KREIRACEMO FILE, A MOZE SE ZVATI `nats-wrapper.ts` I GOAL TOG FILE BICE DA SE KREIRA NATS CLIENT I DA 

**PRAVIMO FILE, KOJI INTERNALY KEEP TRACK OF SOME CLIENT I MAKS HIM AVAILABLE TO EVERYTHING ELSE INSIDE OF OUR APP** (SLICNO TOME KAKAV S MONGOOSE)

**ONDA CU IZ TOG FILE-A IMPORT-OVATI U index.ts ,SOME CONE KOJEI CE CONNECT-OVATI CLIENT-A TO NATS STREAMING SERVER**

IMACU I CODE KOJI CE SE TAMO MOGUCE IZVRSITI AKO CLOOSE-UJEMO CONNECTION TO THE NATS (GRACEFU SHUTDOWN STUFF)

A PIRINITILIZED CLIENT NAM TREBA I U HANDLERIMA NASEG MICROSERVICE-A, TAKO DA CEMO GA I TAMO KORISTITI, TKO DA CEMO GA I TAMO UVOZITI

# JA CU NPRAVITI `nats-wrapper.ts` FILE, A U NJEMU CU DA KREIRAM `NatsWrapper` KLASU ;A ONO STO CU IZ FILE-A EXPORT-OVATI JE INSTANCA TE KLASE

KLASA CE IMATI STAN, ODNOSNO NATS CLIENTA NA SEBI

U SUSTINI PRAVIM INTERFEJS VERY SIMILAR TO MONGOOSE

1. NA TAJ NACIN U index.ts FILE-U MOGU KORISTITI CLIENT-A DA SE KONEKTJEM NA NATS STREMAING SERVER

2. I MOGU KA KORISTI U HANDLERIMA ZA PUBLISHING EVENT-OVA, ILI ZA LISTENING

**MEDJUTIM TREBACE TI I `node-nats-streaming` PAKET**

- `cd tickets`

- `yarn add node-nats-streaming`

SADA MOZEMO DA PRAVIMO KLASU

- `touch tickets/src/events/nats-wrapper.ts`

```ts
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
```

# CONNECTING FUNKCIJI SE, IZMEDJU OSTALIH ARGUMENATA DODAJE, I CLUSTER ID

GDE DA PRONADJEM TAJ ID?

PA ZADAO SI GS U `nats-depl.yaml`

- `cat tickets/src/events/nats-wrapper.ts`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nats-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nats
  template:
    metadata:
      labels:
        app: nats
    spec:
      containers:
      - name: nats
        image: nats-streaming:0.17.0
        args: [
          #
          '-p',
          '4222',
          #
          '-m',
          '8222',
          #
          '-hbi',
          '5s',
          #
          '-hbt',
          '5s',
          #
          '-hbf',
          '2',
          #
          '-SD',
          #
          # EVO OVO TI JE CLUSTER ID
          # KADA SAM OVO PODESAVO NISAM TI REKAO DA JE TO TO
          '-cid',
          'microticket'
        ]
---
apiVersion: v1
kind: Service
metadata:
  name: nats-srv
spec:
  selector:
    app: nats
  ports:
    - name: client
      protocol: TCP
      port: 4222
      targetPort: 4222
    - name: monitoring
      protocol: TCP
      port: 8222
```

**JA SAM ISTOIMENI ID PODESAVAO KADA SAM PODESAVAO I SKAFFOLD**

EVO POGLEDEJ `cat skaffold.yaml` (TAMO SAM GA PODESIO UNDER `projectId`)

# URL NA KOJI KONEKTUJES CLIENTA, JESTE NAME CLUSTER IP SERVICE-A, RELATED TO NATS STREMING SERVER

A PORT JE ONAJ PORT KOJI SI PODESIO U (`infra/k8s/nats-depl.yaml`) KAO client PORT

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)             AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP           13d
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP            13d
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP            13d
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP             30d
nats-srv            ClusterIP   10.68.3.138   <none>        4222/TCP,8222/TCP   4d6h
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP           7d22h
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP            7d22h
```

A MOGAO SI PROCITATI NAME CLUSTER IP I FROM CONFIG FILE (TAM OSI GA I PODESIO): `infra/k8s/nats-depl.yaml`

OVO JE URL KOJ ISAM KONSTRUISAO: **`http://nats-srv:4222`**

# SADA CU DA UPOTREBIM INSTANCU `NatsWrapper` KLASE, KAKO BI SE KONEKTOVAO NA NATS STREAMING SERVER

- `code tickets/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
// EVO UVOZIM POMENUTU INSTANCU
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    // OVDE CU DEFINISATI CONNECTING
    // CLIENT ID JE MORE OR LESS SOME RANDOM VALUE
    await natsWrapper.connect("microticket", "tickets-stavros-12345", {
      // I ZDAJEM URL
      url: "http://nats-srv:4222",
    });
    //

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (tickets-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();
```

# MOZEMO DA POKRENEMO SKAFFOLD KAKO BI VIDELI DA LI CE SE USPENO CONNECTOVATI TO NATS

- `skaffold dev`

I EVO IMAO SI OVAJ LOG FROM POD ELATED TO tickets MICROSERVICE, KADA JE SKAFFOLD ODRADIO SVOJE

```zsh
# ...
# ...
[tickets] 
[tickets]           Connected to Nats Streaming Server
[tickets]           clientId: tickets-stavros-12345
[tickets]         
[tickets] Connected to DB (tickets-mongo)
[tickets] listening on http://localhost:3000 INSIDE tickets POD
```

**DAKLE USPESNO KONEKCIJ NA NATS STREAMING SERVER JE USPESNA**

## U SLEDECEM BRANCHU, KORISTICEMO INSTANCU `NatsWrapper` KLASE DA NAPRAVIMO INSTANCU CUSTOM PUBLISHERA

I TO JE ISTA INSTANCA KOJU SMO KORISTILI ZA CONNECTING, JEDINO SMO TU INSTANCU I IZVEZLI DAJ KORISTIMO I PRI CONNECTINU ALI I PRILIKOM PRAVLJENJA PUBLISHERA ILI LISTENER-A

TAKODJE MORAMO DA NAPRAVIMO I CUSTOM PUBLISHER KLASU, OD KOJE CEMO DA NAPRAVIMO INSTANCU

***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***
***

# PUBLISHING TICKET CREATION

DAKLE POTREBNO JE POMENUTI EVENT PUBLISH-OVATI NAKON USPESNOG TICKET CREATION-A

A PRE TOGA MORAMO KREIRATI CUSTOM PUBLISHER KLASU EXTENDINGOM NASE BASE ABSTRACT `Publisher` KLASE



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


