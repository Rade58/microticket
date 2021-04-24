# EVENT REEDELIVERY

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

**SADA KADA SMO SVE POKRENULI HJDE DA VIDIMO KAKO CEMO DA CUSTOMIZE-UJEMO SUBSCRIPTION, DA KADA SE POKRENE DA MU USTVARI NATS STREAMING SERVER IZ EVENT HISTORY-JA POSALJE SVE EVENT-OVE KOJI SU SE DESILI AT SOME POINT IN TIME**

MEDJUTIM MORACES DA TURN-OFF-UJES [QUEUED GROUPS](https://github.com/Rade58/microticket/tree/6_0_7_QUEUE_GROUPS#queue-groups) (AKO SI ZABORAVI, SA NJIMA PODESAVAS DA EVENT DOLAZI DO SAMO JEDNOG LISTENERA AT THE TIME, JER SA QUEUE GROUPAMA, STVR JE OVAKVA: NATS POSALJES JEDAN EVENT I ON STIGNE DO JEDNOG LISTENERA I ON GA PROCESS-UJE A DRUGI NE I TAKO SE VALJDA NASUMICNO BIRA DA JEDNO MDOCE KOD JEDNOG, AP DRUGI EVENT MOZDA DODJE KOD ISTOG, PA TRECI PUT PROESS-UJE GA DRUGI I TAKO)

MENI QUEUED GROUPS SMETAJ UZA OVAJ EXAMPLE, MISLIM DA MOZES SHVATITI ZASTO

- `cat nats_test_project/src/listener.ts`

```ts

```
