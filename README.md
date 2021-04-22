# LISTENING FOR DATA

PIBLISHER JE SETTED, A SADA RADIM ONA IMPLEMENTACIJI LISTENERA

GOAL NASEG LISTENERA JE DA MU PODESIM OSUBJECT ODNOSNO CHANNEL KOJ IEL IDA LISTENUJE TO

TO PASS-UJEMO U stan CLIENT, KREIRAJUCI TAK OSUBSCRIPTIO

POSMATRACEMO SUBSCRIPTION ANY TIME IT RECEIVES THE DATA

- `code nats_test_project/src/listener.ts`

```ts
import nats from "node-nats-streaming";

// KASNIJE CU SE VRATITI I OBJASNITI OVE ARGUMENTE
// A ZA SADA IH APISUJ
const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

// WATCH-UJEM NA CONNECT EVENT
// I OVAJ CALLBACK CE SE DAKLE IZVRSITI PPO USPESNOJ KONEKCIJI
stan.on("connect", () => {
  console.log("Listener connected to nats");
});

```

NATS SERVER JE VEC EXPOSE-VAO PORT STO SAM PODESIO U PREDPOSLEDNJJEM BRANCH-U

STO ZNACI DA KADA POKRENEM I SCRIPT ZA LISTENERA, DA CE SE USPESNO OSTVARITI KONEKCIJA

NARAVNO OTVORICES NOVI TERMINAL, NE PREKIDAJUCI DVA VEC UPALJENA KOJA IMAS  

- `cd nats_test_project`

- `yarn listen`

IMACES I OVDE OSTVARENU KKONEKCIJU

```zsh
[INFO] 20:30:39 ts-node-dev ver. 1.1.6 (using ts-node ver. 9.1.1, typescript ver. 4.2.4)
Listener connected to nats
```

DAKLE IMACES HANGING TERMINAL, KOJI OPET TE NAPOMINJEM DA NE PREKIDAS

**BILO BI TI ZANIMLJIVO DA U SPLIT SCREEN-UU IMAS OTVOREN TERMINAL LISTENERA I TERMINAL PUBLISHER-A**

## TI MOZES POCITITI TERMINAL OD ONIH LOG-OVA NASTALIH OD `ts-node-dev`, TAK OSTO CES POKRENUTI `console.clear` NA POCETKU FILE-OVA

EVO POGLEDAJ

- `code nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";

// EVO OVDE MOZES POZVATI console.clear
console.clear();
// I TO CE POCIITI ONE LOGS KOJI NASTANU
// OD TOOLS SA KOJIM RUNN-UJES SCRIPT
// U OVOM SLUCAJU TO JE ts-node-dev

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

  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});

```

- `code nats_test_project/src/listener.ts`

```ts
import nats from "node-nats-streaming";

// I OVDE STAVLJAM console.clear
console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");
});

```

SADA IMAS CISTIJI OUTPUT U TERMINALU STRIKTNO NASTAO OD ONOGA STA SI DEFINISAO DA SE STAMPA

PUBLISHER TERMINAL:

```zsh
Publisher connected to NATS
Event published

```

LISTENER TERMINAL:

```zsh
Listener connected to nats
```

## RESTART `ts-node-dev` WHEN I WANT

U HANGING TERMIANLIMA, POKRENUTIM SA POMENUTIM, MOZES PROSTO KUCATI:

- `rs` KAO RESTART

I HITT-OVATI ENTER

***

IZGLEDA DA KOD MENE OVO NE FUNKCIONISE

ALI I NE ZNAM ZA STA BI MI TREBALO

***

DAKLE KOD MENE OVO NIJE RESTARTOVALO EXECUTABLE

A AUTOR WORKSHOPA POSTO JE 'HARDCODE'-OVAO PUBLISHING EVENTA (POZIVAO JE `stan.publish` U SAMOM CALLBACKU KOJI SE IZVRSAVA NAKON KONEKCIJE)

A KUCAJUCI `rs` U TERMINALU PUBLISHERA STALNO JE IZVRSAVAO RESTARTS, KAKO BI STALNO RESTARTOVAO

A TIME JE PUBLISHOVAO TAJ IVENT

TAKO DA AKO JE DOZEN TIMES RESTARTOVAO, DOZEN TIMES JE PUBLISH-OVAO EVENTS DO NATS STREAMING SERVERA

MEDJUTIM JA CU MORATI RUCNO RESTARTOVATI PUBLISHER-A

# SADA CU DA NAPRAVIM SUBSCRIPTION

- `code nats_test_project/src/listener.ts`

