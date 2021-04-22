# PUBLISHING EVENTS

DAKLE IMAM LIVING KONEKCIJU SA NATS SERVEROM, A KAKO SAM TO URADIO ZA POTREBU TEST PROJECTA VIDI U PROSLOM BRANCHU

SADA CU POKUSATI DA EMMIT-UJEM EVENTS

ODNOSNO ZELIM DA PUBLISH-UJEM DATA

ALI ZELIM DA TI KAZEM KAKO CE TO ICI

SA LEVE STRANE ZAMISLI DA IMAS PUBLISHERA I IMAS LISTENERA

PUBLISHER SI NAPRAVIO (stan client), ALI ZAMISLI DA IMAS I LISTENER-A

SA DESNE STRNE JE TVOJ NATS STREAMING SERVER

**SOME LIST OF CHANNELS SE NALZI U NATS STREAMING SERVERU**

MI MORAMO PUBLISH-OVATI INFO TO A SPECIFIC CHANELL

NA STRANI PUBLISHERA, KREIRACEMO OBJECT ILI SLICNO, A DODACEMMO I SUBJECT, A TO JE USTVARI IME CHANNELA ,SA KOJI MZELIMO DA SHARE-UJEMO INFORMACIJU

NA PRIMER DATA JE NEKI INFO O TICKETU KOJI JE CREATED U NASEM APP-U (OBJECAT SA ID-JEM PRICE-OM I TITLE-OM)

SUBJECT, ODNOSNO NAME OF THE CHANNEL SA KOJI MZELIMO DA SHARE-UJEMO INFORMACIJU TREBA DA BUUDE IME KOJE DESCRIBE-UJE TYPE OF DATA KOJI SHARE-UJEMO

MI SAHRE-UJEMO TICKET DATA, KOJI JE RELATED SA CREATION-OM OF THAT TICKET DATA

**PREMA TOME NAME OF THE CHANNEL BI BIO `ticket:created`**

KADA PUBLISHER REACH-UJE OVER RECI CE, ZELIM DA SHARE-UJEM SOME DATA OVER THIS SPECIFIED CHANNEL 

**ONDA CE STREAMING SERVER DODATI TAJ `ticket:created` TOPIC, ILI CHANNEL NAME, TO THE OVERALL LIST OF CHANELLS**

ONDA CE UZETI NAS DATA I BROADCAST-OVATI IZ TOG KANALA, TO ANYONE WHO IS LISTENING

POSTO TRENUTNO NAMMO LISTENERA, NATRS SERVER CE RECI "OK I WILL TRY TO DO THIS BUT NOONE IS REALLY LISTENING"; DAKLE DATA IDE INTO THE VOID

AT SOME TIME WHEN WE CREATE LISTENER

**KADA KREIRAMO LISTENER U NJEMU CEME SPECIFICIRATI I SUBJECT (CHANELL) TO LISTEN TO**

U NASEM SLUCAJU TO CE BITI `ticket:created`

MI CEMO U LISTENERU TAJ SUBJECT PASS-OVATI ISTO DO stan CLIENT-, ODNOSNO SETT-OVACEMO GAA

TAKO CE LISTENER RECI STREAMING SERVERU DA JE SUBSCRIBED NA ANY INFORMATION THAT IS PUBLISHED THROUG THAT CHANNEL, I DA ZELIMO KOIJU TE INFORMACIJE

INFORMACIJU LISTENER RECEIVE-UJE U NECEMU STO SE ZOVE SUBSCRIPTION

SUBSCRIPTION CE ESSENTIALLY DA LISTEN-UJE FOR SOME INFORMATION I RECI CE NAM KADA JE SOME INFO RECEIVED

TO SU BILI NEKI INPORTANT PIECES OF TERMINOLOGY

# SADA CEMO POKUSATI A PUBLISH-UJEMO AN EVENT

- `code nats_test_project/src/publisher.ts`

```ts
import nats from "node-nats-streaming";

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // OVO JE DATA, KOJI CU PUBLISH-OVATI
  // NA PRIMER OVO JE TICKE KOJI JE KREIRAN
  // MEDJUTIM MI MOZEMO SHARE-OVATI SMO STRINGS,
  // ODNOOSNO RAW DATA
  // ZATO MORAMO CONVERTOVATI TO JSON
  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });
  // GORNJI data JE U WORLDU OF EVENTS INATS
  // COMMONLY REFERED AS message
  // DAKLE KORISTICU TAJ TERMIN U BUDUCNOSTI

  // POZIVAM stan.publish

  // PRVO IDE SUBJECT (CHANELL) PA ONDA DATA
  // A THIRD OPTIONAL ARGUMENT JE CALLBACK FUNCTION
  // FUNKCIJA CE BITI INVOKED AFTER WE PUBLISH DATA
  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
```

KADA SAM SAVE-OVAO FILE, POGLEDAO SAM ONAJ TERMINAL, GDE SAM EXECUTE-OVAO SCRIPT DA BI STARTOVAO PUBLISHERA, VIDEO I OVO

```zsh
[INFO] 20:03:19 Restarting: /home/eidolonro/PROJECTS/GITHUB IMPORTANT /EXPLORING MICROSERVICES/2_microticket/nats_test_project/src/publisher.ts has been modified
Publisher connected to NATS
Event published
```

JER KADA SI SAVE-OVAO, ONAJ ts-node-dev (SPECIFICIRAN U SCRIPT-U) ODGOVORAN JE I ZA RESTARTING EXECUTBLE-A NODEJS-A KADA NESTO PROMENIMO

TAKO DA SE PUBLISHER ODMAH RESTARTOVAO ZA NAS

I VIDELI SMO DA JE I EVENT PUBLISHED
