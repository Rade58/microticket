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
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    // ---------------------------------
    // EVO OVDE BI NAPRAVIO CONNECTING
    // ---------------------------------

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

**MEDJUTIM TREBACE TI I `node-nats-streaming` PAKET**

- `cd tickets`

- `yarn add node-nats-streaming`

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

## MORAMO, PRVO, TAKORECI KREIRATI STAN CLIENT-A, JER NAM ON TREBA DA BISMO INSTATICIZIRALI GORNJEG CUSTOM PUBLISHER-A

**I NAJBOLJE DA GA KREIRAMO INSIDE index.ts FILE, JER SOM TAMO ISTO PODESAVALI I DRUGE CONNECTING LOGIKE**

TU SAM DEFINISO CONNECTIONG TO THE DATBASE, NAKON TOGA TAKODJE SAM START-OVAO NASU EXPRESS APLIKACIJU




