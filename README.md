# LISTENING FOR DATA; AND ACCESSING THE DATA ON THE LISTENER SIDE


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

**STMPAO SE MASIVAN OBJEKAT**

DAKLE KASNIJE CU JA INSPECT-OVATI STA JE SVE NA OVOM OBJEKTU

**MENI JE VAZNIJE DA JE SUBSCRIPTION USPEO**

DATA JE ZAISTA DOBIJEN U LISTENERU, SLUSAJUCI ON EVENT TYPE "message"

STO ZNACI DA JE PUBLISHER POSLAO TOPIC, ODNOSNO CHANNEL , I SA NJIM DATA, A NATS STREAMING SERVER JE POSLAO POSALO DATA ONOM LISTENERU KOJI JE SUBSCRIBED NA TAJ TOPIC, ODNONO KOJI SLUSA TAJ CHANNEL

PROBAJ OPET DA RESTARTUJES `yarn run publish` U TERMINALU PUBLISHER-A

OPET CE LISTENER RECEIVE-OVATI MESSAGE, I TO INSTANTNO, VAZNO JE DA SE KAZE INSTANTNO

## POKAZAO SAM TI VERY BASIC CHAIN OF PUBLISHING SOME DATA, AND RECEIVING SOME DATA

AKO MISLIS DA JE OVO SIMPLE, E PA VIDECE DA NIJE

U NASTAVKU I U SLEDECIM BRANCH-VIMA CEMO BLOW-OVATI LID ON COMPLEXITY

JER CE NEKI SMALL SETTINGS USTVARI DRAMATICNO CHANGE-OVATI KAKO NASA APLIKACIJA RADI

# HAJDE DA DAMO MALO BPLJ UTYPESCRIPT PODRSKU ONOM GORNJEM `msg` PARAMETRU CALLBACKU  ZA LISTENING FOR "message"

ON JE SADA any TYPE-A A TO MI NE ODGOVARA

- `code nats_test_project/src/listener.ts`

```ts
// EVO UVEZO SAM Message TYPE
import nats, { Message } from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  // EVO SAD SAM TYPE-OVA OMESSAGE
  subscription.on("message", (msg: Message) => {
    // EVO OVDE IMAM FUNKCIJU getData
    // PROBACU DA STMAPAM DATA

    const data = msg.getData();

    console.log({ data });
  });
});

```

OTISAO SAM U PUBLISHER TERMINLAL DA BI OPET RESTARTOVAO PUBLISHER-A SA `yarn run publish`

POGLEDAO SAM LISTENER TERMINAL

EVO STA SE INSTANTNO STAMPALO U LISTENER TRMIANLU

```zsh
{ data: '{"id":"123","title":"concert","price":20}' }
```

## DOKUMENTACIJA NATS STREAMING SERVERA USTVARI POKRIVA SOME NITTY-GRITTY DETAILS I ZATO JE BOLJE DA POSMATRAS TYPESCRIPT TYPE DEFINITIONS

TO KAO STO ZNAS RADIS SA `Ctrl + Alt + Click` NA SAMI NEKI INTERFACE

PROBAJ TO DA URADIS SA Message INTERFACE-OM I OTVORICE TI SE TYPE DEFINITION FILE I VIDECES OVO

```ts
declare class Message {
    /**
     * Returns the subject associated with this Message
     */
    getSubject():string;

    /**
     * Returns the sequence number of the message in the stream.
     */
    getSequence():number;

    /**
     * Returns a Buffer with the raw message payload
     */
    getRawData():Buffer;

    /**
     * Returns the data associated with the message payload. If the stanEncoding is not
     * set to 'binary', a string is returned.
     */
    getData():String|Buffer;

    /**
     * Returns the raw timestamp set on the message. This number is not a valid time in JavaScript.
     */
    getTimestampRaw():number;

    /**
     * Returns a Date object representing the timestamp of the message. This is an approximation of the timestamp.
     */
    getTimestamp():Date;

    /**
     * Returns a boolean indicating if the message is being redelivered
     */
    isRedelivered():boolean;

    /**
     * Returns an optional IEEE CRC32 checksum
     */
    getCrc32():number;

    /**
     * Acks the message, note this method shouldn't be called unless
     * the manualAcks option was set on the subscription.
     */
    ack(): void;
}
```

KAO STO VIDIS PRETTY MUCH SVE JE DOCUMENTED

## MEDJUTIM POSTOJE I DRUGE METODE msg-A

MEKE OD VAZNIJIH SU:

`getSubject` KOJI RETURN-UJE IME CHANNELLA I KOJEG JE MESSAGE POTEKAO (NJE NAM SUPER IMPORTANT DA ZNAMO IMA KANALA JER ZNAM ODA SMO PODESILI `"ticket:created"` KAO IME KANALA)

`getData` SAM TI VEC POKAZO I SASVIM JE JSNO DA SE TIME DOBIJA ONAJ DATA KOJI JE ORIGINALY PUBLISHER POSLAO DO NATS TREAMING SERVERA U SPECIFIED CHANNEL

VAZNA JE I

`getSequence`

ON CE PROSLEDITI BROJ EVENTA, DAKLE RECI CE KOJI JE TO EVENT PO REDU ZA RELATED KANAL

A BROJI SE OD 1

## KAO STO SE DATA MORA PUBLISH-OVATI KAO STRING, JASNO TI JE DA CE ON LISTENER SIDE TAJ DAT BITI STRING ,TAK ODA MORAS DA GA PARSE-UJES

- `code nats_test_project/src/listener.ts`

```ts
import nats, { Message } from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  const subscription = stan.subscribe("ticket:created");

  subscription.on("message", (msg: Message) => {
    const eventNumber = msg.getSequence();
    const topic = msg.getSubject();
    console.log({ topic, eventNumber });

    // DAKLE OVO JE JSON
    const data = msg.getData();

    // PRAVIMO JAVASCRIPT OBJECT
    // ALI TYPE JE MOGUCE DA BUDE Buffer ILI String (TKO KAZU TYPES)

    // ZATO MOZEMO NAPRAVITI OVU PROVERU

    if (typeof data === "string") {
      const dataObject = JSON.parse(data);

      // SADA MOZES DA ACCESS-UJES PROPERTIJIMA
      console.log(dataObject.title);
      console.log(dataObject.id);
      console.log(dataObject.price);
    }
  });
});
```

RESTARTOVAO SAM OPET PUBLISHING SCRIPT, ODNOSNO PUBLISHER-A, ZA KOJEG TI OPET NAPOMINJM DA PUBLISH-UJEM EVENT DIRETNO U connect CALLBACK-U I ZATO SE SALJE SAM AKO RESTARTUJEM (DAKLE U TERMIANLU PAUBLISHERA `Ctrl +C` PA `yarn run publish`) (A UMESTO OVOG GASENJA PALJNJ MOZES DODATI EXTRA RED PA SAVE-OVATI nats_test_project/src/publisher.ts I TAKO CES RESTARTOVATI)

EVO STA SE SE INSTANTNO STAMPALO U LISTENER TERMINALU

```zsh
{ topic: 'ticket:created', eventNumber: 12 }
concert
123
20
```
