# EVENT REDELIVERY; DURABLE SUBSCRIPTIONS

DAKLE KADA PUBLISHER SALJE EVENT DO NEKOG KANALA (NA PRIMER "acount:deposit" KANALA), TAJ EVENT CE NATS STREAMING SERVER STORE-OVATI U TOM KANALU KOD SEBE

NATS CE POKUSATI DA DELIVER-UJE TAJ EVENT DO NEKOG MICROSERVICA KOJI JE SUBSCRIBED NA EVENT IZ TOG KANALA ,ALLI DAKLE STORE-OVACE TAKODJE TAJ EVENT U NESTO STA SE ZOVE `Event History`

**KADA DODAJES NEKI NOVI MICROSERVICE, ZA KOJ IZELIS DA BUDE I SUBSCRIBER NA I EVENTE IZ NEKOG KANAL NATS STREMING SERVERA; MOZES CUSTOMIZE-OVATI SUBSCRIPTION I RECI JOJ DA SOMEHOW GRAB-UJE ILI GETT-UJE TU LISTU EVENT-OVA, KOJI SU EMITTED AT SOME POINT IN THE PAST**

HAJDE SADA DA VIDIMO KAKO CEMO TO URADITI

***
***

ALI PRE TOGA PONOVO DA POKRENEMO ONAJ NAS SUBPROJECT, ONAJ NAS TEST PROJECT IZ FOLDERA `nats_test_project`

PRVO CEMO DA USTVARI EXPOSE-UJEMO PORT NASEG NATS STREAMING SERVERA KOJI JE DEPLOYED NA CLUSTERU

- `kubecctl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-865bdcff84-zq5c8            1/1     Running   0          2d1h
auth-mongo-depl-fff5dcdd9-lhwz7       1/1     Running   0          2d1h
client-depl-68d8f8cbd5-wpcl5          1/1     Running   0          2d1h
nats-depl-f878fb4f9-k6fgq             1/1     Running   0          2d1h
tickets-depl-6b9c6b485c-lsvgq         1/1     Running   0          2d1h
tickets-mongo-depl-8456f7b84c-8bbzl   1/1     Running   0          2d1h
```

- `kubectl port-forward nats-depl-f878fb4f9-k6fgq 4222:4222`

SADA JE EXPOSED PORT NATS STREAMING SERVER-A

**DALJE, IMAMO PUBLISHER-A**

- `cat nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  // IZ KOJG SE PUBLISH-UJE EVENT U SPECIFICIRANI KANAL
  // ODMAH PO KONEKTU
  // ALI KAO SE SECAS MI SMO TO TAKO PODESILI DA
  // BI EVENTE SLAO RESTARTINGOM SAMO SCRIPTA KOJI POKRECE OVAJ FILE
  // OVO JE SAMO DAKLE ZA TESTIRANJE
  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
```

GORNJEG PUBLISHERA POKRECEMO SA

- `cd nats_test_project`

- `yarn run publish`

A RESTARTUJEMO GA DA BI SLALI EVENTS (**RESTARTUJEMO GA NAJLAKSE UBCAIVANJEM RANDOM KOMENTARA I SAVINGOM**) (OPET TI NAPOMINJEM DA OVO OVAKO RADIM SAMO U CILJU PROBANJA I TESTIRANJA)

**A OVO JEE NAS LISTENER**

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

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-microservice-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);

    msg.ack();
  });
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
```

I LISTNERA POKRECEMO SA

- `cd nats_test_project`

- `yarn listen`

***
***

SADA KADA SI SVE POKRENUO TI IMAS NATS STREAMING SERVER

JEDNOG PUBLISHERAA KOJI GOVORI SA NATSOM

I JEDDNOG LISTENERA KOJI DOBIJA EVENTE OD NATS-A

***
***

# EVENT REDELIVERY

**SADA KADA SMO SVE POKRENULI HJDE DA VIDIMO KAKO CEMO DA CUSTOMIZE-UJEMO SUBSCRIPTION, DA KADA SE POKRENE DA MU USTVARI NATS STREAMING SERVER IZ EVENT HISTORY-JA POSALJE SVE EVENT-OVE KOJI SU SE DESILI AT SOME POINT IN TIME**

MEDJUTIM MORACES DA TURN-OFF-UJES [QUEUED GROUPS](https://github.com/Rade58/microticket/tree/6_0_7_QUEUE_GROUPS#queue-groups) (AKO SI ZABORAVI, SA NJIMA PODESAVAS DA EVENT DOLAZI DO SAMO JEDNOG LISTENERA AT THE TIME, JER SA QUEUE GROUPAMA, STVR JE OVAKVA: NATS POSALJES JEDAN EVENT I ON STIGNE DO JEDNOG LISTENERA I ON GA PROCESS-UJE A DRUGI NE I TAKO SE VALJDA NASUMICNO BIRA DA JEDNO MDOCE KOD JEDNOG, AP DRUGI EVENT MOZDA DODJE KOD ISTOG, PA TRECI PUT PROESS-UJE GA DRUGI I TAKO)

MENI QUEUED GROUPS SMETAJU ZA OVAJ EXAMPLE, MISLIM DA MOZES SHVATITI ZASTO, ZATO STO ZELI MDA KADA SE EVENT POSALJE DA TAJ JEDAN EVENT IDE SVIM SUBSCRIBERIMA A NE SAMO JEDNOM

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

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    // DA NEKAKO KAZES NATS STREAMING SERVERU DA ZELIMO DA
    // REDELIVER-UJEMO, ILI GER-UJEMO messageS ,ODNOSNO EVENTS KOJI SU SE DELIVER-OVALI
    // IN THE PAST, DODAJEMO JOS JEDNU OPCIJU TO THE LIST OF OPTIONS
    // A MOZES DA SAZNAS KOJA JE TO OPCIJA TAKO STO CES KLIKNUTI
    // SA CTRL + ALT + CLICK NA subscriptionOptions
    // IZABRAO SAM OVU OPCIJU
    .setDeliverAllAvailable() // DAKLE CHAIN-OVAO SAM OVU OPCIJU
    //
    .setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    // DAKLE UKLANJAM QUEUE GROUPS
    // "orders-microservice-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);

    msg.ack();
  });
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});

```

