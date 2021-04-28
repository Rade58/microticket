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

