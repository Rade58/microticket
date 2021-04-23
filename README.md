# MANUAL ACK MODE

PRVO DA TI KAZEM KAKO SE PODESAVAJU DODATNE SUBSCRIPTION OPCIJE

ONE SE MALO NESVOJTVENO PODESAVAJU; TI BI MISLIO DA SE DODAJE OBJEKAT SA NEKIM SETTINGSIM, ALI NIJE TAKO

RADI SE NEKAKV CHAINING, KORISCENJEM `stan.subsriptionOptions()`, EVO POGLEDAJ KAKO

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  // EVO OVAKO SE ZADAJU OPCIJE
  const options = stan
    .subscriptionOptions()
    .setMaxInFlight(2)
    .setDeliverAllAvailable()
    .setDurableName("");

  //
  const subscription = stan.subscribe(
    "ticket:created",
    "orders-microservice-queue-group",
    // PA SE TE OPCIJE DODAJU KAO TRECI ARGUMENT, AKI SI DEFINISAO
    // GORNJU QUEUE GROUP, A AKO NISI BILE BI DRUGI ARGUMENT
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
  });
});
```

NARAVNO SADA MENI NE TREBAJU NI JEDNE OD GORNJIH OPCIJA PA CU IH UKLONITI

**ALI KOJE SU OPCIJE WE ACTUALLY CARE ABOUT**

**JEDNU OPCIJU CU JA PODESAVATI ZA ALMOST EVERY SUBSCRIPTION THAT WE MAKE**

## PRE NEGO STO POKAZEM KOJA JE TO OPCIJA, NAJBOLJE BI BILO DA ZAMISLIM SCENARIO PO KOJEM JA IMAM MICROSERVICE KOJ ISU SUBSCRIBED NA SPECIFIED QUEUE GROUP; ALI ZAMISLI I DA MICROSERVICE STORE-UJE U DATBASE-U DATA KOJI DOLAZI SA EVENTOM

**ZAMISLI DA JE POKUSANO DA SE DATA STORE-UJE U DATABASE AL IDA JE TAJ PROCES FAIL-OVAO FOR SOME REASON**

MOZDAA SMO PRIVREMENO IZGUBILI DATBASE CONNECTION

MOZDA JE DOWN ZBOG NEKOG UPGRADING-A

MOZDA DTA KOJI POKUSAVAMO DA POSALJEMO JESTE INVALID I STORING JE REJECTED

**ZAMISLI DA MI TADA FAIL-UJEMO WITH SOME KIND OF ERROR**

`NA NESRECU, DEFAULT BEHAVIOUR ZA SUBSCRIPTION JESTE DA JE TAJ EVENT ESSENTIALLY LOST`

NE DOBIJAS NIAKAKV FOLLOW UP OPORTUNITY DA GA OPET PROCESS-UJES ILI NESTO SLICNO

SRECA JE DA JE OVO DEFAULT BEHVIOUR I DA GA MOZES CHANGE-OVATI

**MENI TREBA PRILIKA DA TAJ EVENT ATEMP-TUJEM DA REPROCESS-UJEM THE SECOND TIME**

# DA BI OMGUCIO DA SE EVENT REPROCESS-UJE NAKON FAILINGA PODESAVAM OPTION `.setManualAckMode(true)`

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  // EVO PODESAVAM TU OCIJU
  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-microservice-queue-group",
    // EVO PASS-UJEM OPTIONS
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
  });
});

```

**`Ack` JE SKRACENICA ZA `AKNOWLADGE`, A OPCIJA ZNACI DA TI MANUELNO MORA DA ACKNOWLEDGE-UJES NAZAD TO THE STREAMING SERVER, DA NISTA NIJE KENULO PO ZLU KADA JE EVENT DOSAO**

TO ZNAACI DA CES TI NESTO POSLATI NAZAD DO NATS STREAMING SERVERA DA KAZES DA JE SVE PROSLO OK, I DA JE NESTO USPESNO STORED TO THE DATBASE

**SADA AKO SE DESI DA ERROR BUDE THROWN INSIDE `"message"` HANDLER, PRE NEGO STO SI TI DEFINISAO STORING TO THE DATBASE, AK OJE TAJ STORING TO THE DATBASE THOW-OVAO ERROR, ONO STO BI JA SLOA DA AKNOWLEDG-UJE NATS STREAMING SERVERU DA JE SVE U REDU, SE NE BI UOPSTE POSLALO**

DAKLE NATS STREAMING SERVER CE ONDA CEKATI OKO 30 SEKUNDI DA DODJE POTVRDA, KOJA NARAVNO NECE DOCI JER TI JE DATABSE FAILED

**NAKON TOG VREMENA NATS STREAMING SERVER CE POSLATI ISTI EVENT DO NEKOG DRUGOG MEMBERA QUEUE GRUPE, ILI AKO NJEGA NEMA PONOVO CE BITI POKUSANO DA SE POSEALJE ISTI EVENT DO ONOG MICROSERVICE-A KOJI JE FAIL-OVAO RANIJE, KOJI RANIJE NIJE POSALO AKNOWLEDGMENT**

TI SADA NISI PODESIO NIKAKV AKNOWLEDGMENT

- `cat nats_test_project/src/listener.ts`

```ts
import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-microservice-queue-group",
    options
  );

  // KAO STO VIDIS INSIDE TI NISI DODAO NISTA ZA AKNOWLEDGMENT
  // DA JE SVE PROSLO OK

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
  });
});

```

POKUSACU SADA DA RESTARTUJEM PUBLISHER-A, CIME TI DAKLE PONAVLJAM PO STOTI PUT DA SAM PODESIO TAKO DA SE EVENT SALJE

**EVENT JE POSLAT, I VIDEO SAM U TERMIANL JEDNOG LISTENERA ,DA JE POSLAT, JER SE CODE STAMPAO, DAKLE EVENT JE DOSAO DO LISTENERA I TO NISTA NIJE SPPORNO**

**`ALI POSTO NISI DEFINISAO NIKAKAV AKNOWLEDGMENT, NATS STREAMING SERVER CE CEKATI 30 SEKUNDI PA CE POSLATI DRUGOM LISTENERU, ODNOSNO DRUGOM SUBSCRIPTIONU, ODNOSNO MEMBERU ISTE QUEUE GRUPE`**

OND CE I TAJ MEMEBER STAMPATI, PA NI TAMO NEMAS DEFINISAN AKNOWLWDGMENT

PA CE OPET NATS STREAMING SERVER CEKATI 30 SEKUNDI DA OPET POSALJE DRUGOM

I TERMINALI TVOJA DVA MAMBERA E SE PUNITI LOGOVIMA O USPESNO POSLATIM EVENTIM, NAIZMENICNO

JEDAN TERMIANL:

```zsh

```

DRUGI TERMIANL:

```zsh

```
