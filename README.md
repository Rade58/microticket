# NATS STREAMING SERVER ENVIROMENT VARIABLES

KAO STO SAM TO RADIO I ZA NEKE DRUGE STVARI, KAO STO JE MONGO_URI, MOGU PODESITI DA PARAMETRI ZA CONNECTING NA NATS STREAMING SERVER, USTVARI BUDU SETTED KAO ENV VARIABLES ,ZA tickets MICROSERVICE, JER SAM TRENUTNO SAM OKONEKTOVAO NATS STREAMING SERVER SAMO ZA POMENUTI MICROSERVICE

- `code infra/k8s/tickets-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets
  template:
    metadata:
      labels:
        app: tickets
    spec:
      containers:
        - name: tickets
          image: eu.gcr.io/microticket/tickets
          env:
            # ----- EVO OVE DVE ENV VARIABLE SAM DODAO -----
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: microticket
            # ----------------------------------------------
            - name: MONGO_URI
              value: 'mongodb://tickets-mongo-srv:27017/tickets'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-srv
spec:
  selector:
    app: tickets
  type: ClusterIP
  ports:
    - name: tickets
      protocol: TCP
      port: 3000
      targetPort: 3000

```

**VIDIS DA NISAM PODESIO `NATS CLIENT ID`**

SECAS DA `ON TREBA DA BUDE UNIQUE ZA ANY CLIENT KOJI KONEKTUJEMO TO NATS`

KADA BI HARDCODE-OVAO TU VREDNOST, ILI KADA BI JE PODESIO KAO ENV VARIABLE, **U SLUCAJU DA IMAS VISE INSTANCI tickets MICROSERVICE-A, IMAO BI PROBLEM, JER BI SVE KOPIJE MICROSERVICE-A POKUSALE DA PODESE CLIENTA SA TO MVREDNOSCU** 

AKO SE SECAS NASEG SUBPROJETA (`nats_test_project`), TAMO SMO GENERISALI CLIENT ID, ZaDAJUCI NEKU ANDOM HEX VREDNOST

MEDJUTIM, NE TREBA CEO TAJ ID DA BUDE RANDOMLY GENERATED; **ON TREBA DA IMA I JEDAN HARCODED DEO KOJI BI UKAZIVO NA TO, U KOJEM SE TO MOCROSERVICE-U ON NALAZI**

JER DA NEMAS NISTA STO JE KONKRETNIJE, U ID-JU CLIENTA, IMAO BI PROBLEEMA, AKO AT SOME POINT OF TIME POZELIS DA POGLEDAS LOGS U NASEM NATS STREAMING SERVERU (A I TO SAM TI POKAZO KAKO SE RADI (PREKO POSEBNOM PORTA (SAMO TE PODSECAM) ))

TI TADANE BI ZNAO O KOJEM SE CLIENTU RADI CITAJUCI LOGS, JER SVI BI IMALI GENERATED ID BY SOME GENERATION FUNCTION

# ILI JOS BOLJE, TREBALO BI NATS CLIENT ID VEZATI ZA NAME OF THE POD-A U KOJEM RUNN-UJE TVOJ MICROSERVICE

EVO GLEDAJ NA TO NA SLEDECI NACIN

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-6d9dd7d7bd-gkgjb            1/1     Running   0          33h
auth-mongo-depl-599b445d5-kknml       1/1     Running   0          33h
client-depl-65b44c89-vjqhb            1/1     Running   0          33h
nats-depl-954fc65b7-bbkct             1/1     Running   0          33h
tickets-depl-676bbbf7cf-nwhrq         1/1     Running   0          33h
tickets-mongo-depl-7c449c6999-xwznh   1/1     Running   0          33h

```

DAKLE KADA BI ODLUCIO DA SCALE-UJES MICROSERVICE HORIZONTALNO , ODNOSNODA IMAS VISE POD-VA, KOJI SVI RUNN-UJU ISTI MICROSERVICE, SVAKI OD PODOVA BI IMAO RAZLICIT ID

TI RECIMO IMAS JEDAN POD U KOJEM TI JE `tickets` MICROSERVICE, I TO JE OVAJ POD: `tickets-depl-676bbbf7cf-nwhrq`

A DA IH IMAS TRI SVAKI BI IMAO RANDOM GENERATED DEO U SVOM NAME-U `tickets-depl-<neki generated string, poseban za pod>`

# TAKO DA BI BILO LEPO DA FIGURE-UJES NACIN, PO KOJEM CES ZA NATS CLIENT ID, KORISTI ISTI NAME, KAO STO IMA POD, U KOJEM JE MICROSERVICE

ISTO TO MOGU PODESITI KROZ DEPLOYMENT KONFIGURACIJU

- `code infra/k8s/tickets-depl.yaml`

ISTO TO PODESAVAM KAO ENV VARIABLE, ALI ZA VALUE TE ENV VARIABLE, MORAM RECI KUBERNETESU DA PROVIDE-UJE NAME OF THE POD, KOJI JE RANDOMLY GENERATED

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  # OVO JE VAZNO, VIDECES I ZASTO
  name: tickets-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets
  template:
    metadata:
      labels:
        app: tickets
    spec:
      containers:
        - name: tickets
          image: eu.gcr.io/microticket/tickets
          env:
            # ---------- EVO OVO DODAJEM -------------------
            # I UMESTO DA PODSEM value KAO KOD DRUGIH VARIJABLI
            # JA PISEM      valueFrom
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            # ----------------------------------------------
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: microticket
            - name: MONGO_URI
              value: 'mongodb://tickets-mongo-srv:27017/tickets'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-srv
spec:
  selector:
    app: tickets
  type: ClusterIP
  ports:
    - name: tickets
      protocol: TCP
      port: 3000
      targetPort: 3000
```

REFERENCIRAO SAM `metadata.name`

SADA SVAKI PUDA KDA SE KREIRA POD ZA RUNNING ticets MICROSERVICE-A, KUBERNATES CE POGLEDATI U IME POD-A I PROVIDE-OVACE GAA KAO ENVIROMENT VARIABLE INSIDE OF OUR CONTAINER

A VARIJABLI SAM DAO IME `NATS_CLIENT_ID`

# MOZEM OSADA DA U CODEBASE-U, IZSKORISTIMO POMENUTE VARIJABLE

- `code `

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

  // NARAVNO, PROVERAVAMO SVE VARIJABLE
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  //

  try {
    // EVO UMESTO OVOGA
    /* await natsWrapper.connect("microticket", "tickets-stavros-12345", {
      url: "http://nats-srv:4222",
    }); */
    // DEFINISEM OVO ------------------------
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );
    // --------------------------------------

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

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