**CIM SAVE-UJES (CIME CE ts-node-dev RESTARTOVATI, ODNONO PONOVO RUNN-OVATI FILE AGAINST NODE EXECUTABLE, **STO ZNACI DA KOA DA JE UNISTIO JEDNOG LISTENER, PA POKRETANJEM FILE NAPRAVIO NOVOG, ODNOSNO NOVI SUBSCRIPTION**) VIDECES DA CE SE U TERMINALU LISTNERA STAMPATI SVI EVENT-OVI, KOJE SAM PUBLISH-OVAO DO NATAS SERVERA, DAKLE NATS STRAMING SERVER JE UZEO SVE EVENT-OVE IZ HISTORY-JA, KOJE JE TAMO STAVIO TOKOM SVOG RADA, A KOD MENE JE RADIO DVA DNA, DVA DANA SAM SE S NJIM IGRAO SALJUCI MU EVENTOVE**

```zsh
Received event #1, with data: {"id":"123","title":"concert","price":20}
Received event #2, with data: {"id":"123","title":"concert","price":20}
Received event #3, with data: {"id":"123","title":"concert","price":20}
Received event #4, with data: {"id":"123","title":"concert","price":20}
Received event #5, with data: {"id":"123","title":"concert","price":20}
Received event #6, with data: {"id":"123","title":"concert","price":20}
Received event #7, with data: {"id":"123","title":"concert","price":20}
Received event #8, with data: {"id":"123","title":"concert","price":20}
Received event #9, with data: {"id":"123","title":"concert","price":20}
Received event #10, with data: {"id":"123","title":"concert","price":20}
Received event #11, with data: {"id":"123","title":"concert","price":20}
Received event #12, with data: {"id":"123","title":"concert","price":20}
Received event #13, with data: {"id":"123","title":"concert","price":20}
Received event #14, with data: {"id":"123","title":"concert","price":20}
Received event #15, with data: {"id":"123","title":"concert","price":20}
Received event #16, with data: {"id":"123","title":"concert","price":20}
Received event #17, with data: {"id":"123","title":"concert","price":20}
Received event #18, with data: {"id":"123","title":"concert","price":20}
Received event #19, with data: {"id":"123","title":"concert","price":20}
Received event #20, with data: {"id":"123","title":"concert","price":20}
Received event #21, with data: {"id":"123","title":"concert","price":20}
Received event #22, with data: {"id":"123","title":"concert","price":20}
Received event #23, with data: {"id":"123","title":"concert","price":20}
Received event #24, with data: {"id":"123","title":"concert","price":20}
Received event #25, with data: {"id":"123","title":"concert","price":20}
Received event #26, with data: {"id":"123","title":"concert","price":20}
Received event #27, with data: {"id":"123","title":"concert","price":20}
Received event #28, with data: {"id":"123","title":"concert","price":20}
Received event #29, with data: {"id":"123","title":"concert","price":20}
Received event #30, with data: {"id":"123","title":"concert","price":20}
Received event #31, with data: {"id":"123","title":"concert","price":20}
Received event #32, with data: {"id":"123","title":"concert","price":20}
Received event #33, with data: {"id":"123","title":"concert","price":20}
Received event #34, with data: {"id":"123","title":"concert","price":20}
Received event #35, with data: {"id":"123","title":"concert","price":20}
Received event #36, with data: {"id":"123","title":"concert","price":20}
Received event #37, with data: {"id":"123","title":"concert","price":20}
Received event #38, with data: {"id":"123","title":"concert","price":20}
```

