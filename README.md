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
