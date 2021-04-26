# GRACEFUL SHUTDOWN

POKAZAO SAM TI U NASEM TEST PROJEKTU KAKO SE DEFINISE [GRACEFUL SHUTDOWN](nats_test_project/src/listener.ts) ZA CLIENT-A

REKAO SAM TI DS GRACEFULL SHUTDOWN DEFINISEM ZATO DA ONDA KADA SMO ODLUCILI DA ZAUSTAVIMO CLIENTA, ODNOSNO KADA NODE PROCESS NA KOJEM RUNN-UJE NAS APP ODLUCIMO DA ZAUSTAVIMO, SA NA PRIMER Ctrl + C, DA NATS STREAMING SERVER NE POMISLI DA JE TO ZBOG NEKOG TEMPORRY LATENCY-JA ILI NECEG DRUGOG, PA POKUSA DA UNPROCESSED EVENT REPOSALJE

MI TO NE ZELIMO

ZELIMO DA TACNO SLUSAMO DA ZATVARANJE NODE PROCESS-A, PA DA TO KAZEMO NASTS CLIENTU, KAKO BI NATS CLIENT PRENEO INFO DO NATS STREAMING SERVERA DA VISE NE SALJE EVENTS, JER CLIENT SE NAMERNO GASI

**NARAVNO OVO JE RELEVANTNO SAMO ZA CLIENT, KOJEG KORISTIM OZA SUBSCRIPTION, ODNOSNO RELEVANTNO JE SAMO KOD LISTENERA**

ALI MI CEMO ISTOG CLIENTA, KOJEG SMO KONEKTOVALI NA NATS STREMING SERVER, KORISTITI I ZA PUBLISHING I ZA LISTENING

TAK ODA U OKVIRU `WrapperClient` KLASE MOZEM ODEFINISATI I GRACEFUL SHUTDOWN LOGIKU, ODNONO U connect METODI

**ALI TO NE BISMO TREBALI URADITI, JER TO JE LOSE**

EVO I ZASTO

OVO TI JE PIECE OF CODE KOJOM MOZEMO DEFINISATI GRACEFUL SHUTDOWN

```ts
// OVO SLUSA NA `Ctrl + C`
// ODNOSNO NA TERMINTATION  IINTERUPTION
// STO ZNACI AKO SE DESI TAJ INTERUPTION ILI TERMINATION
// MI GOVORIMO NODE PROCESU
// DA SE NE GASI VEC DA SACEKA DA MI NESTO ODRADIMO
// A MI POKUSAVAMO A ZATVORIMO NATS CLIENTA, SA
// stan.close()
process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});

// A OVO SLUSA NA CLOSE stan CLIENT-A
// I KADA CLIENT SAFELY PREKINE KONEKCIU SA NATS STEAMING 
// SERVEROM

stan.on("close", () => {
  console.log("NATS connection closed!");

  // MI TADA MOZEMO ZATVORITI NODE PROCESS
  process.exit();
});
```

**ALI ZATVARANJE NODE PROCESS-A U NEKOM PIECE-OF CODE ,KOJI CES KORISTITI SIROM SVOG CODEBASE (NE KAZEM DA BI TI TO RADIO SA KLASOM `WrpperClient` ALI TO JE IPAC CLASS, I MOZE SE INSTATICIZIRATI MNOGO PUT (IAKO JA NECU VISE OD JEDNOM PO MICROSERVICE-U)), JE OPASNO I NE TREBA SE RADITI**

ZATO GORNJI CODE NE TREBA DA BUDE DEO NEKE METODE `WrapperClient` INSTANCE, JER BI ONDA POTENCIJALNO OVAJ CODE: `process.exit()` BIO U MOGUCNOSTI DA IZAZOVE NESTO NEPREDVIDJENO

TO SE PROSTO NE RADI TAK OSLOBODNO

# ZATO JE, POMENUTU LOGIKU GRACEFUL SHUDOWN-A, BOLJE DEFINISATI U index.ts FAJLU

- `code tickets/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    await natsWrapper.connect("microticket", "tickets-stavros-12345", {
      url: "http://nats-srv:4222",
    });

    // EVO OVO JE DOBRO MESTO ZA DEFINISANJE GRACEFUL SHUTDOWN-A
    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {

      // OVDE ZELIM DA STAMPAM NESTO SAMO
      // ZATO STO OVO ZELIM JEDNOM DA TESTIRAM
      console.log("Connection to NATS Streaming server closed")

      process.exit();
    });
    //  -----------------------------------------------------

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

**MOZES SADA DA RESTARTUJE SKAFFOLD**

- `skaffold dev`

ZELIM DA TESTIRAM OVAJ GRACEFUL SHUTOWN; **A TO MOGU PROSTO URADITI DELETING-OM POD-A U KOJEM JE NATS STREAMING SERVER**

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-7c986d45d9-5mvh6            1/1     Running   0          3m43s
auth-mongo-depl-5c78b6dbf7-l7hbq      1/1     Running   0          3m43s
client-depl-9b4c8bf94-mvc9x           1/1     Running   0          3m43s
nats-depl-df8968775-wbwqt             1/1     Running   0          3m42s
tickets-depl-58d78c5c56-8gwxl         1/1     Running   0          3m41s
tickets-mongo-depl-65cfdd4b79-r9c4x   1/1     Running   0          3m41s
```

- `kubectl delete pod nats-depl-df8968775-wbwqt`

OVO SAM ODMAH VIDEO U SKAFFOLD-OVOM TERMINALU

```zsh
[tickets] Connection to NATS Streaming server closed
```

DAKLE PROCESS JE USPENO KILLED (I POSTIGNUT JE GRACEFULL SHUTDOWN, ODNOSNO DISCONECTING CLIENT FROM NATS STREAMING SERVER, PRE NEGO STO JE PROCESS EXIT-OVAO)

**NARAVNO, UBRZO POD SE PONOVO AUTOMTSKI NPRAVIO, I VIDEO SAM ONU PORUKU O USPESNOM CONNECTINGU TO NATS**