```ts
import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  // EVO PRAVIM SUBSCRIPTION NA "tickets:created" SUBSCRIPTION

  const subscription = stan.subscribe("ticket:created");

  // KROZ OVAJ OBJEKAT TREBAM RECEIVE-OVATI DATA
  // ALI VIDIS KAKO GORE NISAM DEFINISAO CALLBACK
  // JER CALLBACK JE NESTO SLICN OSTO BI KORISTIL DRUGI LIBRARIES
  //

  // TI CES OVDE USTVARI MORATI DEFINISATI NA KOJI TYPE EVENT-A
  // TVOJ SUBSCRIPTION LISTEN-UJE

  // JA SLUSAM NA "message" TYPE OF THE EVENT
  subscription.on("message", (msg) => {
    // ARGUMENT FUNKCIJE JESTE ACTUL MESSAGE
    // ODNOSNO DATA KOJI JE EVENT BUS PROSLEDIO IZ KANALA
    // KOJI SUBSCRIPTION LISTEN-UJE

    console.log({ msg });

    // msg NIJE RAW DATA, STO CES I VIDETI U TERMIANLU
  });
});

```

RESTARTUJ `yarn run publish` U TERMINALU PUBLISHERA

TO SAM RADIO I POSMTRAO SAM TERMIANL LISTNERA

EVO STA SE STAMPALO

```zsh
{
  msg: Message {
    stanClient: Stan {
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      clusterID: 'microticket',
      clientID: '123',
      ackSubject: '_STAN.acks.NHZ0FE9TCI02N7TSPUEIVO',
      pubPrefix: '_STAN.pub.gJdbZHGPGN7jortjoENBWo',
      subRequests: '_STAN.sub.gJdbZHGPGN7jortjoENBWo',
      unsubRequests: '_STAN.unsub.gJdbZHGPGN7jortjoENBWo',
      subCloseRequests: '_STAN.subclose.gJdbZHGPGN7jortjoENBWo',
      closeRequests: '_STAN.close.gJdbZHGPGN7jortjoENBWo',
      options: [Object],
      pubAckMap: {},
Listener connected to nats
{
  msg: Message {
    stanClient: Stan {
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      clusterID: 'microticket',
      clientID: '123',
      ackSubject: '_STAN.acks.84DPZIOVOZTVSH5L7NFPDB',
      pubPrefix: '_STAN.pub.gJdbZHGPGN7jortjoENBWo',
      subRequests: '_STAN.sub.gJdbZHGPGN7jortjoENBWo',
      unsubRequests: '_STAN.unsub.gJdbZHGPGN7jortjoENBWo',
      subCloseRequests: '_STAN.subclose.gJdbZHGPGN7jortjoENBWo',
      closeRequests: '_STAN.close.gJdbZHGPGN7jortjoENBWo',
      options: [Object],
      pubAckMap: {},
      pubAckOutstanding: 0,
      subMap: [Object],
      nc: [Client],
      ncOwned: true,
      hbSubscription: 1,
      pingInbox: '_INBOX.84DPZIOVOZTVSH5L7NFPLT',
      pingSubscription: 2,
      ackSubscription: 3,
      connId: <Buffer 38 34 44 50 5a 49 4f 56 4f 5a 54 56 53 48 35 4c 37 4e 46 50 51 32>,
      pingRequests: '_STAN.discover.microticket.pings',
      stanPingInterval: 5000,
      stanMaxPingOut: 3,
      pingBytes: <Buffer 0a 16 38 34 44 50 5a 49 4f 56 4f 5a 54 56 53 48 35 4c 37 4e 46 50 51 32>,
      pingOut: 0,
      pingTimer: Timeout {
        _idleTimeout: 5000,
        _idlePrev: [TimersList],
        _idleNext: [TimersList],
        _idleStart: 111427,
        _onTimeout: [Function: pingFun],
        _timerArgs: undefined,
        _repeat: null,
        _destroyed: false,
        [Symbol(refed)]: true,
        [Symbol(kHasPrimitive)]: false,
        [Symbol(asyncId)]: 176,
        [Symbol(triggerId)]: 169
      },
      [Symbol(kCapture)]: false
    },
    msg: {
      wrappers_: null,
      messageId_: undefined,
      arrayIndexOffset_: -1,
      array: [Array],
      pivot_: 1.7976931348623157e+308,
      convertedPrimitiveFields_: {}
    },
    subscription: Subscription {
      stanConnection: [Stan],
      subject: 'ticket:created',
      qGroup: undefined,
      inbox: '_INBOX.84DPZIOVOZTVSH5L7NFQ2T',
      opts: [SubscriptionOptions],
      ackInbox: '_INBOX.gJdbZHGPGN7jortjoENBcm',
      inboxSub: 5,
      _events: [Object: null prototype],
      _eventsCount: 1
    }
  }
}

```

DAKLE KASNIJE CU JA INSPECT-OVATI STA JE SVE NA OVOM OBJEKTU

**MENI JE VAZNIJE DA JE SUBSCRIPTION USPEO**

DATA JE ZAISTA DOBIJEN U LISTENERU, SLUSAJUCI ON EVENT TYPE "message"

STO ZNACI DA JE PUBLISHER POSLAO TOPIC, ODNOSNO CHANNEL , I SA NJIM DATA, A NATS STREAMING SERVER JE POSLAO POSALO DATA ONOM LISTENERU KOJI JE SUBSCRIBED NA TAJ TOPIC, ODNONO KOJI SLUSA TAJ CHANNEL

PROBAJ OPET DA RESTARTUJES `yarn run publish` U TERMINALU PUBLISHER-A