**I SADA AKO RESTARTUJES I DALJE CE SE STAMPATI SVI OVI EVENTOVI**

I AKO ODLUCIS DA OTVORIS NOVI TERMIANL I PKRENES NOVOG LISTENERA STAMAPCE SE SVI EVENTOVI I KOD NJEGA, DAKE I NJEMU CE SVI EVENTOVI BITI POSLATI

DAKLE OVO JE ZAISTA HANDI AKO MICROSERVICE GOES DOWN

DOBICE SVE EVENTOVE, KOJI SU BILI EMMITED

## ALI TU POSTOJI DOWNSIDE

STA AKO TI APLIKACIJA RUNN-UJE MONTS ILI YEARS, I NEKI SERVICE TI SAMO NAKRATO GOES DOWN, I VRATI SE

**PA OPET BI DOBIO SVE EVENTS**

PA MOZE DOBITI HILJADE, MA STA HISLJADE, MILIONE EVENTOVA, KOJI SU SAVED UP

DAKLE IN  LONG TERM NIJE SUPEE FEASIBLE

TAKO DA SE USUALLY NE KORISTI `.setDeliverAllAvailable()` OPTION, VEC SE ONA KORISTI SA JEDNOM DRUGOM OPCIJOM

# DURAABLE SUBSCRIPTION

OVO JE COMPLEMENTARY OPTION, POMENUTOJ IDEJI REDELIVERING-A SVIH EVENTS KOJI SU SE DESILI IN THE PAST

OVAJ SUBSCRIPTIO NCE SE DESITI KADA KREIRAMO **IDENTIFIKATORA ZA SUBSCRIPTION**

DA PRVO VIDIMO KAKO SE TO RADI

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

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    // DAKLE UZ OVO
    .setDeliverAllAvailable()
    // PODESAVAM I OVO
    // DODAJEM STRING KOJI CE SLUITI KAO NAME ILI IDENTIFIER
    // ZA SUBSCRIPTION
    // OBICNO TREBAS DA MU DAS SAME NAME, KAKO TI SE ZOVE OVERAL MICROSERVICE
    // NA PRIMER STAVIO BI "orders-service" ILI "accounting-service"
    .setDurableName("some-microservice");

  const subscription = stan.subscribe(
    "ticket:created",
    // "orders-microservice-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);
    }

    console.log(`Received event #${msg.getSequence()}, with data: ${data}`);

    msg.ack();
  });
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
```

## ALI STA JE USTAVRI DURABLE SUBSCRIPTION?

NATS STREMING SERVER CE ZABELEZITI KOD SEBE KOJI SU DURABLE SUBSCRIPTIONS, ODNONO ZABELEZICE DURABLE NAME

PA MORAS DA POSMATRAS SCENARIO

**KADA SE TAJ EVENT, KOJI JE POVEZAN SA DURABLE SUBSCRIPTION-OM, ILI DA KAZEM SA DURABLE NAME-OM, USTVARI PROCESS-UJE, NATS STREAMING SERVER CE GA OBELEZITI KOD SEBE DA JE PROCESSED**

SADA RECIMO DA IMAS DVA EVENTA KOJA SU ECHOED IZ NATS STREAMING SERVERA, A DA SU LISTENERI DOWN FOR SOME REASON

PA NATS POKUSAVA DA IH DELIVER-UJE, ALI POSTO NEMA AKNOWLEDGEMENT-A DA SU PROCESSED, **NATS IH KOD SEBE BELEZI KAO UNPROCESSED EVENTS, RELETED TO DURABLE NAME**

RECIMO DA SE MICROSERVICE VRATI (BITNO JE RECI MICROSERVICE, KOJII JE RELATED TO DURABLE NAME), DA SE RECONNECT-UJE; **PA POKUSACE SE REDELIVER, ALI NATS NECE SLATI ALREADY PROCESSED EVENTS RELATED TO DURABLE NAME**

I KADA SE PROCESS-UJU TI EVENT-OVI, NAKON AKNOLEDGEMENT-A CE IH NATS ZABELEZITI KAO PROCESSED

## DAKLE DURABLE SUBSCRIPTION IS FANTASTIC IN MAKING SURE DA NASI SERVICE-OVI NIKAD NE MISS-UJU EVENTS

ALI TAKODJE MI POMAZU DA NE REPROCESS-UJEM ALREADY PROCESSED EVENTS

I BITNO JE RECI DA DURABLE SUBSCRIPTIONS NE RADE BEZ OPCIJE setDeliverAllAvailable

A ZAKLJUCI SAM ZASTO JE TO TAKO, **A POGLEDAJ I OSTATAK VIDEO-A 14-21**
